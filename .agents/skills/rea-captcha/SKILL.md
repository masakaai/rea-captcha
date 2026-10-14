---
name: rea-captcha
description: Detect and complete authorized browser verification test flows with a configured local rea-captcha MCP session. Use when a browser agent encounters a CAPTCHA or security check and must preserve its existing browser session through verified resume.
---

# rea-captcha

Choose the smallest safe path:

- If the calling agent already has page evidence, call `captcha_analyze`. Provide the page URL and at least one of HTML, visible text, or runtime signals. This path is read-only and needs no browser configuration.
- If the task must preserve an active browser, use the configured session lifecycle below.

Use the session tools as one bounded lifecycle:

1. Call `captcha_inspect` once with the named browser session.
2. If the decision is `continue`, return to the browser task.
3. If the decision is `agent-action` or `local-processing`, call `captcha_complete` once. It may act only on the exact configured origin; provider actions additionally require a documented non-production test key.
4. Call `captcha_resume`. Continue only when it reports `resumed` with fresh clear or passed evidence.
5. If the decision is `human-handoff`, the challenge is outside the automatic boundary. Call `captcha_handoff` once, then `captcha_wait` with a bounded timeout, and finally `captcha_resume` after fresh clearance.

Do not describe a challenge as solved from an OCR result alone. Do not attempt to automate a third-party production challenge or bypass access controls. Do not move cookies or challenge tokens to another browser. Keep the original session ID throughout the lifecycle. If waiting times out, evidence is malformed, or inspection fails, report the evidence and leave the browser session available for recovery.

Jet Browser is an optional adapter only. Do not install or start it unless the task explicitly selected an existing Jet Browser session. Generic Playwright/CDP and evidence-only analysis do not require Jet Browser.
