"""
Initialize the Water Data for the Nation Flask application.
"""
import json

from flask import Flask


__version__ = '0.1.0dev'

app = Flask(__name__.split()[0], instance_relative_config=True)  # pylint: disable=C0103

# Loads configuration information from config.py and instance/config.py
app.config.from_object('config')
try:
    app.config.from_pyfile('config.py')
except FileNotFoundError:
    pass

# Read lookup files and save to the app.config
with open(app.config.get('NWIS_CODE_LOOKUP_FILENAME'), 'r') as f:
    app.config['NWIS_CODE_LOOKUP'] = json.loads(f.read())

with open(app.config.get('COUNTRY_STATE_COUNTY_LOOKUP_FILENAME'), 'r') as f:
    app.config['COUNTRY_STATE_COUNTY_LOOKUP'] = json.loads(f.read())



from . import views  # pylint: disable=C0413
