"""
Utility functions

"""
from urllib.parse import urljoin

import requests as r


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
        ws_resp = r.get(target, params=params)
    except (r.exceptions.Timeout, r.exceptions.ConnectionError):
        ws_resp = r.Response()  # return an empty response object
    return ws_resp


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
            if line[0] != '#':
                headers = line.split('\t')
                found_header = True
    # skip the next line in the RDB file
    next(rdb_iter_lines)
    for record in rdb_iter_lines:
        record_values = record.split('\t')
        yield dict(zip(headers, record_values))
