<h1 align="center">rea-captcha</h1>

<p align="center"><strong>Keep Browser Use tasks alive through CAPTCHA handoff.</strong></p>

<p align="center">
  <a href="https://www.npmjs.com/package/rea-captcha"><img alt="npm" src="https://img.shields.io/npm/v/rea-captcha.svg"></a>
  <a href="https://github.com/masakaai/rea-captcha/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/masakaai/rea-captcha/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://rea-captcha.vercel.app"><img alt="Live demo" src="https://img.shields.io/badge/live_demo-four_cases-157a73.svg"></a>
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/badge/license-MIT-157a73.svg"></a>
</p>

<details align="center">
  <summary>Translations</summary>
  <a href="README.md">English</a> · <a href="docs/readme/README_ar.md">العربية</a> ·
  <a href="docs/readme/README_de.md">Deutsch</a> · <a href="docs/readme/README_el.md">Ελληνικά</a> ·
  <a href="docs/readme/README_es.md">Español</a> · <a href="docs/readme/README_fa.md">فارسی</a> ·
  <a href="docs/readme/README_fr.md">Français</a> · <a href="docs/readme/README_id.md">Bahasa Indonesia</a> ·
  <a href="docs/readme/README_it.md">Italiano</a> · <a href="docs/readme/README_ja.md">日本語</a> ·
  <a href="docs/readme/README_ko.md">한국어</a> · <a href="docs/readme/README_pl.md">Polski</a> ·
  <a href="docs/readme/README_pt-BR.md">Português (Brasil)</a> · <a href="docs/readme/README_ru.md">Русский</a> ·
  <a href="docs/readme/README_th.md">ไทย</a> · <a href="docs/readme/README_tr.md">Türkçe</a> ·
  <a href="docs/readme/README_uk.md">Українська</a> · <a href="docs/readme/README_vi.md">Tiếng Việt</a> ·
  <a href="docs/readme/README_zh.md">简体中文</a> · <a href="docs/readme/README_zh-TW.md">繁體中文</a>
</details>

<p align="center">
  <a href="#install">Install</a> ·
  <a href="https://rea-captcha.vercel.app">Live demo</a> ·
  <a href="#what-the-demo-proves">Demo evidence</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="docs/mcp-tools.md">MCP catalog</a> ·
  <a href="docs/cases.md">Cases</a> ·
  <a href="docs/architecture.md">Architecture</a>
</p>

When a Browser Use task hits a CAPTCHA halfway through, rea-captcha keeps the block and recovery inside the browser session the agent already owns. It detects supported verification challenges, coordinates an authorized action or human handoff, requires fresh server-validated evidence, and then returns control to the same task. It ships a TypeScript SDK, local stdio MCP server, browser-use plugin, Vercel-compatible Agent Skill, and optional authorized-origin local OCR.

