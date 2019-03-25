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
