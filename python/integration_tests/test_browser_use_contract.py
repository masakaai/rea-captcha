import os
import pathlib
import sys
import unittest

os.environ.setdefault("ANONYMIZED_TELEMETRY", "false")
os.environ.setdefault("BROWSER_USE_CLOUD_SYNC", "false")

sys.path.insert(0, str(pathlib.Path(__file__).parents[1] / "src"))

from browser_use import Agent, BrowserSession

from rea_captcha.detector import ChallengeFinding
from rea_captcha.plugin import ChallengePlugin


class StubLLM:
	model = "stub"

	@property
	def provider(self):
		return "stub"

	@property
	def name(self):
		return "stub"

	async def ainvoke(self, _messages, output_format=None, **_kwargs):
		raise AssertionError(f"LLM must not run during adapter contract checks: {output_format}")


def make_agent():
	session = BrowserSession(cdp_url="ws://127.0.0.1:1")
	agent = Agent(
		task="Validate the rea-captcha adapter contract without starting a browser",
		llm=StubLLM(),
		browser_session=session,
		enable_signal_handler=False,
	)
	return agent, session


class BrowserUseContractTests(unittest.IsolatedAsyncioTestCase):
	async def test_attach_reuses_real_browser_session_and_detach_restores_run(self):
		agent, session = make_agent()
		original_run = agent.run
		plugin = ChallengePlugin(poll_interval=0.001, timeout=1)

		await plugin.attach(agent)
		self.assertIs(agent.browser_session, session)
		self.assertNotEqual(agent.run, original_run)

		await plugin.detach()
		self.assertEqual(agent.run, original_run)
		self.assertIsNone(plugin._agent)

	async def test_guard_uses_real_agent_pause_and_resume_contract(self):
		agent, session = make_agent()
		findings = iter(
			(
				ChallengeFinding("turnstile", 0.98, "https://example.test", "Fixture", ("cf-turnstile",)),
				ChallengeFinding(None, 0.95, "https://example.test", "Fixture", ()),
			)
		)
		handoff_observation = {}

		async def inspect(_agent=None):
			return next(findings)

		async def on_handoff(_finding, current_agent):
			handoff_observation["paused"] = current_agent.state.paused
			handoff_observation["same_session"] = current_agent.browser_session is session

		plugin = ChallengePlugin(poll_interval=0.001, timeout=1, on_handoff=on_handoff)
		plugin.inspect = inspect
		await plugin._guard_step(agent)

		self.assertEqual(handoff_observation, {"paused": True, "same_session": True})
		self.assertFalse(agent.state.paused)


if __name__ == "__main__":
	unittest.main()
