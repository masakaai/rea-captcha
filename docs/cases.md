# Integration and acceptance cases

The deterministic fixtures run on owned local pages. The four provider demos separately load documented vendor test widgets and validate their server endpoints.

| Case | Detection evidence | Expected action | Automated check |
|---|---|---|---|
| reCAPTCHA widget | `g-recaptcha` or provider iframe | Agent action only on authorized origin + official test key | policy + four-case browser suite |
| hCaptcha widget | `h-captcha` or provider iframe | Agent action only on authorized origin + official test key | policy + four-case browser suite |
| Cloudflare Turnstile | `cf-turnstile` or challenge iframe | Agent action only on authorized origin + official test key | policy + four-case browser suite |
| GeeTest | script/class marker | Human handoff | detector matrix |
| DataDome | delivery script marker | Human handoff | detector matrix |
| PerimeterX | `px-captcha` marker | Human handoff | detector matrix |
| AWS WAF | AWS WAF token/widget marker | Human handoff | detector matrix |
| Simple image/text | named input on exact authorized origin | Optional local OCR | policy test |
| Ordinary page | no challenge evidence | Continue | TypeScript + Python detector tests |
| Persistent challenge | evidence remains after action or handoff | Refuse resume | controller test |
| Agent completion | authorized action in same page/session | Verify and resume | controller + Playwright acceptance |
| Timeout | challenge never clears | Timed-out state | controller test |
| Jet Browser | SDK `evaluate(sessionId, expression)` | Inspect borrowed session | Jet adapter contract test |
| Jet standalone | ordered JSONL process | Own and close one WPE session | fake-process transport test |
| MCP client | list and call real MCP tools | Structured evidence | in-memory protocol test |
| browser-use | hook before step, same BrowserSession | Pause/poll/resume | Python plugin test |

The Playwright acceptance path verifies that the page title and a context cookie remain intact across the agent action, proving the workflow does not replace the browser context.

## Four provider web demos

`examples/web-demo` contains four browser pages and a local validation server:

The same handler is deployed at [`https://rea-captcha.vercel.app`](https://rea-captcha.vercel.app). The public deployment uses only the vendors' documented non-production credentials and the owned `LOCAL42` boundary; it is a verification-lifecycle demo, not a production challenge or solver.

| Page | Real boundary | Completion proof |
|---|---|---|
| `recaptcha.html` | Google-hosted reCAPTCHA v2 script with Google's official test keypair | Token is posted to Google's `siteverify`; only `success: true` reaches the passed page |
| `turnstile.html` | Cloudflare-hosted Turnstile script with the official always-pass visible test keypair | Dummy token is posted to Cloudflare Siteverify and checked server-side |
| `hcaptcha.html` | hCaptcha-hosted script with its official publisher test keypair | Passcode is posted to hCaptcha Siteverify with the matching test secret |
| `image-text.html` | Fully owned local image/text form | Local server compares the submitted value; no third party or solver is contacted |

Run `npm run demo:web` for interactive use or `npm run test:web-demo` for the live browser verification. The latter performs detection, policy authorization, agent browser action, real provider callback/validation, passed-state inspection, cookie-preservation check, and same-controller resume for all four cases. Vendor test credentials are intentionally non-production and provide no anti-bot protection.
