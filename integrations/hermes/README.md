# rea-captcha for Hermes Agent

This is the Portable Agent Plugins v1 package for [rea-captcha](https://github.com/masakaai/rea-captcha). It gives Hermes a pinned local MCP server plus a workflow skill for browser tasks interrupted by CAPTCHA or another verification gate.

## What the catalog package does

- `mcp.json` starts `rea-captcha@0.2.3` over stdio with `--stateless`.
- `skills/rea-captcha/` teaches the agent to distinguish an action from fresh verification evidence and to keep unsupported challenges in human handoff.
- `captcha_analyze` classifies URL, HTML, visible text, and runtime signals already captured by Hermes or another browser agent. It is read-only and does not connect to a browser.

The catalog package deliberately starts in stateless mode. It does not copy a browser profile, move cookies or challenge tokens, launch a solver, or assume that returning control from Bot Screen proves the challenge cleared. The five session lifecycle tools fail closed until rea-captcha is launched separately with an explicit browser configuration.

## Install

After the catalog entry is accepted:

```bash
hermes plugins install rea-captcha
hermes plugins enable rea-captcha
```

Start a new Hermes session, then ask it to inspect evidence it already has, for example:

```text
Use rea-captcha to analyze this checkout page evidence. If it is blocked, explain what fresh evidence is required before the browser task can resume.
```

## Same-session browser recovery

For `captcha_inspect`, `captcha_complete`, `captcha_handoff`, `captcha_wait`, and `captcha_resume`, configure rea-captcha against a browser session the caller already owns and launch the MCP server with `--config PATH`. Do not run that stateful server under the same MCP name as this stateless catalog server. The [MCP tool catalog](../../docs/mcp-tools.md) documents the lifecycle and the [validation record](../../docs/validation.md) shows the provider-test and owned-origin boundaries.

## Requirements and disclosure

- Node.js 22.19+, 24.11+, or 26+ with `npx` on `PATH`.
- First start downloads the exact `rea-captcha@0.2.3` npm package into npm's cache.
- The local server has no telemetry, hosted solver, commercial solver API, or stealth mode.
- `captcha_analyze` processes only evidence included in the tool call. It makes no browser or provider request.
- Provider-test actions and owned-origin image/text handling are available only in an explicitly configured stateful installation; production third-party interactive challenges remain human handoff.
