# Security policy

Report vulnerabilities privately through the security advisory feature of the future public repository. Do not include live credentials, session tokens, browser profiles, or captured challenge data in an issue.

Configuration stores environment variable names, not credential values. Keep config and JSONL event logs private. Only enable local image processing for origins you own or are explicitly authorized to test.

Provider-test automation is disabled by default. Enable it only for an exact authorized origin using the vendor's documented non-production key. The Playwright adapter rejects production keys before interacting with a provider widget.
