# Ecosystem and awesome-list intake

This intake was reviewed on 2026-10-14 against the repositories and commits below. The prepared entries become eligible only after `https://github.com/masakaai/rea-captcha` is public and its install command resolves from a public registry or documented source checkout.

## Runtime cases collected

- [Playwright](https://github.com/microsoft/playwright) — borrowed Page and CDP connection cases.
- [browser-use](https://github.com/browser-use/browser-use) — Python Agent hooks, pause/resume, and an existing BrowserSession. The adapter targets the verified 0.13.x API.
- [Jet Browser](https://github.com/masakaai/jet-browser) — optional WPE WebKit provider through trusted SDK evaluation; it is not a dependency or default runtime. The adapter targets the versioned 0.6.5 contract.
- [open-browser-use](https://github.com/open-browser-use/open-browser-use) — future adapter candidate because it exposes a persistent browser broker and MCP surface.
- [Browser Agent Protocol](https://github.com/browseragentprotocol/bap) — future protocol adapter candidate.
- [chrome-use](https://github.com/leeguooooo/chrome-use) — useful human-handoff comparison for a user's existing Chrome profile.

The first three have code or executable examples in this repository. The latter three are collected design cases and are not advertised as implemented.

## Awesome-list candidates

### TensorBlock/awesome-mcp-servers

Reviewed commit `cfe78dd`, category `Browser Automation & Web Scraping`. Its metadata guide asks for install command, transport, auth, clients, tools, license, and docs.

Prepared entry:

> `masakaai/rea-captcha`: Local stdio MCP and SDK for detecting browser verification challenges, pausing an agent, preserving its existing browser session for visible human handoff, verifying clearance, and resuming safely. Tools: `captcha_analyze`, `captcha_inspect`, `captcha_wait`, `captcha_handoff`, `captcha_resume`. Local, no auth, MIT, no hosted solver or telemetry.

Status: technically aligned; wait for public repository and install verification.

### punkpeye/awesome-mcp-servers

Target category: Browser Automation. Use the list's icon grammar after the package is public: TypeScript, local, macOS/Windows/Linux. Keep the entry factual and alphabetically placed.

Prepared entry:

> `masakaai/rea-captcha` — Local verification-challenge controller for browser agents. Detects common challenge widgets, coordinates human handoff in an existing browser session, and exposes five stdio MCP tools. MIT; no cloud solver or telemetry.

Status: wait for public install and repository health checks.

### morluto/rea-codex-cli

Reviewed commit `27321cf`. Candidate sections are Domain-Specific Agent Skills and MCP Servers. Its contribution rules require proven external usage, real Codex integration, and one factual line.

Prepared entry after adoption exists:

> `rea-captcha` — Local Codex skill and stdio MCP that detects browser verification blocks, coordinates human handoff in the existing session, and verifies safe task resume across Playwright/CDP and browser-use.

Status: do not submit yet; the list explicitly declines projects without external usage.

### tioraicom/awesome-ai-agents

Reviewed commit `db5b4d4`, category `Browser and computer-use agents`. The list requires a project to perform multiple steps autonomously. rea-captcha is browser-agent infrastructure and intentionally does not make agent decisions.

Status: not eligible under the current definition; no submission prepared.

### ZYSzys/awesome-captcha

Reviewed commit `15af6b1`. The list accepts CAPTCHA libraries, recognition tools, and adjacent tooling; its contribution guide asks contributors to have used the submitted content and accept the list license.

Prepared entry for `Tools` or `Other`:

> `rea-captcha` — Local-first challenge detection and human-handoff control for browser agents, with official test-provider demos and optional authorized-origin image/text OCR. It does not automate production interactive challenges.

Status: relevant but potentially sensitive category fit; open an issue first after the public demo and repository exist.

### mehranakila56-ops/awesome-ai-browser-agents

Reviewed commit `88da194`, category `MCP Servers & Browser Tools`. Requirements include browser-agent relevance, documentation, recent maintenance, and 50 GitHub stars or exceptional niche value.

Prepared entry:

> `rea-captcha` — Local stdio MCP and SDK that detects verification blocks, preserves the active Playwright/CDP session for human handoff, validates clearance, and resumes the browser agent.

Status: exact technical fit, but wait for public release and either the stated star threshold or maintainer confirmation of the niche-value exception.

### steel-dev/awesome-web-agents

Reviewed commit `ad74156`, category `AI Web Automation Tools / Dev Tools`. Its policy requires direct web-agent value, a public verifiable reference, one-item PR, neutral wording, non-duplication, and contributor-affiliation disclosure.

Prepared entry:

> `[rea-captcha](https://github.com/masakaai/rea-captcha) - Local verification-challenge controller and MCP for evidence-based detection, same-session human handoff, and safe browser-agent resume.`

Status: technically eligible after public release; the PR must disclose project affiliation.

### Agent-Tools/awesome-autonomous-web

Reviewed commit `18ad5d9`. The best-fit section is `MCP Servers for Browser Automation`; the list also has a `Web Authentication` section.

Prepared entry:

> `rea-captcha` — Local MCP controller for browser verification evidence, visible human handoff, server-validated completion, and same-session agent resume.

Status: wait for public repository, install path, and demo URL; re-check contribution mechanics before submission because no standalone contribution guide was present.

### atalariq/awesome-browser

Reviewed commit `b6f2b86`, category `Automation & Testing`. Its rules require an official source, verifiable maintenance and license, concrete browser use, objective wording, controlled tags, and no duplication.

Prepared entry:

> `[rea-captcha](https://github.com/masakaai/rea-captcha) - Local challenge detection and same-session human-handoff controller for browser automation agents.  \`Open Source\` \`Chromium\` \`WebKit\` \`Cross-platform\` \`Automation\``

Status: wait for public maintenance history and release artifacts.

### abordage/awesome-mcp

Reviewed commit `54c4158`, category `Browser Automation`. The README is generated; contributions must edit `repositories.yaml`. Projects must be GitHub-hosted, open source, active, documented, and useful.

Prepared YAML:

```yaml
- url: https://github.com/masakaai/rea-captcha
  description: "Local MCP server for verification-challenge detection, same-session human handoff, and safe browser-agent resume."
```

Status: structurally eligible only after the public repository has meaningful release and maintenance history.

## Submission gate

Before opening any external PR:

1. Publish the repository and immutable license files.
2. Verify `npm install rea-captcha` and the Python extra from clean environments.
3. Run the full CI matrix and record a release tag.
4. Publish the four-case demo using official non-production provider credentials plus the owned local fixture.
5. Confirm the target list's latest contribution rules and duplicate search.
6. Submit only factual capabilities demonstrated by tests in this repository.
