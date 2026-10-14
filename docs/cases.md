# Integration and acceptance cases

The fixtures are synthetic and run on owned local pages. They validate runtime behavior without relying on public challenge endpoints or unstable third-party acceptance.

| Case | Detection evidence | Expected action | Automated check |
|---|---|---|---|
| reCAPTCHA widget | `g-recaptcha` or provider iframe | Human handoff | `detector-policy.test.ts` |
| hCaptcha widget | `h-captcha` or provider iframe | Human handoff | `detector-policy.test.ts` |
| Cloudflare Turnstile | `cf-turnstile` or challenge iframe | Human handoff | detector + Playwright acceptance |
| GeeTest | script/class marker | Human handoff | detector matrix |
| DataDome | delivery script marker | Human handoff | detector matrix |
| PerimeterX | `px-captcha` marker | Human handoff | detector matrix |
| AWS WAF | AWS WAF token/widget marker | Human handoff | detector matrix |
| Simple image/text | named input on exact authorized origin | Optional local OCR | policy test |
| Ordinary page | no challenge evidence | Continue | TypeScript + Python detector tests |
| Persistent challenge | evidence remains after handoff | Refuse resume | controller test |
| Human completion | widget removed in same page/session | Verify and resume | Playwright acceptance |
| Timeout | challenge never clears | Timed-out state | controller test |
| Jet Browser | SDK `evaluate(sessionId, expression)` | Inspect borrowed session | Jet adapter contract test |
| Jet standalone | ordered JSONL process | Own and close one WPE session | fake-process transport test |
| MCP client | list and call real MCP tools | Structured evidence | in-memory protocol test |
| browser-use | hook before step, same BrowserSession | Pause/poll/resume | Python plugin test |

The Playwright acceptance test also verifies that the page title and a context cookie remain intact across handoff, which proves the workflow does not replace the browser context.

## Four provider web demos

`examples/web-demo` contains four browser pages and a local validation server:

| Page | Real boundary | Completion proof |
|---|---|---|
| `recaptcha.html` | Google-hosted reCAPTCHA v2 script with Google's official test keypair | Token is posted to Google's `siteverify`; only `success: true` reaches the passed page |
| `turnstile.html` | Cloudflare-hosted Turnstile script with the official always-pass visible test keypair | Dummy token is posted to Cloudflare Siteverify and checked server-side |
| `hcaptcha.html` | hCaptcha-hosted script with its official publisher test keypair | Passcode is posted to hCaptcha Siteverify with the matching test secret |
| `image-text.html` | Fully owned local image/text form | Local server compares the submitted value; no third party or solver is contacted |

Run `npm run demo:web` for interactive use or `npm run test:web-demo` for the live browser verification. The latter performs detection, handoff, real provider callback/validation, passed-state inspection, cookie-preservation check, and same-controller resume for all four cases. Vendor test credentials are intentionally non-production and provide no anti-bot protection.
