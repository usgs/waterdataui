"""
Initialize the Water Data for the Nation Flask application.
"""
import json
import logging
import os
import sys

from flask import Flask


__version__ = '0.34.0dev'


def _create_log_handler(log_directory=None, log_name=__name__):
    """
    Create a handler object. The logs will be streamed
    to stdout using StreamHandler if a log directory is not specified.
    If a logfile is specified, a handler will be created so logs
    will be written to the file.
    :param str log_directory: optional path of a directory where logs can be written to
    :return: a handler
    :rtype: logging.Handler
    """
    if log_directory is not None:
        log_file = '{}.log'.format(log_name)
        log_path = os.path.join(log_directory, log_file)
        log_handler = logging.FileHandler(log_path)
    else:
        log_handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - {%(pathname)s:L%(lineno)d} - %(message)s')
    log_handler.setFormatter(formatter)
    return log_handler


app = Flask(__name__.split()[0], instance_relative_config=True)  # pylint: disable=C0103

# Loads configuration information from config.py and instance/config.py
app.config.from_object('config')

try:
    app.config.from_pyfile('config.py')
except FileNotFoundError:
    pass

# Read lookup files and save to the app.config
with open(os.path.join(app.config.get('DATA_DIR'),
                       app.config.get('NWIS_CODE_LOOKUP_FILENAME')), 'r') as f:
    app.config['NWIS_CODE_LOOKUP'] = json.loads(f.read())

with open(os.path.join(app.config.get('DATA_DIR'),
                       app.config.get('COUNTRY_STATE_COUNTY_LOOKUP_FILENAME')), 'r') as f:
    app.config['COUNTRY_STATE_COUNTY_LOOKUP'] = json.loads(f.read())

with open(os.path.join(app.config.get('DATA_DIR'),
                       app.config.get('HUC_LOOKUP_FILENAME')), 'r') as f:
    app.config['HUC_LOOKUP'] = json.loads(f.read())

with open(app.config.get('MONITORING_CAMERA_PATH'), 'r') as json_file:
    app.config['MONITORING_CAMERA_LOOKUP'] = json_file.read()


# Load static assets manifest file, which maps source file names to the
# corresponding versioned/hashed file name.
manifest_path = app.config.get('ASSET_MANIFEST_PATH')
if manifest_path:
    with open(manifest_path, 'r') as f:
        app.config['ASSET_MANIFEST'] = json.loads(f.read())

if app.config.get('LOGGING_ENABLED'):
    # pylint: disable=C0103
    loglevel = app.config.get('LOGGING_LEVEL')
    handler = _create_log_handler(log_directory=app.config.get('LOGGING_DIRECTORY'))
    # Do not set logging level in the handler.
    # Otherwise, if Flask's DEBUG is set to False,
    # all logging will be disabled.
    # Instead, set the level in the logger object.
    app.logger.setLevel(loglevel)
    app.logger.addHandler(handler)


# setup up serving of static files by whitenoise if running in a container
if os.getenv('CONTAINER_RUN', False):
    from whitenoise import WhiteNoise
    app.wsgi_app = WhiteNoise(app.wsgi_app, root='/home/python/assets', prefix='static/')

from . import views  # pylint: disable=C0413
from . import filters  # pylint: disable=C0413
