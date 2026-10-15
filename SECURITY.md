# Security policy

Report vulnerabilities through this repository's [private security advisory form](https://github.com/masakaai/rea-captcha/security/advisories/new). Do not include live credentials, session tokens, browser profiles, or captured challenge data in a public issue.

Security fixes target the latest published release and `main`. Include the affected version, a minimal redacted reproduction, expected impact, and any safe mitigation. Maintainers will acknowledge a report after triage and coordinate disclosure when a fix is available; response time depends on severity and reproducibility.

Configuration stores environment variable names, not credential values. Keep config and JSONL event logs private. Only enable local image processing for origins you own or are explicitly authorized to test.

Provider-test automation is disabled by default. Enable it only for an exact authorized origin using the vendor's documented non-production key. The Playwright adapter rejects production keys before interacting with a provider widget.
