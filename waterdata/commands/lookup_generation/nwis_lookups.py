"""
Utilities to retrieve NWIS RDB codes
"""

from itertools import groupby


def _get_lookup_value(code_lookup, name_key, desc_key):
    """
    Returns dict with 'name' and optional 'desc' properties derived from code_lookup
    :param code_lookup:
    :param name_key:
    :param desc_key: Can be the null string
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
    :param str code_key: Should not be null
    :param str name_key: Should not be null
    :param str desc_key: Can be the null string
    :rtype: dict
    """

    def has_code_key(lookup):
        return code_key in lookup

    filtered_dict = filter(has_code_key, dict_iter)
    lookup_tuple = [(code_lookup.get(code_key),
                     _get_lookup_value(code_lookup, name_key, desc_key))
                    for code_lookup in filtered_dict]
    return dict(lookup_tuple)


def translate_codes_by_group(dict_iter, code_key, name_key):
    """
    Translate dict_iter to a single dictionary where the code_key values will be be the keys with
    the value a dictionary with 'name' and 'desc' properties. THe collection of dicts can have code_key
    values that are repeated. The name_key value will be one of the name_key values.
    :param dict_iter:
    :param str code_key:
    :param str name_key:
    :return: dict
    """

    def has_code_key(lookup):
        return code_key in lookup

    def get_code(d):
        return d.get(code_key)

    filtered_dict = filter(has_code_key, dict_iter)

    data = sorted(filtered_dict, key=get_code)
    grouped_list = [(k, _get_lookup_value(next(g), name_key, '')) for k, g in groupby(data, key=get_code)]
    return dict(grouped_list)
