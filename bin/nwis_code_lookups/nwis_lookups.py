
from itertools import groupby

import requests
"""
Utilities to retrieve NWIS RDB codes
"""

def has_key_value(d, key):
    return key in d and d.get(key)


def get_data_by_rdb (endpoint, params=None):
    """
    Make an HttpRequest to endpoint using the rdb format and return an iterator for the
    lines in the returned data. If the request fails an empty iterator will be returned.
    Assumes that the query parameter used to specify rdb is fmt=rdb
    :param str endpoint:
    :rtype Iterator
    """
    request_params = {'fmt': 'rdb'}
    if params:
        request_params.update(params)
    try:
        resp = requests.get(endpoint, params=request_params)
    except (requests.exceptions.Timeout, requests.exceptions.ConnectionError):
        raise Exception ('Unable to retrieve data from {0}'.format(endpoint))
    if resp.status_code != 200:
        raise Exception('Unable to retrieve data from {0}'.format(endpoint))
    result = resp.iter_lines
    return result


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
            if len(line) > 0 and line[0] != '#':
                headers = line.split('\t')
                found_header = True
    # skip the next line in the RDB file
    next(rdb_iter_lines)
    for record in rdb_iter_lines:
        # filters out empty lines
        if record:
            yield dict(zip(headers, record.split('\t')))


def get_dict_from_rdb(endpoint, params=None):
    """
    Convenience function for retrieving the RDB file and parsing the result into dictionaries
    :param str endpoint:
    :param dictparams:
    :rtype: Iterator yielding dict
    """
    return parse_rdb(get_data_by_rdb(endpoint, params)(decode_unicode=True))



def get_lookup_value(code_lookup, name_key, desc_key):
    """
    Returns dict with 'name' and optional 'desc' properties derived from code_lookup
    :param code_lookup:
    :param name_key:
    :param desc_key:
    :rtype: dict
    """
    lookup_value = {'name': code_lookup.get(name_key)}
    if desc_key:
        lookup_value['desc'] = code_lookup.get(desc_key)
    return lookup_value



def translate_to_lookup(dict_iter, code_key, name_key, desc_key):
    """
    Translate dict_iter to a single dictionary where the code_key values will be be the keys with
    the value a dictionary with 'name' and 'desc' properties.
    :param iter dict_iter:
    :param str code_key:
    :param str desc_key:
    :rtype: dict
    """

    lookup_tuple = [(code_lookup.get(code_key), get_lookup_value(code_lookup, name_key, desc_key)) for code_lookup in dict_iter]
    return dict(lookup_tuple)


def translate_codes_by_group(dict_iter, code_key, name_key):
    """
    Translate dict_iter to a single dictionary where the code_key values will be be the keys with
    the value a dictionary with 'name' and 'desc' properties. THe collection of dicts can have code_key
    values that are repeated. The name_key value will be one of the name_key values.
    :param dict_iter:
    :param str code_key:
    :param str desc_key:
    :return: dict
    """

    def get_code(d):
        return d.get(code_key)

    data = sorted(dict_iter, key=get_code)
    grouped_list = [(k, get_lookup_value(next(g), name_key, '')) for k, g in groupby(data, key=get_code)]
    return dict(grouped_list)


