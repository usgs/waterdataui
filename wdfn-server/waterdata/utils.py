"""
Utility functions

"""
from flask import request
from functools import update_wrapper
from urllib.parse import urlencode, urljoin
from email.message import EmailMessage

import requests as r

from . import app


def execute_get_request(hostname, path=None, params=None):
    """
    Do a get request against a service endpoint.

    :param str hostname: Scheme and hostname of the target service
    :param str path: path part of the url
    :param dict params: dictionary of query parameters
    :return: response of the web service call or an empty response object if call is unsuccessful
    :rtype: requests.Response

    """
    # pylint: disable=E1101
    target = urljoin(hostname, path)
    try:
        app.logger.debug(f'Requesting data from {target}')
        resp = r.get(target, params=params)
    except (r.exceptions.Timeout, r.exceptions.ConnectionError) as err:
        app.logger.error(repr(err))
        resp = r.Response()  # return an empty response object
    return resp


def create_message(target_email, form_data, user_system_data, timestamp):
    """
    Uses data from a form to create and format a message that can be sent in an email using the Python SMTP library.
    :param str target_email: The email address for the email destination.
    :param immutable dict form_data: Part of the HTTP response which contains information submitted by the user
        in a web form.
    :param dict user_system_data: Part of the HTTP response containing information about the user's system.
    :param str timestamp: A timestamp that has been converted to a string.
    """
    msg = EmailMessage()
    msg['Subject'] = f"User Question/Comment for {form_data['monitoring-location-url']}"
    msg['From'] = 'WDFN Comments and Questions'
    msg['Reply-To'] = form_data['user-email-address']
    msg['To'] = target_email

    message_body = f"""
        From: {form_data['user-name'] if form_data['user-name'] else 'Name not given'}
        Subject: {form_data['subject'] if form_data['subject'] else 'No Subject'}
        Location: {form_data['monitoring-location-url']}
        Time (UTC): {timestamp}
        *********** Message ***********
        {form_data['message']}
        *********** User Information ***********
        Email: {form_data['user-email-address']}
        Phone: {form_data['user-phone-number'] if form_data['user-phone-number'] else 'None given'}
        Organization or Address: {form_data['user-organization-or-address']
    if form_data['user-organization-or-address'] else 'None given'}
        User Browser/System Details: {user_system_data}
        """
    msg.set_content(message_body)

    return msg


def set_cookie_for_banner_message(full_function_response_object):
    """
    Checks if a cookie is desired and has not been set. If so it will set a cooke that will turn off
    the special banner messages, such as the one for pandemics
    :param full_function_response_object: standard HTTP response object
    """
    if app.config['SET_COOKIE_TO_HIDE_BANNER_NOTICES']:
        previously_set_cookie = request.cookies.get('no-show-banner-message')
        if previously_set_cookie is None:
            full_function_response_object.set_cookie('no-show-banner-message', 'no-show', max_age=60*60*24*30)


def parse_rdb(rdb_iter_lines):
    """
    Parse records in an RDB file into dictionaries.

    :param iterator rdb_iter_lines: iterator containing lines from an RDB file
    :rtype: Iterator

    """
    found_header = False
    headers = []
    while not found_header:
        try:
            line = next(rdb_iter_lines)
        except StopIteration:
            raise Exception('RDB column headers not found.')
        else:
            if line and line[0] != '#':
                headers = line.split('\t')
                found_header = True
    # skip the next line in the RDB file
    next(rdb_iter_lines)
    for record in rdb_iter_lines:
        # Ignore empty lines
        if not record.strip():
            continue
        record_values = record.split('\t')
        yield dict(zip(headers, record_values))


def defined_when(condition, fallback):
    """
    Decorator that fallsback to a specified function if `condition` is False.
    :param condition: bool Decorated function will be called if True, otherwise
                           fallback will be called
    :param fallback: function to be called if condition is False
    :return: Decorated function
    :rtype: function
    """
    def wrap(f):
        if condition:
            func = lambda *args, **kwargs: f(*args, **kwargs)
        else:
            func = fallback
        return update_wrapper(func, f)

    return wrap
