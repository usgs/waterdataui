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
    """
    Sends an message to the team.
    :param message: The message body of the email
    :return: None
    """
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


def load_lookup_from_backup_file(lookup_name, startup=False):
    """
    Loads the lookup information from a file and saves the data to app.config (if it can find the file)
    :param lookup_name: The name of the file we would like to open
    :param startup: Boolean, when the application is first deployed there will not have loaded a backup copy of the
        lookup files, so this helps us not throw errors when the application first starts.
    :return: None
    """
    try:
        target_file_path = os.path.join(app.config.get('DATA_DIR'), f'lookups/{lookup_name.lower()}.json')
        app.logger.debug(f'Loading existing lookup file: {target_file_path}.json')
        with open(target_file_path, 'r') as f:
            app.config[lookup_name] = json.loads(f.read())
            # Don't expect the lookup file to exist when the application first starts.
            if startup is not True:
                app.logger.debug(f'Successfully loaded old lookup file for {lookup_name}.json, '
                                 'but will send email to team as an update.')
                # No email during local development (set your instance/config.py)
                if app.config["DEPLOYMENT_ENVIRONMENT"] != 'local':
                    message = f'The WDFN application ({app.config["DEPLOYMENT_ENVIRONMENT"]}) could  ' \
                              f'not get the lookup file for {lookup_name}.json ' \
                              'but was able to load a backup file. This may be caused by an intermittent connection ' \
                              'problem and should not affect the function of the application. However, if you receive ' \
                              'more of these emails, an investigation is in order.'
                    send_email(message)
    except FileNotFoundError:
        app.logger.error('No previous file found.')
        # Don't expect the lookup file to exist when the application first starts.
        if startup is not True:
            app.logger.error('This will cause the application to fail.')
            # No email during local development (set your instance/config.py)
            if app.config["DEPLOYMENT_ENVIRONMENT"] != 'local':
                app.logger.error('Sending email message for help.')
                message = f'IMPORTANT - The WDFN application ({app.config["DEPLOYMENT_ENVIRONMENT"]}) ' \
                          f' could not get the lookup file for {lookup_name}.json,' \
                          ' and could not load an old copy. This will cause the application to fail. ' \
                          'Send help soon!'
                send_email(message)


# Pull lookup files from S3 bucket and load into application context
def get_lookup(lookup_name):
    """
    Makes requests to an AWS Simple Storage Solutions Bucket (S3) to get various 'lookup' files, saves the returned
    data to the app config and writes a backup file.
    :param lookup_name - The name of the lookup to get.
    :return: None
    """
    if not os.path.exists(os.path.join(app.config.get('DATA_DIR'), 'lookups')):
        os.makedirs(os.path.join(app.config.get('DATA_DIR'), 'lookups'))

    app.logger.debug(f'Getting lookup from {app.config["LOOKUP_ENDPOINTS"].get(lookup_name)} ')

    try:
        request = requests.get(app.config['LOOKUP_ENDPOINTS'].get(lookup_name))
        app.config[lookup_name] = request.json()
        output_file_path = os.path.join(app.config.get('DATA_DIR'), 'lookups/{}.json'.format(lookup_name.lower()))
        with open(output_file_path, 'w') as output_file:
            json.dump(request.json(), output_file)
    except json.decoder.JSONDecodeError as e:
        app.logger.error(f'No Lookup JSON returned, failed with error {e}')
        load_lookup_from_backup_file(lookup_name)
    except ValueError as e:
        app.logger.error(f'No Lookup JSON returned, failed with error {e}')
        load_lookup_from_backup_file(lookup_name)
    except requests.exceptions.RequestException as e:
        app.logger.error(f'Request to get lookup file failed for {lookup_name} with error: {e}')
        load_lookup_from_backup_file(lookup_name)


def add_lookups_to_app_context():
    """
    Lookup/reference files for various things like state/county codes and HUC names are compiled by an external AWS Lambda
    function and stored in an S3 bucket. This application then pulls those files from S3 and adds them to the application
    context on the Flask side of the WDFN application.

    The contents of these files change about four times a year on an irregular and human curated schedule.

    Since this application doesn't know when the files will change, it pulls the files from S3 and replaces
    the old versions, whether they have changed or not, on a daily basis.

    Because there is a chance the files will be missing or not obtainable from S3 when the daily pull occurs,
    a backup copy of the files are stored on the local file system each time a pull is made. If the next pull fails, the
    application will use the backup file and send an email message to the team.

    When the application is first started after a deploy, there will be no backup files saved and the lookups will not
    be in the application context. At this point, if the files in S3 are inaccessible the application will not
    be able to load the backup files, an error will occur, and emails sent.

    For convince during local development, if the backup lookup files already exist on the system, those will be loaded,
    and the application will skip pulling the lookups from S3, which saves time when the local server is restarted.

    NOTE: The lookup files are saved locally but not committed to Git.
    :return: None
    """
    for lookup in app.config.get('LOOKUP_ENDPOINTS'):
        file_path = os.path.join(app.config.get('DATA_DIR'), f'lookups/{lookup.lower()}.json')
        if os.path.isfile(file_path):
            load_lookup_from_backup_file(lookup, startup=True)
        else:
            get_lookup(lookup)


def schedule_lookup_file_pulls():
    """
    Start a new thread that will run in the background. That thread will trigger the application to pull lookup files from
    S3 on a scheduled basis. So, if the lookup files have changed, the application will get the changes within
    the selected timeframe.
    :return: None
    """
    scheduler = BackgroundScheduler()
    scheduler.start()
    scheduler.add_job(lambda: add_lookups_to_app_context(), 'interval', hours=24)


# Do the lookup file tasks
add_lookups_to_app_context()
schedule_lookup_file_pulls()

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
