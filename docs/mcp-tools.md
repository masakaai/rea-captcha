# MCP tool catalog

rea-captcha exposes five bounded stdio MCP tools. `captcha_analyze` works in the zero-configuration Registry launch. The four session tools require a configured browser session and preserve that session across inspection, handoff, waiting, and resume.

| Tool | Mutates lifecycle | Required input | Purpose |
|---|---:|---|---|
| `captcha_analyze` | No | `url` plus at least one of `html`, `text`, or `runtime_signals` | Classify evidence already captured by an agent without controlling a browser. |
| `captcha_inspect` | No | `session_id` | Inspect a configured browser session and return evidence plus policy. |
| `captcha_handoff` | Yes | `session_id` | Mark one blocked session as awaiting a person; it does not copy cookies or tokens. |
| `captcha_wait` | No | `session_id`; optional bounded `timeout_ms`, `poll_ms` | Poll the same session until fresh evidence clears or the timeout expires. |
| `captcha_resume` | Yes | `session_id` | Re-inspect and resume only after fresh `clear` or `passed` evidence. |

## Zero-configuration analysis

The official MCP Registry entry launches:

```sh
npx -y rea-captcha@0.1.0 mcp --stateless
```

An agent can immediately call `captcha_analyze` with evidence it already owns:

```json
{
  "url": "https://example.test/checkout",
  "title": "Checkout",
  "html": "<div class=\"cf-turnstile\"></div>"
}
```

The result contains the detected challenge finding, the policy decision, and state `analyzed`. It never navigates, clicks, or submits a challenge.

## Same-session lifecycle

Stateful tools use a session from `~/.config/rea-captcha/config.json` or `--config PATH`:

```text
captcha_inspect → captcha_handoff → captcha_wait → captcha_resume
```

Keep the same `session_id` throughout. Do not repeat browser actions while a handoff is active. `captcha_resume` performs a fresh inspection and fails closed if evidence is missing, malformed, or still blocked.

## Registry metadata

- Server: `io.github.masakaai/rea-captcha`
- Transport: local stdio
- Package: `rea-captcha` on npm
- Authentication: none for the local server
- Network behavior: the MCP process has no hosted solver or telemetry; browser/provider network behavior remains owned by the selected adapter

The machine-readable declaration is [`server.json`](../server.json). Publication uses GitHub Actions OIDC and the official `mcp-publisher`; no MCP Registry token is stored in the repository.
