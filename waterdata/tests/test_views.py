
from unittest import TestCase

from .. import app
from ..views import __version__

class TestHomeView(TestCase):

    def setUp(self):
        self.app_client = app.test_client()

    def test_version(self):
        response = self.app_client.get('/')

        self.assertEqual(response.status_code, 200)
        self.assertIn(__version__, response.data.decode('utf-8'))
