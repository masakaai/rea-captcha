import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).parents[1] / "src"))

from rea_captcha.detector import detect_challenge


class DetectorTests(unittest.TestCase):
	def test_detects_turnstile(self):
		finding = detect_challenge(
			url="https://example.test/",
			title="Check",
			dom_text='<iframe src="https://challenges.cloudflare.com/turnstile/v0"></iframe>',
		)
		self.assertTrue(finding.active)
		self.assertEqual(finding.kind, "turnstile")

	def test_normal_page_is_clear(self):
		finding = detect_challenge(url="https://example.test/", title="Home", dom_text="Welcome")
		self.assertFalse(finding.active)


if __name__ == "__main__":
	unittest.main()
