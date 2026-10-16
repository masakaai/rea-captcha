# rea-captcha Python adapter

This package provides the `ChallengePlugin` integration for browser-use and an optional ordered JSONL worker for local `ddddocr` inference. The core plugin has no mandatory third-party dependency.

The Python adapter is currently distributed from the tagged repository source, not PyPI. Install the browser-use extra with:

```sh
python -m pip install 'rea-captcha[browser-use] @ git+https://github.com/masakaai/rea-captcha.git@v0.3.0#subdirectory=python'
```

For local OCR, replace the extra with `rea-captcha[ocr]`. Keep the Git tag pinned so the Python adapter version stays aligned with the repository release.

See the repository's [Browser Use handoff guide](../docs/browser-use.md) for hook timing, timeout behavior, and the boundary between lightweight page reinspection and the task-scoped stateful controller.
