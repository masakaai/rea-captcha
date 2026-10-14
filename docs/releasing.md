# npm release procedure

The release workflow is `.github/workflows/publish-npm.yml`. It runs only for a published GitHub Release, requires a tag exactly matching `v<package.json version>`, and publishes only after the deterministic suite, live four-provider suite, and clean tarball consumer install pass.

## One-time registry bootstrap

npm requires a package to exist before a Trusted Publisher can be attached. The initial package version is published by the normal GitHub-hosted release workflow with provenance, using a seven-day granular npm token that has package write and 2FA-bypass permission. The token has no organization permission and is stored only as the `NPM_TOKEN` Actions secret.

Immediately after the first successful publish, configure Trusted Publishing, remove the `NODE_AUTH_TOKEN` fallback from the workflow, delete the GitHub secret, and revoke the npm token. Never copy the bootstrap token into a repository file, shell history, release note, or job log.

## Trusted Publisher configuration

Immediately after the bootstrap publish, configure the package on npmjs.com with these exact GitHub Actions values:

| Field | Value |
|---|---|
| Organization or user | `masakaai` |
| Repository | `rea-captcha` |
| Workflow filename | `publish-npm.yml` |
| Environment | unset |
| Allowed action | direct `npm publish` |

The workflow runs on a GitHub-hosted runner with `id-token: write`, npm 11.16, a public repository URL that exactly matches `package.json`, and `publishConfig.provenance: true`. No long-lived npm token is kept after the Trusted Publisher is active.

## MCP Registry publication

`server.json` describes `io.github.masakaai/rea-captcha` and must stay version-aligned with `package.json`. `.github/workflows/publish-mcp.yml` runs after a successful npm publication, downloads a checksum-pinned official `mcp-publisher`, validates the metadata, authenticates with GitHub Actions OIDC, and publishes without a stored MCP credential.

Run `npm run mcp-registry:check` before tagging. The Registry workflow also verifies that the exact npm version is publicly visible before it publishes metadata.

## Normal releases

1. Update `version` in `package.json` and `package-lock.json`.
2. Run `npm ci && npm run check && npm run test:web-demo && npm run test:package`.
3. Merge the version change to `main`.
4. Create and publish a GitHub Release tagged `v<version>` from that exact commit.
5. Confirm the `Publish npm package` workflow passes, then run `npm view rea-captcha version` and `npm audit signatures` from a clean consumer project.

If the Trusted Publisher was newly configured, complete its first successful CI publish before npm's displayed expiry deadline.
