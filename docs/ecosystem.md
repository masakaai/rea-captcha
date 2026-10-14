# Ecosystem and awesome-list intake

## Submitted entries (2026-10-15)

The repository and npm package are public. These submissions are open; submission does not mean acceptance:

| Directory | Submission | Current follow-up |
| --- | --- | --- |
| awesome-playwright | [#241](https://github.com/mxschmitt/awesome-playwright/pull/241) | Awaiting review. |
| mcpHQ | [#254](https://github.com/mcpHQ/awesome-mcp-servers/pull/254) | Awaiting review. |
| punkpeye | [#16418](https://github.com/punkpeye/awesome-mcp-servers/pull/16418) | Requires Glama listing, checks, and score badge. |
| TensorBlock | [#3779](https://github.com/TensorBlock/awesome-mcp-servers/pull/3779) | Generated entry needs the capability update supplied in the PR comment. |
| Steel awesome-web-agents | [#138](https://github.com/steel-dev/awesome-web-agents/pull/138) | Submitted under Dev Tools; awaiting review. |

The intake below records the earlier 2026-10-14 eligibility review. Its pre-release status notes are historical; use the submission table for current follow-up. Descriptions must distinguish provider test-key automation from production challenge solving.

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

> `masakaai/rea-captcha`: Local stdio MCP and SDK for detecting browser verification challenges, completing authorized test or owned-origin actions in the existing browser, verifying clearance, and resuming safely. Tools: `captcha_analyze`, `captcha_inspect`, `captcha_complete`, `captcha_wait`, `captcha_handoff`, `captcha_resume`. Local, no auth, MIT, no hosted solver or telemetry.

Status: technically aligned; wait for public repository and install verification.

### punkpeye/awesome-mcp-servers

Target category: Browser Automation. Use the list's icon grammar after the package is public: TypeScript, local, macOS/Windows/Linux. Keep the entry factual and alphabetically placed.

Prepared entry:

> `masakaai/rea-captcha` — Local verification-challenge controller for browser agents. Detects common widgets, performs authorized actions in an existing browser session, and exposes six stdio MCP tools. MIT; no cloud solver or telemetry.

Status: wait for public install and repository health checks.

### morluto/rea-codex-cli

Reviewed commit `27321cf`. Candidate sections are Domain-Specific Agent Skills and MCP Servers. Its contribution rules require proven external usage, real Codex integration, and one factual line.

Prepared entry after adoption exists:

> `rea-captcha` — Local Codex skill and stdio MCP that detects browser verification blocks, performs authorized actions in the existing Playwright/CDP session, and verifies safe task resume.

Status: do not submit yet; the list explicitly declines projects without external usage.

### tioraicom/awesome-ai-agents

Reviewed commit `db5b4d4`, category `Browser and computer-use agents`. The list requires a project to perform multiple steps autonomously. rea-captcha is browser-agent infrastructure and intentionally does not make agent decisions.

Status: not eligible under the current definition; no submission prepared.

### ZYSzys/awesome-captcha

Reviewed commit `15af6b1`. The list accepts CAPTCHA libraries, recognition tools, and adjacent tooling; its contribution guide asks contributors to have used the submitted content and accept the list license.

Prepared entry for `Tools` or `Other`:

> `rea-captcha` — Local-first challenge detection and authorized agent actions, with official test-provider demos and optional owned-origin image/text handling. It does not automate production interactive challenges.

Status: relevant but potentially sensitive category fit; open an issue first after the public demo and repository exist.

### mehranakila56-ops/awesome-ai-browser-agents

Reviewed commit `88da194`, category `MCP Servers & Browser Tools`. Requirements include browser-agent relevance, documentation, recent maintenance, and 50 GitHub stars or exceptional niche value.

Prepared entry:

> `rea-captcha` — Local stdio MCP and SDK that detects verification blocks, performs authorized actions in the active Playwright/CDP session, validates clearance, and resumes the browser agent.

Status: exact technical fit, but wait for public release and either the stated star threshold or maintainer confirmation of the niche-value exception.

### steel-dev/awesome-web-agents

Reviewed commit `ad74156`, category `AI Web Automation Tools / Dev Tools`. Its policy requires direct web-agent value, a public verifiable reference, one-item PR, neutral wording, non-duplication, and contributor-affiliation disclosure.

Prepared entry:

> `[rea-captcha](https://github.com/masakaai/rea-captcha) - Local verification-challenge controller and MCP for evidence-based detection, authorized same-session agent actions, and safe resume.`

Status: technically eligible after public release; the PR must disclose project affiliation.

### Agent-Tools/awesome-autonomous-web

Reviewed commit `18ad5d9`. The best-fit section is `MCP Servers for Browser Automation`; the list also has a `Web Authentication` section.

Prepared entry:

> `rea-captcha` — Local MCP controller for browser verification evidence, authorized browser actions, server-validated completion, and same-session agent resume.

Status: wait for public repository, install path, and demo URL; re-check contribution mechanics before submission because no standalone contribution guide was present.

### atalariq/awesome-browser

Reviewed commit `b6f2b86`, category `Automation & Testing`. Its rules require an official source, verifiable maintenance and license, concrete browser use, objective wording, controlled tags, and no duplication.

Prepared entry:

> `[rea-captcha](https://github.com/masakaai/rea-captcha) - Local challenge detection and authorized same-session action controller for browser automation agents.  \`Open Source\` \`Chromium\` \`WebKit\` \`Cross-platform\` \`Automation\``

Status: wait for public maintenance history and release artifacts.

### abordage/awesome-mcp

Reviewed commit `54c4158`, category `Browser Automation`. The README is generated; contributions must edit `repositories.yaml`. Projects must be GitHub-hosted, open source, active, documented, and useful.

Prepared YAML:

```yaml
- url: https://github.com/masakaai/rea-captcha
  description: "Local MCP server for verification-challenge detection, authorized same-session actions, and safe browser-agent resume."
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
