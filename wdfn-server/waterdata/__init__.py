"""
Initialize the Water Data for the Nation Flask application.
"""
import json
import logging
import os
import sys
import requests
import smtplib

from flask import Flask
from apscheduler.schedulers.background import BackgroundScheduler
from email.message import EmailMessage


__version__ = '0.43.0dev'


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


def send_email(message):
    msg = EmailMessage()
    msg['Subject'] = 'WDFN - Lookup Error'
    msg['From'] = 'WDFN Server'
    msg['To'] = (', ').join(app.config['EMAIL_LIST_DEVELOPERS'].split(','))
    msg.set_content(message)
    try:
        server = smtplib.SMTP(app.config['MAIL_SERVER'])
        server.send_message(msg)
        server.quit()

    except Exception as e:
        app.logger.error('Error when sending email about lookups: ', e)



def load_lookup_from_backup_file(lookup_name):
    app.logger.error('Looking for existing lookup named {}. If found, I will use the old file and check '
                     'again later for a new one.'.format(lookup_name))
    try:
        target_file_path = os.path.join(app.config.get('DATA_DIR'), 'lookups/{}.json'.format(lookup_name.lower()))
        app.logger.debug('loading old file at {}.json'.format(target_file_path))
        with open(target_file_path, 'r') as f:
            app.config[lookup_name] = json.loads(f.read())
            app.logger.debug('Successfully loaded old lookup file for {}.json, '
                             'but will send email to team as an update.'.format(lookup_name))
            message = 'The WDFN application could not get the lookup file for {}.json ' \
                      'but was able to load an older file. This may be caused by an intermittent connection problem ' \
                      'and should not affect the function of the application. However, if you receive more of these' \
                      ' emails, an investigation is in order.'.format(lookup_name)
            send_email(message)
    except FileNotFoundError:
        app.logger.error('Sorry, no previous file found. Sending email message for help.')
        message = 'IMPORTANT - The WDFN application could not get the lookup file for {}.json,' \
                  ' and could not load an old copy. This will cause the application to fail. ' \
                  'Send help soon!'.format(lookup_name)
        send_email(message)


# Pull lookup files from S3 bucket and load into application context
def get_lookups():
    if not os.path.exists(os.path.join(app.config.get('DATA_DIR'), 'lookups')):
        os.makedirs(os.path.join(app.config.get('DATA_DIR'), 'lookups'))

    for lookup in app.config['LOOKUP_ENDPOINTS']:
        app.logger.debug('Getting lookup from {} '.format(app.config['LOOKUP_ENDPOINTS'].get(lookup)))

        try:
            request = requests.get(app.config['LOOKUP_ENDPOINTS'].get(lookup))
            app.config[lookup] = request.json()
            output_file_path = os.path.join(app.config.get('DATA_DIR'), 'lookups/{}.json'.format(lookup.lower()))
            with open(output_file_path, 'w') as output_file:
                json.dump(request.json(), output_file)

        except ValueError as e:
            app.logger.error('No Lookup JSON returned, failed with error {}'.format(e))
            load_lookup_from_backup_file(lookup)
        except requests.exceptions.RequestException as e:
            app.logger.error('Request to get lookup file failed for {} with error: {}  '.format(lookup, e))
            load_lookup_from_backup_file(lookup)


# When the application is first started, there will be no backup files saved for the lookups and the lookups
# will not be in memory. So, let's get them.
# If the lookup files already exist, then we can skip this step.
# NOTE: The lookup files are saved locally but not committed to Git. This stops the application from pulling the
# lookups from S3 each time the # local server is restarted.
for lookup in app.config.get('LOOKUP_ENDPOINTS'):
    file_path = os.path.join(app.config.get('DATA_DIR'), f'lookups/{lookup.lower()}.json')
    if os.path.isfile(file_path):
        app.logger.debug(f'Using existing lookup: {file_path}')
    else:
        get_lookups()

scheduler = BackgroundScheduler()
scheduler.start()
scheduler.add_job(lambda: get_lookups(), 'interval', hours=24)


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
