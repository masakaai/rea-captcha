from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable
import inspect
import time
from typing import Any

from .detector import ChallengeFinding, detect_challenge

HandoffCallback = Callable[[ChallengeFinding, Any], Awaitable[None] | None]


class ChallengePlugin:
	"""Guard browser-use steps with local challenge detection and human handoff.

	The plugin borrows the Agent and its BrowserSession. It does not launch or close a
	browser and restores the original ``agent.run`` method when detached.
	"""

	def __init__(
		self,
		*,
		mode: str = "local",
		human_handoff: bool = True,
		poll_interval: float = 1.0,
		timeout: float = 120.0,
		on_handoff: HandoffCallback | None = None,
	) -> None:
		if mode != "local":
			raise ValueError("rea-captcha supports local mode only")
		if poll_interval <= 0:
			raise ValueError("poll_interval must be positive")
		if timeout <= 0:
			raise ValueError("timeout must be positive")
		self.human_handoff = human_handoff
		self.poll_interval = poll_interval
		self.timeout = timeout
		self.on_handoff = on_handoff
		self._agent: Any | None = None
		self._original_run: Any | None = None
		self.last_finding: ChallengeFinding | None = None

	async def attach(self, agent: Any) -> None:
		if self._agent is agent:
			return
		if self._agent is not None:
			raise RuntimeError("ChallengePlugin is already attached to another agent")
		if not callable(getattr(agent, "run", None)):
			raise TypeError("agent must expose an async run method")
		self._agent = agent
		self._original_run = agent.run
		original_run = agent.run

		async def guarded_run(*args: Any, **kwargs: Any) -> Any:
			user_start = kwargs.pop("on_step_start", None)
			user_end = kwargs.pop("on_step_end", None)

			async def on_step_start(current_agent: Any) -> None:
				await self._guard_step(current_agent)
				if user_start is not None:
					result = user_start(current_agent)
					if inspect.isawaitable(result):
						await result

			async def on_step_end(current_agent: Any) -> None:
				if user_end is not None:
					result = user_end(current_agent)
					if inspect.isawaitable(result):
						await result

			return await original_run(*args, on_step_start=on_step_start, on_step_end=on_step_end, **kwargs)

		agent.run = guarded_run

	async def detach(self) -> None:
		if self._agent is not None and self._original_run is not None:
			self._agent.run = self._original_run
		self._agent = None
		self._original_run = None

	async def inspect(self, agent: Any | None = None) -> ChallengeFinding:
		target = agent or self._agent
		if target is None:
			raise RuntimeError("ChallengePlugin is not attached")
		browser_session = getattr(target, "browser_session", None)
		if browser_session is None:
			raise RuntimeError("browser-use Agent has no BrowserSession")
		state = await browser_session.get_browser_state_summary(include_screenshot=False, cached=False)
		dom_state = getattr(state, "dom_state", None)
		dom_text = dom_state.llm_representation() if dom_state is not None else ""
		finding = detect_challenge(
			url=str(getattr(state, "url", "about:blank")),
			title=str(getattr(state, "title", "")),
			dom_text=dom_text,
		)
		self.last_finding = finding
		return finding

	async def _guard_step(self, agent: Any) -> None:
		finding = await self.inspect(agent)
		if not finding.active:
			return
		if not self.human_handoff:
			raise RuntimeError(f"Verification challenge detected: {finding.kind}")
		agent.pause()
		if self.on_handoff is not None:
			result = self.on_handoff(finding, agent)
			if inspect.isawaitable(result):
				await result
		deadline = time.monotonic() + self.timeout
		while time.monotonic() < deadline:
			await asyncio.sleep(self.poll_interval)
			current = await self.inspect(agent)
			if not current.active:
				agent.resume()
				return
		raise TimeoutError(f"Verification challenge did not clear within {self.timeout:g} seconds")
