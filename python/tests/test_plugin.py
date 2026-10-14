import asyncio
import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).parents[1] / "src"))

from rea_captcha.plugin import ChallengePlugin


class DomState:
	def __init__(self, browser):
		self.browser = browser

	def llm_representation(self):
		return self.browser.dom


class State:
	def __init__(self, browser):
		self.url = "https://example.test/"
		self.title = "Fixture"
		self.dom_state = DomState(browser)


class Browser:
	def __init__(self):
		self.dom = '<div class="cf-turnstile">Verify you are human</div>'

	async def get_browser_state_summary(self, **_kwargs):
		return State(self)


class Agent:
	def __init__(self):
		self.browser_session = Browser()
		self.paused = False
		self.steps = 0

	def pause(self):
		self.paused = True

	def resume(self):
		self.paused = False

	async def run(self, *, on_step_start=None, on_step_end=None):
		if on_step_start:
			await on_step_start(self)
		self.steps += 1
		if on_step_end:
			await on_step_end(self)
		return self.steps


class PluginTests(unittest.IsolatedAsyncioTestCase):
	async def test_handoff_waits_in_same_session_then_resumes(self):
		agent = Agent()
		async def handoff(_finding, current_agent):
			current_agent.browser_session.dom = "Checkout ready"
		plugin = ChallengePlugin(poll_interval=0.001, timeout=1, on_handoff=handoff)
		await plugin.attach(agent)
		self.assertEqual(await agent.run(), 1)
		self.assertFalse(agent.paused)
		self.assertEqual(agent.steps, 1)
		await plugin.detach()

	async def test_disabled_handoff_stops_before_agent_step(self):
		agent = Agent()
		plugin = ChallengePlugin(human_handoff=False)
		await plugin.attach(agent)
		with self.assertRaisesRegex(RuntimeError, "turnstile"):
			await agent.run()
		self.assertEqual(agent.steps, 0)


if __name__ == "__main__":
	unittest.main()
