# rea-captcha

**Local-first verification challenge intelligence for browser agents.**

[![CI](https://github.com/masakaai/rea-captcha/actions/workflows/ci.yml/badge.svg)](https://github.com/masakaai/rea-captcha/actions/workflows/ci.yml)
[![Provider web demos](https://github.com/masakaai/rea-captcha/actions/workflows/web-demo.yml/badge.svg)](https://github.com/masakaai/rea-captcha/actions/workflows/web-demo.yml)
[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha)
[![license](https://img.shields.io/badge/license-MIT-157a73.svg)](LICENSE)

rea-captcha detects browser verification challenges, pauses an agent before it repeats actions, keeps the original browser session open for human handoff, verifies that the challenge cleared, and resumes the same task. It ships a TypeScript SDK, stdio MCP server, generic Playwright/CDP integration, a Python browser-use plugin, and an optional local OCR process. Jet Browser support is an optional provider adapter, not a dependency or default runtime.

The default policy never sends page data to a hosted solver and never treats an OCR prediction as authorization. Interactive challenges on unlisted origins require human handoff. The project is intended for owned or explicitly authorized browser workflows.

rea-captcha is an independent project and is not affiliated with [morluto/rea](https://github.com/morluto/rea). Its layering, CLI/MCP parity, evidence model, local operation, setup planning, and provider boundaries intentionally follow REA's project organization.

## What is implemented

- Evidence-based detection for reCAPTCHA, hCaptcha, Turnstile, GeeTest, DataDome, PerimeterX, AWS WAF, image/text inputs, and generic verification pages.
- A deterministic controller: `inspect → blocked → awaiting-human → verifying → resumed` with bounded timeout and cancellation.
- Borrowed-session adapters for generic Playwright pages and Playwright-over-CDP; optional provider adapters cover Jet Browser `v0.6.5` SDK sessions.
- Four MCP tools: `captcha_inspect`, `captcha_wait`, `captcha_handoff`, and `captcha_resume`.
- `setup`, `doctor`, `agent-config`, `inspect`, and `mcp` CLI commands.
- browser-use `0.13.x` hooks that stop before an agent step and retain its existing `BrowserSession`.
- Optional local `ddddocr` worker over ordered JSONL. No model weights are redistributed.
- Local JSONL event logs with explicit ownership and no telemetry.

## Install

Node.js 22.19+, 24.11+, or 26+ is required. Python 3.11+ is needed only for browser-use or local OCR.

```sh
npm install rea-captcha
npx rea-captcha setup
```

`setup` creates a reviewable generic Playwright/CDP configuration and prints the command needed to register rea-captcha with Codex. It does not require Jet Browser. To verify a source checkout instead:

```sh
npm ci
npm run check
npx playwright install chromium
npm run test:browser
npm run test:web-demo
npm run test:package
```

Create a usable local CDP configuration from a source checkout with:

```sh
node scripts/rea-captcha.mjs setup
# use --yes only for non-interactive setup
```

Without `--yes`, setup asks before writing. It is additive and refuses to overwrite an existing file. The generated `local-chrome` session points to `http://127.0.0.1:9222`; override it with `--session` and `--endpoint`. Start your existing browser or browser-agent runtime with CDP enabled, then run `node scripts/rea-captcha.mjs doctor`. Doctor makes a real borrowed connection and disconnects without closing that browser.

## Fast path for Codex and other MCP agents

After setup, print a ready-to-run Codex registration command:

```sh
node scripts/rea-captcha.mjs agent-config --agent codex
```

For another stdio MCP host, print a generic JSON descriptor:

```sh
node scripts/rea-captcha.mjs agent-config --agent mcp-json
```

rea-captcha adds verification inspection and handoff tools; it does not replace the agent's browser navigation tools. Both must borrow the same browser session. No Jet Browser service, key, package, or container is needed for this path.

## Four-case web demo

Each row below is a complete protected-action path, not a DOM-only fixture. `test:web-demo` uses one browser context per run, detects each case, hands off the same page, submits the response to the validation boundary, observes fresh passed evidence, checks its session cookie, and resumes the same controller.

| Case | Vendor client | Detected kind | Policy path | Validation boundary | Result |
|---|---|---|---|---|---|
| Google reCAPTCHA v2 | Real Google test widget | `recaptcha` | Human handoff | Google Siteverify | Validated + resumed |
| Cloudflare Turnstile | Real Cloudflare test widget | `turnstile` | Human handoff | Cloudflare Siteverify | Validated + resumed |
| hCaptcha | Real hCaptcha test widget | `hcaptcha` | Human handoff | hCaptcha Siteverify | Validated + resumed |
| Owned image/text | Local owned form | `image-text` | Authorized local path | Local server | Validated + resumed |

<table>
  <tr>
    <td width="50%"><strong>Google reCAPTCHA v2</strong><br><img src="https://raw.githubusercontent.com/masakaai/rea-captcha/main/docs/assets/demos/recaptcha.gif" alt="Google reCAPTCHA detection, same-session handoff, server validation, and resume" width="100%"></td>
    <td width="50%"><strong>Cloudflare Turnstile</strong><br><img src="https://raw.githubusercontent.com/masakaai/rea-captcha/main/docs/assets/demos/turnstile.gif" alt="Cloudflare Turnstile detection, same-session handoff, server validation, and resume" width="100%"></td>
  </tr>
  <tr>
    <td width="50%"><strong>hCaptcha</strong><br><img src="https://raw.githubusercontent.com/masakaai/rea-captcha/main/docs/assets/demos/hcaptcha.gif" alt="hCaptcha detection, same-session handoff, server validation, and resume" width="100%"></td>
    <td width="50%"><strong>Owned image/text</strong><br><img src="https://raw.githubusercontent.com/masakaai/rea-captcha/main/docs/assets/demos/image-text.gif" alt="Owned image text detection, same-session handoff, local server validation, and resume" width="100%"></td>
  </tr>
</table>

Run the interactive server, then open the printed local URL:

```sh
npm run demo:web
```

Run the complete live-provider verification:

```sh
npm run test:web-demo
```

The four cases are Google reCAPTCHA v2, Cloudflare Turnstile, hCaptcha, and a fully owned image/text challenge. The first three load the real vendor-hosted JavaScript and accept the protected action only after the local server receives `success: true` from the vendor verification endpoint. They use the vendors' documented non-production credentials: [Google reCAPTCHA test keys](https://developers.google.com/recaptcha/docs/faq/#id-like-to-run-automated-tests-with-recaptcha-what-should-i-do), [Cloudflare Turnstile dummy keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/), and [hCaptcha integration test keys](https://docs.hcaptcha.com/#integration-testing-test-keys). The test verifies detection, handoff, server validation, passed-state evidence, cookie preservation, and same-controller resume for every case.

Regenerate the checked-in evidence GIFs with `npm run record:web-demo`. The recorder drives those same live validation paths and adds only the state labels shown in the top-right corner.

## Configure browser providers

The MCP server resolves named sessions from `~/.config/rea-captcha/config.json` or an explicit `--config` path. Credentials are referenced by environment variable name and are not stored in the file.

The default and recommended cross-agent provider is a browser already exposing CDP:

```json
{
  "version": 1,
  "sessions": {
    "local-chrome": {
      "adapter": "playwright-cdp",
      "endpoint": "http://127.0.0.1:9222",
      "authorizedOrigins": ["https://fixture.example"]
    }
  }
}
```

The TypeScript SDK can instead borrow an existing Playwright `Page` directly; see the SDK example below.

### Optional Jet Browser providers

Jet Browser is used only when a project explicitly selects it. Its managed adapter reuses the trusted server SDK and an existing remote WPE WebKit session:

```json
{
  "version": 1,
  "eventLog": "/absolute/private/path/rea-captcha.jsonl",
  "sessions": {
    "checkout": {
      "adapter": "jet-browser",
      "module": "/absolute/path/to/jet-browser/sdk/client.mjs",
      "sessionId": "existing-session-id",
      "apiKeyEnv": "MASAKA_API_KEY",
      "baseUrl": "https://masaka-backend.vercel.app",
      "allowLocalImageText": false,
      "authorizedOrigins": ["https://fixture.example"]
    }
  }
}
```

Jet Browser standalone uses the same ordered JSONL container boundary as the upstream runtime. One adapter owns one process, sends one command per line, consumes one response per line in order, applies command/session timeouts, issues `close`, and then ends stdin. Keep the Docker arguments explicit in configuration:

```json
{
  "version": 1,
  "sessions": {
    "local-wpe": {
      "adapter": "jet-standalone",
      "command": "docker",
      "args": [
        "run", "--rm", "-i", "--network=none", "--cap-drop=ALL",
        "--cap-add=SETUID", "--cap-add=SETGID",
        "--security-opt=no-new-privileges",
        "--memory=1g", "--cpus=2", "--pids-limit=256", "--shm-size=256m",
        "jet-browser:local"
      ],
      "commandTimeoutMs": 30000,
      "sessionTimeoutMs": 300000,
      "authorizedOrigins": ["http://127.0.0.1:4173"]
    }
  }
}
```

Use the full upstream hardening arguments, including its checked-in seccomp profile and host-specific AppArmor settings, for the production standalone flow; the abbreviated array above illustrates the config shape.

Run a direct inspection:

```sh
node scripts/rea-captcha.mjs inspect --session checkout
```

## Codex MCP

Build the package, then register the local stdio server. Codex uses the same MCP configuration in its CLI and IDE extension; the current official syntax is `codex mcp add <name> -- <stdio command>`.

```sh
codex mcp add rea-captcha -- \
  node /absolute/path/to/rea-captcha/scripts/rea-captcha.mjs \
  mcp --config /absolute/path/to/config.json

codex mcp list
```

The expected agent loop is:

1. Call `captcha_inspect` before retrying a blocked browser action.
2. If policy returns `human-handoff`, call `captcha_handoff` once.
3. Let the person complete the challenge in the existing visible browser.
4. Call `captcha_wait` with a bounded timeout.
5. Call `captcha_resume`; it re-inspects and refuses to resume if evidence remains.

See the current [official Codex MCP documentation](https://learn.chatgpt.com/docs/extend/mcp) for host configuration and approval settings.

## TypeScript SDK

```ts
import { ChallengeController } from 'rea-captcha';
import { PlaywrightChallengeAdapter } from 'rea-captcha/playwright';

const controller = new ChallengeController({
  browser: new PlaywrightChallengeAdapter({ id: 'checkout', page })
});

const inspection = await controller.inspect();
if (inspection.policy.decision === 'human-handoff') {
  await controller.handoff();
  await controller.wait({ timeoutMs: 120_000 });
  await controller.resume();
}
```

The controller borrows `page`; it does not create or close the browser.

## browser-use

```python
from browser_use import Agent
from rea_captcha import ChallengePlugin

agent = Agent(task="Complete the authorized workflow", llm=llm)
challenge = ChallengePlugin(mode="local", human_handoff=True)

await challenge.attach(agent)
try:
    await agent.run()
finally:
    await challenge.detach()
```

The plugin composes with user-supplied `on_step_start` and `on_step_end` hooks. It inspects the current `BrowserSession`, calls `pause()` before a challenged step, polls the same session, then calls `resume()` after the evidence clears.

## Local OCR

OCR is an optional primitive for simple image/text challenges on an explicitly authorized origin. It is disabled by policy unless both `allowLocalImageText` and an exact authorized origin are configured. Install the Python extra and point the TypeScript process at that environment:

```json
{
  "allowLocalImageText": true,
  "authorizedOrigins": ["https://your-owned-fixture.example"]
}
```

Those fields belong inside the selected session object; `authorizedOrigins` is normalized to exact URL origins. Enabling the policy only returns `local-processing`—the caller must explicitly invoke the local OCR runtime and decide how to use its untrusted prediction.

```sh
python3 -m venv .venv
.venv/bin/pip install -e './python[ocr]'
```

`PythonOcrRuntime` keeps one local subprocess, preserves request order with IDs, enforces timeouts, and closes it explicitly. OCR does not generate reCAPTCHA, hCaptcha, Turnstile, or other server-signed tokens.

## Project layout

```text
src/domain/          pure challenge states, evidence, and Result types
src/contracts/       stable MCP input contracts and tool identities
src/application/     controller, policy, lifecycle ports, event ownership
src/browser/         Playwright, CDP, Jet Browser, and inline adapters
src/model/           optional local model process boundary
src/composition/     validated configuration and provider composition
src/server/          MCP request translation
src/cli.ts           one-shot CLI adapter
python/              browser-use plugin and optional OCR worker
models/manifests/    provenance and license facts; no weights
examples/            runnable integration cases
tests/               domain, boundary, protocol, and browser acceptance
```

Dependencies flow inward as documented in [the architecture](docs/architecture.md). Provider details do not enter the domain or application contracts.

## Cases and ecosystem

The tested case matrix and the reasons behind each fixture are in [docs/cases.md](docs/cases.md). Candidate awesome-list submissions, entry text, and eligibility gates are maintained in [docs/ecosystem.md](docs/ecosystem.md). Entries are prepared locally; no external PR is opened before the repository has a public URL and the target list's inclusion criteria are met.

Maintainers can follow the [npm release procedure](docs/releasing.md). Releases are built on GitHub-hosted runners, must match `v<package.json version>`, rerun all deterministic and live-provider checks, verify a clean tarball install, and publish through npm Trusted Publishing with provenance.

## Limitations

- DOM rules report challenge evidence; they do not promise that a third-party site will accept automation.
- The managed Jet adapter uses the trusted SDK's `evaluate` operation, which is part of Jet Browser's full developer toolset. The standalone adapter speaks Jet's ordered JSONL protocol directly. WPE WebKit is not Chromium and does not expose CDP compatibility.
- The local OCR worker is optional and CPU-first. No bundled VLM or universal CAPTCHA-solving claim is made.
- Docker is required for Jet Browser's upstream standalone container acceptance. It is not required for rea-captcha's unit, MCP, Python, or Playwright tests.

## License

Core code and integrations are MIT licensed. Optional dependencies and model artifacts keep their own terms; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [MODEL_LICENSES.md](MODEL_LICENSES.md).
