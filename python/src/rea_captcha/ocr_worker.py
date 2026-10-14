from __future__ import annotations

import base64
import json
import sys
from typing import Any


def _engine() -> Any:
	try:
		import ddddocr  # type: ignore[import-not-found]
	except ImportError as error:
		raise RuntimeError("Local OCR is optional. Install rea-captcha[ocr] to enable it.") from error
	return ddddocr.DdddOcr(show_ad=False)


def main() -> None:
	engine: Any | None = None
	for raw in sys.stdin:
		try:
			request = json.loads(raw)
			request_id = request.get("id")
			if not isinstance(request_id, int):
				raise ValueError("id must be an integer")
			encoded = request.get("imageBase64")
			if not isinstance(encoded, str) or not encoded:
				raise ValueError("imageBase64 is required")
			if engine is None:
				engine = _engine()
			image = base64.b64decode(encoded, validate=True)
			text = engine.classification(image)
			response = {"id": request_id, "text": str(text), "confidence": None, "engine": "ddddocr"}
		except Exception as error:  # JSONL boundary: return one bounded error per request.
			request_id = locals().get("request_id", None)
			response = {"id": request_id, "error": str(error)}
		sys.stdout.write(json.dumps(response, ensure_ascii=False) + "\n")
		sys.stdout.flush()


if __name__ == "__main__":
	main()
