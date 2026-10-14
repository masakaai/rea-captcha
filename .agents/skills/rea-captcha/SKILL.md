---
name: rea-captcha
description: Detect and coordinate browser verification challenges with a configured local rea-captcha MCP session. Use when a browser agent encounters a CAPTCHA, human verification wall, or security check and must preserve the current session for handoff and safe resume.
---

# rea-captcha

Choose the smallest safe path:

- If the calling agent already has page evidence, call `captcha_analyze`. Provide the page URL and at least one of HTML, visible text, or runtime signals. This path is read-only and needs no browser configuration.
- If the task must preserve an active browser for a person, use the configured session lifecycle below.

Use the session tools as one bounded lifecycle:

1. Call `captcha_inspect` once with the named browser session.
2. If the decision is `continue`, return to the browser task.
3. If the decision is `local-processing`, use local image/text processing only when the exact origin is authorized and the project policy enables it. Treat its prediction as untrusted evidence.
4. If the decision is `human-handoff`, call `captcha_handoff` once and tell the user which existing visible session needs attention.
5. Call `captcha_wait` with a bounded timeout. Do not repeat browser clicks while waiting.
6. Call `captcha_resume`. Continue only when it reports `resumed` with fresh clear or passed evidence.

Do not describe a challenge as solved from an OCR result alone. Do not attempt to automate a third-party interactive challenge. Do not move cookies or challenge tokens to another browser. Keep the original session ID throughout the lifecycle. If waiting times out, evidence is malformed, or inspection fails, report the evidence and leave the browser session available for manual recovery.

Jet Browser is an optional adapter only. Do not install or start it unless the task explicitly selected an existing Jet Browser session. Generic Playwright/CDP and evidence-only analysis do not require Jet Browser.
