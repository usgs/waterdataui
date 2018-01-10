#!/usr/bin/env python3.6

import argparse
import json
import logging
import os

from waterdata.utils import execute_get_request, parse_rdb
from lookup_generation.nwis_lookups import translate_to_lookup, translate_codes_by_group
from lookup_generation.wqp_lookups import get_lookup_by_json, get_nwis_state_lookup, get_nwis_county_lookup, is_us_county

"""
Generates two files, each containing a json object that will contain keys for the various codes used in 
NWIS site info expanded service
"""

CODE_HOST_ENDPOINT = 'https://help.waterdata.usgs.gov'

CODE_LOOKUP_CONFIG = [
    {'code_key': 'agency_cd', 'name': 'party_nm', 'urlpath': 'code/agency_cd_query', 'site_key': 'agency_cd'},
    {'code_key': 'site_tp_cd', 'name': 'site_tp_ln', 'desc': 'site_tp_ds', 'urlpath': 'code/site_tp_query', 'site_key': 'site_tp_cd'},
    {'code_key': 'parm_cd', 'name': 'parm_nm', 'urlpath': 'code/parameter_cd_query', 'params' : {'group_cd': '%'}, 'site_key': 'parm_cd'},
    {'code_key': 'Code', 'name': 'Description', 'urlpath': 'code/alt_datum_cd_query', 'site_key': 'alt_datum_cd'},
    {'code_key': 'gw_ref_cd', 'name': 'gw_ref_ds', 'urlpath': 'code/alt_meth_cd_query', 'site_key': 'alt_meth_cd'},
    {'code_key': 'Code', 'name': 'Description', 'urlpath': 'code/aqfr_type_cd_query', 'site_key': 'aqfr_type_cd'},
    {'code_key': 'gw_ref_cd', 'name': 'gw_ref_ds', 'urlpath': 'code/coord_acy_cd_query', 'site_key': 'coord_acy_cd'},
    {'code_key': 'gw_ref_cd', 'name': 'gw_ref_ds', 'urlpath': 'code/coord_meth_cd_query', 'site_key': 'coord_meth_cd'},
    {'code_key': 'gw_ref_cd', 'name': 'gw_ref_ds', 'urlpath': 'code/reliability_cd_query', 'site_key': 'reliability_cd'},
    {'code_key': 'gw_ref_cd', 'name': 'gw_ref_nm', 'desc': 'gw_ref_ds', 'urlpath': 'code/topo_cd_query', 'site_key': 'topo_cd'}
]

GROUPED_CODE_LOOKUP_CONFIG = [
    {'code_key': 'nat_aqfr_cd', 'name': 'nat_aqfr_nm', 'urlpath': 'code/nat_aqfr_query', 'site_key': 'nat_aqfr_cd'},
    {'code_key': 'aqfr_cd', 'name': 'aqfr_nm', 'urlpath': 'code/aqfr_cd_query', 'site_key': 'aqfr_cd'}
]

WQP_LOOKUP_ENDPOINT = 'https://www.waterqualitydata.us/Codes'

COUNTRY_CODES = ['US', 'CA']


def generate_lookup_file(datadir, filename='nwis_lookup.json'):
    """
    Generates a json object from NWIS code calls and writes the json object to a file.
    :param str datadir: directory where file is written
    :param str filename: name of the file containing the json object

    """
    lookups = {}
    for lookup_config in CODE_LOOKUP_CONFIG:
        params = {'fmt': 'rdb'}
        if 'params' in lookup_config:
            params.update(lookup_config.get('params'))
        resp = execute_get_request(CODE_HOST_ENDPOINT, path=lookup_config.get('urlpath'), params=params)
        if resp.status_code == 200:
            code_dict_iter = parse_rdb(resp.iter_lines(decode_unicode=True))
            lookups[lookup_config.get('site_key')] = translate_to_lookup(
                code_dict_iter,
                lookup_config.get('code_key'),
                lookup_config.get('name'),
                lookup_config.get('desc', '')
            )
        else:
            logging.debug('Could not retrieve NWIS code lookup {0}'.format(lookup_config.get('urlpath')))
            lookups[lookup_config.get('site_key')] = {}

    for lookup_config in GROUPED_CODE_LOOKUP_CONFIG:
        resp = execute_get_request(CODE_HOST_ENDPOINT, lookup_config.get('urlpath'), params={'fmt': 'rdb'})
        if resp.status_code == 200:
            code_dict_iter = parse_rdb(resp.iter_lines(decode_unicode=True))
            lookups[lookup_config.get('site_key')] = translate_codes_by_group(
                code_dict_iter,
                lookup_config.get('code_key'),
                lookup_config.get('name')
            )
        else:
            lookups[lookup_config.get('site_key')] = {}

    with open(os.path.join(datadir, filename), 'w') as f:
        f.write(json.dumps(lookups, indent=4))


def generate_country_state_county_file(datadir, filename='nwis_country_state_lookup.json'):
    """
    Generates a json object from WQP country, state, and county lookups and writes the json object to a file.
    :param str datadir: directory where file is written
    :param str filename: name of the file containing the json object
    """
    lookups = {}
    for country in COUNTRY_CODES:
        lookup_dict = get_lookup_by_json('{0}/statecode'.format(WQP_LOOKUP_ENDPOINT), {'countrycode': country})
        lookups[country] = {'state_cd': get_nwis_state_lookup(lookup_dict.get('codes', []))}

    county_lookup = get_lookup_by_json('{0}/countycode'.format(WQP_LOOKUP_ENDPOINT))
    us_county_lookups = filter(is_us_county, county_lookup.get('codes', []))
    state_with_county_lookups = get_nwis_county_lookup(us_county_lookups)

    for state in state_with_county_lookups.keys():
        lookups['US']['state_cd'][state]['county_cd'] = state_with_county_lookups[state]

    with open(os.path.join(datadir, filename), 'w') as f:
        f.write(json.dumps(lookups, indent=4))


if __name__ == '__main__':
    arg_parser = argparse.ArgumentParser()
    arg_parser.add_argument('--datadir', type=str, default = 'data')

    args = arg_parser.parse_args()

    generate_lookup_file(args.datadir)
    generate_country_state_county_file(args.datadir)
