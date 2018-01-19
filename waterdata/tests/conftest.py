"""
pytest fixtures.
"""

import pytest

from .. import app as my_app


@pytest.fixture
def app():
    """
    App fixture used by flask-pytest to provide fixtures for many Flask
    testing helpers.
    """
    return my_app
