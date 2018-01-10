
from itertools import groupby
import logging

from waterdata.utils import execute_get_request

"""
Utilities to retrieve lookup information from WQP state and county lookups
"""


def get_lookup_by_json(hostname, path=None, params=None):
    """
    Make an HttpRequest to endpoint and return dict
    :param str endpoint:
    :param dict
    :rtype: dict
    """
    request_params = {'mimeType': 'json'}
    if params:
        request_params.update(params)
    resp = execute_get_request(hostname, path=path, params=request_params)
    if resp.status_code == 200:
        result = resp.json()
    else:
        logging.error('Unable to retrieve lookup at {0} from host {1}'.format(path, hostname))
        result = {}

    return result


def is_us_county(wqp_lookup_code):
    """
    Returns True if the WQP county lookup code is for the US.
    :param dict wqp_lookup_code:
    :rtype: bool
    """
    return wqp_lookup_code.get('value', '').split(':')[0] == 'US'


def get_nwis_state_lookup(wqp_lookups):
    """
    Return a tuple (state_fips, lookup_dict) from wqp_lookup
    :param List of dict wqp_lookups: should be a lookup from a statecode query
    :rtype: tuple
    """

    def get_state_fips(lookup):
        return lookup.get('value').split(':')[1]

    def get_state_name(lookup):
        return lookup.get('desc')

    states = [(get_state_fips(lookup), {'name': get_state_name(lookup)}) for lookup in wqp_lookups]
    return dict(states)


def get_nwis_county_lookup(wqp_lookups):
    """
    Return dict of lookups by state
    :param List of dict wqp_lookups: should be the lookups returned from a countycode query
    :return: dict
    """

    def get_state_fips(lookup_value):
        return lookup_value.get('value').split(':')[1]

    def get_county_lookup (wqp_lookup):
        county_fips = wqp_lookup.get('value').split(':')[2]
        county_name = wqp_lookup.get('desc').split(', ')[2]
        return (county_fips, county_name)

    lookup = {}
    sorted_state_list = sorted(wqp_lookups, key=get_state_fips)
    for state, lookup_iter in groupby(sorted_state_list, get_state_fips):
        lookup[state] = {}
        for wqp_lookup in lookup_iter:
            fips, name = get_county_lookup(wqp_lookup)
            lookup[state][fips] = {'name': name}

    return lookup