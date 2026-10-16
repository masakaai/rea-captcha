# Browser Use handoff guide

Browser Use jobs often fail late rather than early: the agent has already navigated, authenticated, and filled part of a workflow when a CAPTCHA or verification page appears. `ChallengePlugin` pauses before the next agent step, keeps using that agent's existing `BrowserSession`, and waits for fresh page evidence before returning control.

## Install and attach

Pin the adapter to the matching verified release wheel:

```sh
python -m pip install 'rea-captcha[browser-use] @ https://github.com/masakaai/rea-captcha/releases/download/v0.3.0/rea_captcha-0.3.0-py3-none-any.whl'
```

```python
from browser_use import Agent
from rea_captcha import ChallengePlugin

agent = Agent(task="Complete the authorized workflow", llm=llm)

async def notify_human(finding, _agent):
    print(f"Human action needed for {finding.kind} at {finding.url}")

challenge = ChallengePlugin(
    human_handoff=True,
    timeout=15 * 60,
    on_handoff=notify_human,
)
await challenge.attach(agent)

try:
    await agent.run()
finally:
    await challenge.detach()
```

The callback is a notification boundary, not proof that verification passed. The plugin polls uncached state from the same `BrowserSession` and calls `agent.resume()` only after current page evidence no longer reports an active challenge. If the bounded wait expires, it raises `TimeoutError` before another agent step runs and does not call `resume()`.

## Why the handoff does not consume `step_timeout`

The supported range is `browser-use>=0.13.11,<0.14`. In Browser Use 0.13.11, `on_step_start` and `on_step_end` run outside the `asyncio.wait_for(self.step(...), step_timeout)` boundary. rea-captcha installs its guard in `on_step_start`, so the plugin's explicit `timeout` governs human wait time while Browser Use's `step_timeout` continues to govern active agent execution. See the [0.13.11 hook placement](https://github.com/browser-use/browser-use/blob/0.13.11/browser_use/agent/service.py#L2438-L2482).

Do not lower the Browser Use dependency below the declared range without re-running this contract. Older releases placed different work inside the step timeout and may cancel a valid human wait.

## What stays the same

- The caller keeps ownership of the `Agent` and its `BrowserSession`.
- rea-captcha does not launch, replace, or close the browser.
- Cookies, tabs, and storage remain in the browser session Browser Use already owns.
- Existing `on_step_start` and `on_step_end` callbacks still run.
- Detection requests an uncached Browser Use state summary; it does not rely on a previous screenshot or completion callback.

## Choose the correct integration level

| Requirement | Python `ChallengePlugin` | Stateful SDK/MCP controller |
|---|---:|---:|
| Reuse the current Browser Use session | Yes | Yes, through the configured Playwright/CDP adapter |
| Detect and pause before the next step | Yes | Yes |
| Bounded human wait | Yes | Yes |
| Fresh page reinspection | Yes | Yes |
| Task/tab/generation-bound one-shot resume | No | Yes |
| Authorized provider-test or owned-origin action | No | Yes |
| Adapter-backed validation before resume | Page evidence only | Yes |

Use the lightweight plugin when a human can complete the page in the existing Browser Use window and fresh page evidence is sufficient for the application. Use the stateful controller when the application needs an opaque handoff identity, delayed-callback protection, at-most-once lifecycle resume, or an explicit validation boundary. The [MCP tool catalog](mcp-tools.md) documents that stronger contract.

## Failure behavior

- Malformed or unavailable Browser Use state raises an error; it is never treated as clear.
- `human_handoff=False` stops before the next agent step instead of attempting the challenge.
- A handoff timeout does not silently continue the task.
- Production third-party interactive challenges remain human work. The plugin does not provide stealth, token transfer, or a commercial solver.

The focused unit coverage is in [`python/tests/test_plugin.py`](../python/tests/test_plugin.py). CI also installs the supported Browser Use dependency on Python 3.12 and runs [`python/integration_tests/test_browser_use_contract.py`](../python/integration_tests/test_browser_use_contract.py) against real `Agent` and `BrowserSession` pause-resume APIs without launching a browser. End-to-end controller coverage for same-session handoff and one-shot resume is in [`tests/playwright-handoff.test.ts`](../tests/playwright-handoff.test.ts) and [`tests/controller.test.ts`](../tests/controller.test.ts).
