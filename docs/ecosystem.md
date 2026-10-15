# Ecosystem and awesome-list intake

## Submitted entries (checked 2026-10-16)

The repository and npm package are public. Statuses below were checked on 2026-10-16; submission does not mean acceptance:

| Directory | Submission | Current follow-up |
| --- | --- | --- |
| Hermes Agent plugin catalog | [#139304](https://github.com/NousResearch/hermes-agent/pull/139304) | Portable Agent Plugins v1 package and catalog entry validated locally; awaiting catalog CI and maintainer review. |
| awesome-playwright | [#241](https://github.com/mxschmitt/awesome-playwright/pull/241) | Awaiting review. |
| mcpHQ | [#254](https://github.com/mcpHQ/awesome-mcp-servers/pull/254) | Included on main in catalog commit `3b21aed`; PR closed after batch integration. |
| punkpeye | [#16418](https://github.com/punkpeye/awesome-mcp-servers/pull/16418) | [Glama listing](https://glama.ai/mcp/servers/masakaai/rea-captcha) is live; container build and six-tool MCP introspection passed, Glama 0.2.1 published, requested score badge added. Awaiting review. |
| TensorBlock | [#3779](https://github.com/TensorBlock/awesome-mcp-servers/pull/3779) | Merged on October 15. Main-branch entry includes authorized provider-test scope and the stateless stdio launch command. Website deployment is separate. |
| Steel awesome-web-agents | [#138](https://github.com/steel-dev/awesome-web-agents/pull/138) | Submitted under Dev Tools; awaiting review. |
| Agent-Tools awesome-autonomous-web | [#39](https://github.com/Agent-Tools/awesome-autonomous-web/pull/39) | Awaiting review. |
| Awesome AI Agent Tools | [#114](https://github.com/michielhdoteth/awesome-ai-agent-tools/pull/114) | Merged on October 15; entry verified in the main catalog. |
| abordage awesome-mcp | [#165](https://github.com/abordage/awesome-mcp/pull/165) | Awaiting review. |
| AIAnytime Awesome-MCP-Servers | [#218](https://github.com/AIAnytime/Awesome-MCP-Servers/pull/218) | Merged; entry verified in the main README. |
| YuzeHao2023 Awesome-MCP-Servers | [#637](https://github.com/YuzeHao2023/Awesome-MCP-Servers/pull/637) | Awaiting review. |
| ToolSDK MCP registry | [#859](https://github.com/toolsdk-ai/toolsdk-mcp-registry/pull/859) | Awaiting review; catalog publication also requires maintainers. |
| Backblaze Agent Infrastructure | [#35](https://github.com/backblaze-labs/awesome-agent-infrastructure/pull/35) | Awaiting review. |
| Agent Skill Index | [#593](https://github.com/heilcheng/awesome-agent-skills/pull/593) | Upstream conflict resolved at `4575106`; submission check passes and the PR is mergeable. The new catalog policy holds entries until the repository has at least 20 stars and is 14 days old. |
| browser-use awesome-projects | [#11](https://github.com/browser-use/awesome-projects/pull/11) | Awaiting review. |
| Awesome Computer Use | [#46](https://github.com/ranpox/awesome-computer-use/pull/46) | Awaiting review. |
| Awesome Testing Tools | [#176](https://github.com/ZoranPandovski/awesome-testing-tools/pull/176) | Submitted under Automated Testing Tools; awaiting review. |
| Awesome DevOps MCP Servers | [#368](https://github.com/rohitg00/awesome-devops-mcp-servers/pull/368) | Submitted under Testing & Chaos Engineering; awaiting review. |
| angrykoala awesome-browser-automation | [#193](https://github.com/angrykoala/awesome-browser-automation/pull/193) | Closed without merge or review comments; no resubmission. |

Open inclusion requests, not accepted listings: [awesome-captcha #35](https://github.com/ZYSzys/awesome-captcha/issues/35), [awesome-browser #4](https://github.com/atalariq/awesome-browser/issues/4), [Ever Works #204](https://github.com/ever-works/awesome-mcp-servers/issues/204), and [MCPM #453](https://github.com/pathintegral-institute/mcpm.sh/issues/453). MCPM's automatic manifest job was skipped because the required submission label was not applied; maintainer review is pending.

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
