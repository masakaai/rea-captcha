import asyncio

from browser_use import Agent
from browser_use.llm import ChatOpenAI
from rea_captcha import ChallengePlugin


async def main() -> None:
	agent = Agent(
		task="Complete the authorized local browser fixture",
		llm=ChatOpenAI(model="gpt-4.1-mini"),
	)
	plugin = ChallengePlugin(mode="local", human_handoff=True, timeout=120)
	await plugin.attach(agent)
	try:
		await agent.run()
	finally:
		await plugin.detach()


if __name__ == "__main__":
	asyncio.run(main())
