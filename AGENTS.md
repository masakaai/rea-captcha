# Repository guidelines

rea-captcha is a local-first verification challenge controller for browser agents. Preserve evidence provenance, browser-session ownership, bounded waits, and human handoff semantics across every adapter.

Dependencies flow inward: `domain → contracts/application → provider adapters → composition → CLI/MCP`. Domain and application code must not import Playwright, Jet Browser, MCP, browser-use, or ddddocr. Browser lifecycle belongs to the caller unless a composition object explicitly documents ownership.

Unknown boundary values must fail closed. An unavailable detector, malformed browser evaluation, missing credential, or incomplete observation cannot be interpreted as “challenge clear.” Never resume an agent without a fresh clear or passed observation.

Commercial solver APIs, telemetry, stealth claims, and automatic handling of third-party interactive challenges are outside project scope. Local image OCR requires an exact authorized origin and an explicit policy switch.

Use the pinned Node/npm versions. Run `npm run typecheck`, `npm test`, `npm run test:python`, `npm run build`, and `npm run docs:check` for broad changes. Browser-boundary changes also require `npm run test:browser`. Jet Browser standalone verification additionally needs Docker and belongs in the upstream Jet Browser checkout.
