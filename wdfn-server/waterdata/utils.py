"""
Utility functions

"""
from functools import update_wrapper
from urllib.parse import urlencode, urljoin

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
    target = urljoin(hostname, path)
    try:
        resp = r.get(target, params=params)
    except (r.exceptions.Timeout, r.exceptions.ConnectionError) as err:
        app.logger.debug(repr(err))
        resp = r.Response()  # return an empty response object
    return resp


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


def construct_url(netloc, path, parameters=()):
    """
    Build a url from its components.

    :param str netloc: protocol and domain name
    :param str path: url path
    :param parameters: query parameters
    :type parameters: dict or sequence of two-member tuples
    :return: absolute url
    :rtype: str

    """
    encoded_parameters = urlencode(parameters)
    return urljoin(netloc, '{0}?{1}'.format(path, encoded_parameters))


def defined_when(condition, fallback):
    """
    Decorator that fallsback to a specified function if `condition` is False.
    :param bool condition: Decorated function will be called if True, otherwise
                           fallback will be called
    :param function fallback Fallback function to be called if condition is False
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


def get_cooperator_data(location_with_values, site_no):
    """
    Gets the cooperator data from a json file, currently a feature toggle, and limited to district codes 20 and 51

    :param site_no: USGS site number
    :param location_with_values: monitoring location data including district code
    """
    if app.config['COOPERATOR_LOOKUP_ENABLED'] and (
            app.config['COOPERATOR_LOOKUP_ENABLED'] is True or
            location_with_values.get('district_cd', {}).get('code') in app.config['COOPERATOR_LOOKUP_ENABLED']):
        try:
            cooperator_lookup_data = app.config['COOPERATOR_DATA'][
                location_with_values['district_cd']['code']][site_no]
        except KeyError:
            cooperator_lookup_data = None
    else:
        cooperator_lookup_data = None
    return cooperator_lookup_data
