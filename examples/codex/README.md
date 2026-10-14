# Codex stdio MCP case

Build the repository and use absolute paths:

```sh
node scripts/rea-captcha.mjs setup --yes
node scripts/rea-captcha.mjs agent-config --agent codex
```

Run the printed command, or register it manually with absolute paths:

```sh
codex mcp add rea-captcha -- \
  node /absolute/path/to/rea-captcha/scripts/rea-captcha.mjs \
  mcp --config /absolute/path/to/config.json

codex mcp list
```

The same server can be configured in project-scoped `.codex/config.toml` for trusted projects:

```toml
[mcp_servers.rea-captcha]
command = "node"
args = [
  "/absolute/path/to/rea-captcha/scripts/rea-captcha.mjs",
  "mcp",
  "--config",
  "/absolute/path/to/config.json"
]
startup_timeout_sec = 10
tool_timeout_sec = 150
required = false
default_tools_approval_mode = "writes"
```

Codex treats `captcha_inspect` and `captcha_wait` as read-only from their MCP annotations. `captcha_complete` performs a bounded write in the existing browser; handoff and resume also change controller state and are marked as writes.
