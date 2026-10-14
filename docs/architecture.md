# Architecture

rea-captcha follows REA's inward dependency rule and keeps resource ownership explicit.

```mermaid
flowchart TD
  CLI[CLI adapter] --> COMP[Composition]
  MCP[MCP stdio adapter] --> COMP
  COMP --> APP[Application controller]
  MCP --> CONTRACTS[Tool contracts]
  APP --> DOMAIN[Domain state and evidence]
  APP --> PORTS[Browser and lifecycle ports]
  PW[Playwright adapter] --> PORTS
  CDP[CDP connection adapter] --> PW
  JET[Jet Browser adapter] --> PORTS
  JETJSONL[Jet standalone JSONL owner] --> PORTS
  INLINE[Inline fixture adapter] --> PORTS
  OCR[Local OCR process adapter] --> DOMAIN
  PY[browser-use plugin] --> DOMAIN
```

The browser adapter owns observation and, when explicitly configured, bounded agent actions. The caller owns Playwright pages and managed Jet Browser sessions. The CDP composition attaches to the agent's already-running browser, owns only that connection, and never launches or terminates the external browser process. Before clicking, the Playwright adapter checks the exact origin and confirms a provider-documented test sitekey; owned image/text actions require an explicit value. The Jet standalone adapter is different: it explicitly owns one child process and its WPE session, keeps ordered command waiters, and closes both in cleanup.

The controller owns its state machine and the last inspection. An event sink owns its JSONL file and serializes appends. The optional OCR runtime owns exactly one child process and rejects all pending requests if it exits.

An inspection preserves URL, title, capture time, signal source, matched value, and confidence. Policy consumes the parsed finding; downstream code does not reinterpret raw HTML. A policy decision alone cannot authorize a provider click: the action-capable adapter independently enforces origin and test-key constraints before the controller waits for fresh server-validated evidence.
