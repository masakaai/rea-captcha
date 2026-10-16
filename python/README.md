# rea-captcha Python adapter

This package provides the `ChallengePlugin` integration for browser-use and an optional ordered JSONL worker for local `ddddocr` inference. The core plugin has no mandatory third-party dependency.

The Python adapter is currently distributed as a verified GitHub release wheel, not on PyPI. Install the browser-use extra with:

```sh
python -m pip install 'rea-captcha[browser-use] @ https://github.com/masakaai/rea-captcha/releases/download/v0.3.0/rea_captcha-0.3.0-py3-none-any.whl'
```

For local OCR, replace the extra with `rea-captcha[ocr]`. Keep the release asset URL pinned so the Python adapter version stays aligned with the repository release.

See the repository's [Browser Use handoff guide](../docs/browser-use.md) for hook timing, timeout behavior, and the boundary between lightweight page reinspection and the task-scoped stateful controller.