> **Official source:** install from [`masakaai/rea-captcha`](https://github.com/masakaai/rea-captcha) and npm package [`rea-captcha`](https://www.npmjs.com/package/rea-captcha). The project has no hosted solver, telemetry, stealth claim, or dependency on Jet Browser. It reuses the agent's existing browser; the provider examples use documented non-production credentials only.

<p align="center">
  <a href="https://rea-captcha.vercel.app">
    <img src="https://raw.githubusercontent.com/masakaai/rea-captcha/main/docs/assets/demos/matrix.gif" alt="Four same-session verification demos: reCAPTCHA, Turnstile, hCaptcha, and an owned image/text flow" width="900">
  </a>
</p>

<p align="center"><a href="https://rea-captcha.vercel.app"><strong>Run the four live verification cases</strong></a></p>

<p align="center"><sub>If this fixes a handoff you have actually hit, a star helps other Browser Use builders find it.</sub></p>

## What the demo proves

These are complete agent-driven protected-action flows, not DOM-only fixtures. Each run detects a challenge, performs the authorized browser interaction in the same page, submits to the real validation boundary, observes fresh passed evidence, verifies the session cookie, and resumes the same controller. Google reCAPTCHA v2, Cloudflare Turnstile, and hCaptcha use their documented test modes plus vendor Siteverify endpoints; the owned image/text case uses an explicitly authorized local path and local server validation.

The first three cases load vendor-hosted JavaScript and accept the protected action only after the server receives `success: true` from the vendor verification endpoint. They use the vendors' documented non-production credentials: [Google test keys](https://developers.google.com/recaptcha/docs/faq/#id-like-to-run-automated-tests-with-recaptcha-what-should-i-do), [Cloudflare dummy keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/), and [hCaptcha test keys](https://docs.hcaptcha.com/#integration-testing-test-keys).

```sh
npm run demo:web       # interactive local demo
npm run test:web-demo  # all four live validation paths
```

## Install

### Browser Use

Install the version-aligned Python adapter from the verified release wheel:

```sh
python -m pip install 'rea-captcha[browser-use] @ https://github.com/masakaai/rea-captcha/releases/download/v0.3.1/rea_captcha-0.3.1-py3-none-any.whl'
```

Attach the handoff guard to the `Agent` that already owns the browser session:

```python
from rea_captcha import ChallengePlugin

challenge = ChallengePlugin(mode="local", human_handoff=True)
await challenge.attach(agent)
```

The plugin borrows the agent's current `BrowserSession`; it does not launch or replace the browser. See the [Browser Use handoff guide](docs/browser-use.md) and [complete example](examples/browser-use/handoff.py).

CI installs the supported Browser Use dependency and exercises the adapter against real `Agent` / `BrowserSession` pause-resume contracts; see the [integration test](python/integration_tests/test_browser_use_contract.py).

### MCP and coding agents

For local, stateless evidence analysis:

```sh
npx rea-captcha@0.3.1 mcp --stateless
```

Stateless mode does not control a browser. Same-session actions require a configured Playwright/CDP adapter; generate a host configuration with `npx rea-captcha@0.3.1 agent-config --agent mcp-json`.

Or ask Codex, Claude Code, Cursor, or another coding agent to wire the correct path for the project:

```text
Install rea-captcha in this project and connect it to the browser session this agent already uses.
```

## How it works

<p align="center">
  <img src="docs/assets/how-it-works.svg" alt="rea-captcha lifecycle: inspect evidence, apply policy, perform an authorized agent action in the same browser session, verify fresh clearance, and resume the same task" width="100%">
</p>

## MCP and coding agents

The official Registry entry is `io.github.masakaai/rea-captcha` and launches the zero-configuration stdio server through npm:

```sh
npx rea-captcha@0.3.1 mcp --stateless
```

Review the pinned package version and approve npm's install prompt only when it matches the release you intend to run. The command does not suppress that prompt.

It exposes six tools: `captcha_analyze`, `captcha_inspect`, `captcha_complete`, `captcha_handoff`, `captcha_wait`, and `captcha_resume`. `captcha_complete` performs only a policy-authorized action in the configured existing browser and waits for fresh validation evidence. See the [tool catalog](docs/mcp-tools.md) for inputs and lifecycle semantics.

For a stateful local session, run setup and print a host configuration:

```sh
npx rea-captcha agent-config --agent codex
npx rea-captcha agent-config --agent mcp-json
```

rea-captcha adds verification intelligence and bounded completion actions; it does not replace an agent's navigation tools. Both integrations must refer to the same browser session.

Hermes Agent users can inspect the [Portable Agent Plugins v1 package](integrations/hermes/README.md). Its catalog-safe default is stateless evidence analysis; same-session browser actions still require an explicit stateful rea-captcha configuration.

## TypeScript SDK

```ts
import { ChallengeController, ChallengePolicy } from 'rea-captcha';
import { PlaywrightChallengeAdapter } from 'rea-captcha/playwright';

const authorizedOrigin = 'https://fixture.example';
const controller = new ChallengeController({
  browser: new PlaywrightChallengeAdapter({
    id: 'checkout',
    page,
    agentActions: {
      authorizedOrigins: [authorizedOrigin],
      allowProviderTestAutomation: true,
      submitSelector: 'button[type="submit"]'
    }
  }),
  policy: new ChallengePolicy({
    authorizedOrigins: [authorizedOrigin],
    allowProviderTestAutomation: true
  })
});

const inspection = await controller.inspect();
if (inspection.policy.decision === 'agent-action' || inspection.policy.decision === 'local-processing') {
  await controller.complete({ timeoutMs: 30_000 });
  await controller.resume();
} else if (inspection.policy.decision === 'human-handoff') {
  const handoff = await controller.handoff({ taskId: 'checkout-run-42' });
  await controller.wait({ timeoutMs: 120_000 });
  await controller.resume({
    taskId: 'checkout-run-42',
    handoffId: handoff.handoff.id
  });
}
```

The controller borrows `page`; it does not create or close the browser. Human completion is a wake-up signal, not proof of success: the handoff identity is bound to the task, existing tab/session, and gate generation, and the controller still requires fresh evidence before consuming it once.

## Browser providers

The recommended cross-agent provider is a browser already exposing CDP:

```json
{
  "version": 1,
  "sessions": {
    "local-chrome": {
      "adapter": "playwright-cdp",
      "endpoint": "http://127.0.0.1:9222",
      "allowProviderTestAutomation": true,
      "submitSelector": "button[type=submit]",
      "authorizedOrigins": ["https://fixture.example"]
    }
  }
}
```

Generic Playwright `Page`, Playwright-over-CDP, browser-use, and optional Jet Browser managed/standalone adapters are implemented. Jet Browser must be selected explicitly and is neither installed nor started by the default path. Configuration examples and provider boundaries are documented in [architecture](docs/architecture.md) and [cases](docs/cases.md).

## browser-use and local OCR

The Python adapter is not published on PyPI yet, so an unqualified `pip install rea-captcha` will not work. The pinned wheel is built from the v0.3.1 tag, smoke-tested in GitHub Actions, and attached to the corresponding release.

For agent-driven completion, point rea-captcha's Playwright/CDP session at the same existing browser used by browser-use. The MCP lifecycle detects the block, performs an authorized action, verifies the result, and returns control without replacing the browser or task context.

The Python plugin shown in [Install](#browser-use) remains a lightweight detection and manual-recovery fallback for browser-use integrations that do not expose a compatible CDP action surface.

Local `ddddocr` is an optional primitive only for simple image/text challenges on an exact authorized origin. It is disabled unless both `allowLocalImageText` and `authorizedOrigins` are configured. No model weights are redistributed, and an OCR prediction remains untrusted evidence.

## What is implemented

- Evidence detection for reCAPTCHA, hCaptcha, Turnstile, GeeTest, DataDome, PerimeterX, AWS WAF, image/text inputs, and generic verification pages.
- Deterministic states with bounded timeout, cancellation, and fresh-evidence resume checks.
- Six stdio MCP tools, CLI/MCP parity, TypeScript SDK, browser-use hooks, and a Vercel-compatible Agent Skill.
- Borrowed Playwright/CDP sessions plus optional Jet Browser adapters.
- Local JSONL events with explicit ownership and no telemetry.
- npm Trusted Publishing/provenance workflow and GitHub OIDC publication to the official MCP Registry.

## Documentation

- [Architecture and trust boundaries](docs/architecture.md)
- [Browser Use handoff guide](docs/browser-use.md)
- [Case matrix and fixture rationale](docs/cases.md)
- [MCP tool catalog](docs/mcp-tools.md)
- [Validation evidence](docs/validation.md)
- [Release and Trusted Publisher procedure](docs/releasing.md)
- [Ecosystem and awesome-list intake](docs/ecosystem.md)
- [Security policy](SECURITY.md)
- [Contributing](CONTRIBUTING.md)

## Community

Ask integration questions and share same-session agent examples in [GitHub Discussions](https://github.com/masakaai/rea-captcha/discussions). For real-time chat, join the [MASAKA Discord](https://discord.gg/8Ybc32NcMt) and use the dedicated [#rea-captcha channel](https://discord.com/channels/1555850967147356162/1559900477750116362). Use [GitHub Issues](https://github.com/masakaai/rea-captcha/issues) for reproducible bugs and follow the [private security policy](SECURITY.md) for vulnerabilities. Never post browser profiles, cookies, challenge tokens, API keys, or private page evidence.

## Scope and disclaimer

rea-captcha is for owned or explicitly authorized workflows. Provider automation is accepted only when the adapter confirms the vendor's documented non-production test key. It does not bypass production interactive protection. Commercial solver APIs, credential transfer, stealth claims, and automatic completion of third-party production challenges are outside scope.

Inspired by [morluto/rea](https://github.com/morluto/rea).

## License

Core code and integrations are MIT licensed. Optional dependencies and model artifacts keep their own terms; see [Third-party notices](THIRD_PARTY_NOTICES.md) and [model licenses](MODEL_LICENSES.md).
