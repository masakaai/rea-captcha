## Summary

Describe the problem, the smallest change that solves it, and the affected integration surface.

## Validation

List the exact commands and manual checks you ran, including failures or provider behavior that could not be verified.

## Boundary checklist

- [ ] Borrowed browser sessions remain owned and closed by the caller.
- [ ] Resume requires a fresh `clear` or `passed` observation; completion or handoff alone is not treated as proof.
- [ ] Unknown evidence fails closed.
- [ ] No credential, cookie, browser profile, challenge token, model weight, or private-page evidence is included.
- [ ] No stealth claim, commercial solver API, telemetry, or automatic third-party production-challenge handling is introduced.
- [ ] Tests and documentation cover the changed behavior.
