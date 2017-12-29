"""
Unit tests for the main WDFN views.
"""

from unittest import TestCase

from .. import app
from ..views import __version__


class TestHomeView(TestCase):
    """Basic tests validating existence of pages."""

    def setUp(self):
        self.app_client = app.test_client()

    def test_version(self):
        """Verify that the version number is in the home page response."""
        response = self.app_client.get('/')

        self.assertEqual(response.status_code, 200)
        self.assertIn(__version__, response.data.decode('utf-8'))
