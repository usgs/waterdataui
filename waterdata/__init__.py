"""
Initialize the Water Data for the Nation Flask application.
"""

from flask import Flask


__version__ = '0.1.0dev'

app = Flask(__name__.split()[0], instance_relative_config=True)  # pylint: disable=C0103

# Loads configuration information from config.py and instance/config.py
app.config.from_object('config')
try:
    app.config.from_pyfile('config.py')
except FileNotFoundError:
    pass

from . import views  # pylint: disable=C0413
