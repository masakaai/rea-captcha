# Contributing

Use Node and npm versions from `.nvmrc` and `package.json`. Install with `npm ci` and run `npm run check` before a pull request. Browser adapter changes also require `npm run test:browser`.

New detectors need a positive fixture, a nearby negative fixture, evidence provenance, and an explicit policy decision. New browser adapters must declare resource ownership and prove cleanup without closing a borrowed session. New model integrations must update `MODEL_LICENSES.md` and must not commit model weights.

Use Conventional Commit subjects. Describe behavior, validation, and any runtime or provider behavior that could not be verified.
