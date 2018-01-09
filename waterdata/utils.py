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
        resp = r.get(target, params=params)
    except (r.exceptions.Timeout, r.exceptions.ConnectionError):
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
            if line[0] != '#':
                headers = line.split('\t')
                found_header = True
    # skip the next line in the RDB file
    next(rdb_iter_lines)
    for record in rdb_iter_lines:
        record_values = record.split('\t')
        yield dict(zip(headers, record_values))


def get_disambiguated_values(location, code_lookups, country_state_county_lookups):
    """
    Convert values for keys that contains codes to human readable names using the lookups
    :param dict location:
    :param dict code_lookups:
    :param dict country_state_county_lookups:
    :rtype: dict
    """
    transformed_location = {}

    country_code = location.get('country_cd')
    state_code = location.get('state_cd')
    county_code = location.get('county_cd')

    for (key, value) in location.items():
        if key == 'state_cd' and country_code and state_code:
            country_lookup = country_state_county_lookups.get(country_code, {})
            state_lookup = country_lookup.get('state_cd', {})
            transformed_value = state_lookup.get(state_code, {}).get('name', state_code)
        elif key == 'county_cd' and country_code and state_code and country_code:
            country_lookup = country_state_county_lookups.get(country_code, {})
            state_lookup = country_lookup.get('state_cd', {}).get(state_code, {})
            county_lookup = state_lookup.get('county_cd', {})

            transformed_value = county_lookup.get(county_code, {}).get('name', county_code)

        elif key in code_lookups:
            transformed_value = code_lookups.get(key).get(value, {}).get('name', value)

        else:
            transformed_value = value
        transformed_location[key] = transformed_value

    return transformed_location