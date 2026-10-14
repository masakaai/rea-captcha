<p align="center">
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
</p>

# rea-captcha

**Local-first verification challenge intelligence for browser agents.**

[![npm](https://img.shields.io/npm/v/rea-captcha.svg)](https://www.npmjs.com/package/rea-captcha)
[![CI](https://github.com/masakaai/rea-captcha/actions/workflows/ci.yml/badge.svg)](https://github.com/masakaai/rea-captcha/actions/workflows/ci.yml)
[![Provider web demos](https://github.com/masakaai/rea-captcha/actions/workflows/web-demo.yml/badge.svg)](https://github.com/masakaai/rea-captcha/actions/workflows/web-demo.yml)
[![MCP Registry](https://img.shields.io/badge/MCP_Registry-io.github.masakaai%2Frea--captcha-5c6ac4.svg)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.masakaai%2Frea-captcha)
[![MCP tools](https://img.shields.io/badge/MCP_tools-5-157a73.svg)](docs/mcp-tools.md)
[![skills.sh](https://skills.sh/b/masakaai/rea-captcha)](https://skills.sh/masakaai/rea-captcha/rea-captcha)
[![Discord](https://img.shields.io/discord/1555850967147356162?label=Discord&logo=discord&color=5865F2)](https://discord.gg/8Ybc32NcMt)
[![license](https://img.shields.io/badge/license-MIT-157a73.svg)](LICENSE)

[Quick start](#quick-start) · [Agentic matrix](#agentic-verification-matrix) · [How it works](#how-it-works) · [MCP catalog](docs/mcp-tools.md) · [Cases](docs/cases.md) · [Architecture](docs/architecture.md)

rea-captcha detects browser verification challenges, pauses an agent before repeated actions make things worse, preserves the original browser session for visible human handoff, verifies fresh clearance, and resumes the same task. It ships a TypeScript SDK, local stdio MCP server, generic Playwright/CDP integration, a browser-use plugin, a Vercel-compatible Agent Skill, and optional authorized-origin local OCR.

> **Official source:** install from [`masakaai/rea-captcha`](https://github.com/masakaai/rea-captcha) and npm package [`rea-captcha`](https://www.npmjs.com/package/rea-captcha). The project has no hosted solver, telemetry, stealth claim, or dependency on Jet Browser. Jet Browser remains an optional adapter for teams that already use it.

## Agentic verification matrix

<table>
  <tr>
    <td width="50%"><strong>Google reCAPTCHA v2</strong><br><img src="https://raw.githubusercontent.com/masakaai/rea-captcha/main/docs/assets/demos/recaptcha.gif" alt="Google reCAPTCHA detection, handoff, validation, and resume" width="100%"></td>
    <td width="50%"><strong>Cloudflare Turnstile</strong><br><img src="https://raw.githubusercontent.com/masakaai/rea-captcha/main/docs/assets/demos/turnstile.gif" alt="Cloudflare Turnstile detection, handoff, validation, and resume" width="100%"></td>
  </tr>
  <tr>
    <td width="50%"><strong>hCaptcha</strong><br><img src="https://raw.githubusercontent.com/masakaai/rea-captcha/main/docs/assets/demos/hcaptcha.gif" alt="hCaptcha detection, handoff, validation, and resume" width="100%"></td>
    <td width="50%"><strong>Owned image/text</strong><br><img src="https://raw.githubusercontent.com/masakaai/rea-captcha/main/docs/assets/demos/image-text.gif" alt="Owned image text detection, local validation, and resume" width="100%"></td>
  </tr>
</table>

These are complete protected-action flows, not DOM-only fixtures. Each run detects a challenge, hands off the same browser context, submits to the real validation boundary, observes fresh passed evidence, verifies the session cookie, and resumes the same controller. Google reCAPTCHA v2, Cloudflare Turnstile, and hCaptcha use human handoff plus their vendor Siteverify endpoints; the owned image/text case uses an explicitly authorized local path and local server validation.

The first three cases load vendor-hosted JavaScript and accept the protected action only after the server receives `success: true` from the vendor verification endpoint. They use the vendors' documented non-production credentials: [Google test keys](https://developers.google.com/recaptcha/docs/faq/#id-like-to-run-automated-tests-with-recaptcha-what-should-i-do), [Cloudflare dummy keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/), and [hCaptcha test keys](https://docs.hcaptcha.com/#integration-testing-test-keys).

```sh
npm run demo:web       # interactive local demo
npm run test:web-demo  # all four live validation paths
```

## Quick start

Node.js 22.19+, 24.11+, or 26+ is required. Python 3.11+ is needed only for browser-use or local OCR.

```sh
npm install rea-captcha
npx rea-captcha setup
npx rea-captcha doctor
```

`setup` writes a reviewable generic Playwright/CDP configuration after confirmation and prints a Codex registration command. It never installs Jet Browser and refuses to overwrite an existing configuration. Start your browser with CDP enabled before running `doctor`.

Install the repository Agent Skill with the Vercel Skills CLI:

```sh
npx skills add masakaai/rea-captcha --skill rea-captcha
```

The skill was verified through a clean project install and teaches supported agents to choose zero-configuration evidence analysis or the bounded same-session lifecycle.

## How it works

```text
browser agent
    │
    ├─ evidence already captured ── captcha_analyze ── policy result
    │
    └─ active browser session
          inspect → blocked → handoff → bounded wait → fresh verify → resume
                         │
                         └─ the person uses the same visible session
```

Unknown or malformed boundary values fail closed. A detector outage, incomplete observation, timeout, or OCR prediction cannot authorize resume. The browser lifecycle belongs to the caller; adapters borrow sessions unless their composition contract explicitly says otherwise.

## MCP and coding agents

The official Registry entry is `io.github.masakaai/rea-captcha` and launches the zero-configuration stdio server through npm:

```sh
npx -y rea-captcha mcp --stateless
```

It exposes five tools: `captcha_analyze`, `captcha_inspect`, `captcha_handoff`, `captcha_wait`, and `captcha_resume`. `captcha_analyze` accepts page evidence already held by Codex or another agent. The other four tools need a configured browser session. See the [tool catalog](docs/mcp-tools.md) for inputs and lifecycle semantics.

For a stateful local session, run setup and print a host configuration:

```sh
npx rea-captcha agent-config --agent codex
npx rea-captcha agent-config --agent mcp-json
```

rea-captcha adds verification intelligence and handoff; it does not replace an agent's navigation tools. Both integrations must refer to the same browser session.

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

## Browser providers

The recommended cross-agent provider is a browser already exposing CDP:

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

Generic Playwright `Page`, Playwright-over-CDP, browser-use, and optional Jet Browser managed/standalone adapters are implemented. Jet Browser must be selected explicitly and is neither installed nor started by the default path. Configuration examples and provider boundaries are documented in [architecture](docs/architecture.md) and [cases](docs/cases.md).

## browser-use and local OCR

The Python plugin composes with an existing browser-use `BrowserSession`, pauses before a challenged step, polls that same session, and resumes only after evidence clears:

```python
from browser_use import Agent
from rea_captcha import ChallengePlugin

agent = Agent(task="Complete the authorized workflow", llm=llm)
challenge = ChallengePlugin(mode="local", human_handoff=True)
await challenge.attach(agent)
```

Local `ddddocr` is an optional primitive only for simple image/text challenges on an exact authorized origin. It is disabled unless both `allowLocalImageText` and `authorizedOrigins` are configured. No model weights are redistributed, and an OCR prediction remains untrusted evidence.

## What is implemented

- Evidence detection for reCAPTCHA, hCaptcha, Turnstile, GeeTest, DataDome, PerimeterX, AWS WAF, image/text inputs, and generic verification pages.
- Deterministic states with bounded timeout, cancellation, and fresh-evidence resume checks.
- Five stdio MCP tools, CLI/MCP parity, TypeScript SDK, browser-use hooks, and a Vercel-compatible Agent Skill.
- Borrowed Playwright/CDP sessions plus optional Jet Browser adapters.
- Local JSONL events with explicit ownership and no telemetry.
- npm Trusted Publishing/provenance workflow and GitHub OIDC publication to the official MCP Registry.

## Documentation

- [Architecture and trust boundaries](docs/architecture.md)
- [Case matrix and fixture rationale](docs/cases.md)
- [MCP tool catalog](docs/mcp-tools.md)
- [Validation evidence](docs/validation.md)
- [Release and Trusted Publisher procedure](docs/releasing.md)
- [Ecosystem and awesome-list intake](docs/ecosystem.md)
- [Security policy](SECURITY.md)
- [Contributing](CONTRIBUTING.md)

## Community

Join the [MASAKA Discord](https://discord.gg/8Ybc32NcMt) for rea-captcha integration discussion and same-session handoff examples. Use [GitHub Issues](https://github.com/masakaai/rea-captcha/issues) for reproducible bugs and follow the [private security policy](SECURITY.md) for vulnerabilities. Never post browser profiles, cookies, challenge tokens, API keys, or private page evidence.

## Scope and disclaimer

rea-captcha is for owned or explicitly authorized workflows. It does not promise that a third-party service will accept automation, generate server-signed challenge tokens, or bypass interactive protection. Commercial solver APIs, credential transfer, stealth claims, and automatic completion of third-party interactive challenges are outside scope.

rea-captcha is independent and is not affiliated with [morluto/rea](https://github.com/morluto/rea). Its layered organization, local-first operation, setup planning, and provider boundaries are intentionally inspired by REA's engineering style.

## License

Core code and integrations are MIT licensed. Optional dependencies and model artifacts keep their own terms; see [Third-party notices](THIRD_PARTY_NOTICES.md) and [model licenses](MODEL_LICENSES.md).
