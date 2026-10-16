# MCP tool catalog

rea-captcha exposes six bounded stdio MCP tools. `captcha_analyze` works in the zero-configuration Registry launch. The five session tools require a configured existing browser session and preserve that session across inspection, authorized action or handoff, waiting, and resume.

| Tool | Mutates lifecycle | Required input | Purpose |
|---|---:|---|---|
| `captcha_analyze` | No | `url` plus at least one of `html`, `text`, or `runtime_signals` | Classify evidence already captured by an agent without controlling a browser. |
| `captcha_inspect` | No | `session_id` | Inspect a configured browser session and return evidence plus policy. |
| `captcha_complete` | Yes | `session_id`; optional bounded `timeout_ms`, `poll_ms` | Perform an authorized provider-test or owned-origin action in the existing browser, then wait for fresh validation evidence. |
| `captcha_handoff` | Yes | `session_id`, caller-owned `task_id` | Create a generation-scoped human handoff in the existing session; it returns an opaque `handoff.id` and does not copy cookies or challenge tokens. |
| `captcha_wait` | No | `session_id`; optional bounded `timeout_ms`, `poll_ms` | Poll the same session until fresh evidence clears or the timeout expires. |
| `captcha_resume` | Yes | `session_id`; human handoff also requires the matching `task_id` and `handoff_id` | Consume the matching handoff at most once, re-inspect, and resume only after fresh `clear` or `passed` evidence. |

## Zero-configuration analysis

The official MCP Registry entry launches:

```sh
npx rea-captcha@0.3.0 mcp --stateless
```

Review the pinned package version and approve npm's install prompt only when it matches the release you intend to run. The command deliberately does not suppress that prompt.

An agent can immediately call `captcha_analyze` with evidence it already owns:

```json
{
  "url": "https://example.test/checkout",
  "title": "Checkout",
  "html": "<div class=\"cf-turnstile\"></div>"
}
```

The result contains the detected challenge finding, the policy decision, and state `analyzed`. It never navigates, clicks, or submits a challenge.

## Same-session agent lifecycle

Stateful tools use a session from `~/.config/rea-captcha/config.json` or `--config PATH`:

```text
captcha_inspect → captcha_complete → captcha_resume
```

Use `captcha_complete` only when inspection returns `agent-action` or `local-processing`. The Playwright/CDP session must list the exact origin; provider widgets must also carry the vendor's documented non-production test key. Keep the same `session_id` throughout. In this path, `captcha_complete` creates the internal one-shot resume permit, so `captcha_resume` needs only `session_id`. It performs another fresh inspection and fails closed if evidence is missing, malformed, or still blocked.

Unsupported or production third-party challenges return `human-handoff` and are never passed to the automatic action adapter:

```text
captcha_inspect → captcha_handoff → captcha_wait → captcha_resume
```

For a human handoff, choose a stable caller-owned task/run identifier and send it to `captcha_handoff`:

```json
{ "session_id": "checkout-tab", "task_id": "checkout-run-42" }
```

Keep the returned `handoff.id`. The final call must present the same task and handoff identity:

```json
{
  "session_id": "checkout-tab",
  "task_id": "checkout-run-42",
  "handoff_id": "<id returned by captcha_handoff>"
}
```

Starting a newer handoff on the same controller makes the older identity stale. Duplicate concurrent callbacks share one in-flight resume, the lifecycle callback runs at most once, and a later reuse of the consumed identity fails closed. The identity contains no cookies, browser credentials, or provider challenge token.

## Registry metadata

- Server: `io.github.masakaai/rea-captcha`
- Transport: local stdio
- Package: `rea-captcha` on npm
- Authentication: none for the local server
- Network behavior: the MCP process has no hosted solver or telemetry; browser/provider network behavior remains owned by the selected adapter

The machine-readable declaration is [`server.json`](../server.json). Publication uses GitHub Actions OIDC and the official `mcp-publisher`; no MCP Registry token is stored in the repository.
