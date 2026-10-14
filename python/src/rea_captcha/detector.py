from __future__ import annotations

from dataclasses import dataclass
import re


@dataclass(frozen=True)
class ChallengeFinding:
	kind: str | None
	confidence: float
	url: str
	title: str
	evidence: tuple[str, ...]

	@property
	def active(self) -> bool:
		return self.kind is not None


_RULES: tuple[tuple[str, re.Pattern[str], float], ...] = (
	("recaptcha", re.compile(r"(?:google\.com|recaptcha\.net)/recaptcha|g-recaptcha", re.I), 0.99),
	("hcaptcha", re.compile(r"hcaptcha\.com|h-captcha", re.I), 0.99),
	("turnstile", re.compile(r"challenges\.cloudflare\.com|cf-turnstile|turnstile", re.I), 0.98),
	("geetest", re.compile(r"geetest|gt-captcha|geetest_challenge", re.I), 0.97),
	("datadome", re.compile(r"datadome|captcha-delivery\.com", re.I), 0.97),
	("perimeterx", re.compile(r"perimeterx|px-captcha|human-challenge", re.I), 0.96),
	("aws-waf", re.compile(r"awswafcaptcha|aws-waf-token|captcha\.awswaf", re.I), 0.96),
	("image-text", re.compile(r"(?:captcha|verification[-_ ]?code)", re.I), 0.82),
	("generic-verification", re.compile(r"verify (?:that )?you(?:'re| are) human|security check|complete the verification|请完成验证|验证码|安全验证", re.I), 0.68),
)


def detect_challenge(*, url: str, title: str, dom_text: str) -> ChallengeFinding:
	"""Detect challenge evidence from browser-use's current DOM representation."""
	matches: list[tuple[str, str, float]] = []
	for kind, pattern, confidence in _RULES:
		match = pattern.search(dom_text)
		if match:
			matches.append((kind, match.group(0)[:240], confidence))
	if not matches:
		return ChallengeFinding(kind=None, confidence=0.95, url=url, title=title, evidence=())
	selected = max(matches, key=lambda item: item[2])
	confidence = min(1.0, selected[2] + min(0.05, max(0, len(matches) - 1) * 0.02))
	return ChallengeFinding(
		kind=selected[0],
		confidence=confidence,
		url=url,
		title=title,
		evidence=tuple(item[1] for item in matches),
	)
