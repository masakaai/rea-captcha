---
name: rea-captcha
description: Detect and coordinate browser verification challenges with a configured local rea-captcha MCP session. Use when a browser agent encounters a CAPTCHA, human verification wall, or security check and must preserve the current session for handoff and safe resume.
---

# rea-captcha

Use the configured rea-captcha tools as one bounded lifecycle:

1. Call `captcha_inspect` once with the named browser session.
2. If the decision is `continue`, return to the browser task.
3. If the decision is `human-handoff`, call `captcha_handoff` once and tell the user which existing visible session needs attention.
4. Call `captcha_wait` with a bounded timeout. Do not repeat browser clicks while waiting.
5. Call `captcha_resume`. Continue only when it reports `resumed` with fresh clear or passed evidence.

Do not describe a challenge as solved from an OCR result alone. Do not move cookies or challenge tokens to another browser. Keep the original session ID throughout the lifecycle. If wait times out or inspection fails, report the evidence and leave the browser session available for manual recovery.
