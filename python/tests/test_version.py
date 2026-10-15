import json
import pathlib
import re
import sys
import unittest

PYTHON_ROOT = pathlib.Path(__file__).parents[1]
REPOSITORY_ROOT = PYTHON_ROOT.parent
sys.path.insert(0, str(PYTHON_ROOT / "src"))

from rea_captcha import __version__


class VersionTests(unittest.TestCase):
	def test_python_and_repository_versions_match(self):
		package = json.loads((REPOSITORY_ROOT / "package.json").read_text())
		pyproject = (PYTHON_ROOT / "pyproject.toml").read_text()
		match = re.search(r'^version = "([^"]+)"$', pyproject, flags=re.MULTILINE)

		self.assertIsNotNone(match)
		self.assertEqual(__version__, package["version"])
		self.assertEqual(match.group(1), package["version"])


if __name__ == "__main__":
	unittest.main()
