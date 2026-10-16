# Release procedure

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

1. Update the aligned version in `package.json`, `package-lock.json`, and `python/pyproject.toml`.
2. Run `npm ci && npm run check && npm run test:web-demo && npm run test:package`.
3. Merge the version change to `main`.
4. Create and publish a GitHub Release tagged `v<version>` from that exact commit.
5. Confirm the npm, PyPI, and MCP publication workflows pass. Then verify `npm view rea-captcha version`, `npm audit signatures`, and the public PyPI project from clean consumers.

If the Trusted Publisher was newly configured, complete its first successful CI publish before npm's displayed expiry deadline.

## Python package publication

The Python adapter is built and published by `.github/workflows/publish-pypi.yml`. The build and publish jobs are separate: the build job has read-only repository access, while only the final PyPI job receives `id-token: write`. The workflow builds both a wheel and source distribution, runs strict metadata validation, installs the wheel into a clean virtual environment, and uploads the verified files as one short-lived artifact before publication.

The GitHub `pypi` environment accepts deployments only from the `main` branch and tags matching `v*`.

For the first release, sign in to PyPI and add a pending GitHub trusted publisher with these exact values:

| Field | Value |
|---|---|
| PyPI project name | `rea-captcha` |
| GitHub owner | `masakaai` |
| Repository | `rea-captcha` |
| Workflow filename | `publish-pypi.yml` |
| Environment | `pypi` |

The pending publisher does not reserve the package name. Configure it immediately before the first publish, then manually dispatch `Publish Python package` with the exact release tag and `publish` enabled. A build-only manual dispatch leaves `publish` disabled and exercises the complete artifact path without requesting a PyPI credential.

Future published GitHub Releases trigger both npm and PyPI workflows. Confirm the Python workflow passes, then verify the public version and provenance at `https://pypi.org/project/rea-captcha/`. Never add a PyPI password or long-lived token to this repository.
