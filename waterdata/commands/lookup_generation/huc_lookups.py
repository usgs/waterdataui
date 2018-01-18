"""
Creates a JSON file that maps HUC codes to sub-HUC codes, and includes
metadata of each region.

The following service is used as a data source:
https://help.waterdata.usgs.gov/code/hucs_query?fmt=rdb
"""

from collections import defaultdict
import json
import os

import requests

from waterdata.utils import parse_rdb


SOURCE_URL = 'https://help.waterdata.usgs.gov/code/hucs_query?fmt=rdb'


def get_huc_data():
    """
    Retrieve and parse HUC codes from service.
    :return: mapping of HUC code to details
    :rtype: dict
    """

    # Retrieve the HUC codes from
    response = requests.get(SOURCE_URL)

    # Store the items in a dict keyed on huc_cd, with a reference to its parent
    # and a placeholder for its children.
    hucs = {
        unit['huc_cd']: dict(
            children=[],
            parent=unit['huc_cd'][:len(unit['huc_cd']) - 2] or None,
            kind='HUC{}'.format(len(unit['huc_cd'])),
            **unit
        ) for unit in parse_rdb(response.iter_lines(decode_unicode=True))
    }

    # Add references to parent/child relationships and categorize by length.
    classes = defaultdict(list)
    for huc in hucs.values():
        huc_len = len(huc['huc_cd'])
        classes[f'HUC{huc_len}'].append(huc['huc_cd'])
        if huc['parent']:
            hucs[huc['parent']]['children'].append(huc['huc_cd'])

    return {
        'hucs': hucs,
        'classes': classes
    }


def generate_hucs_file(datadir):
    """
    Entrypoint for HUC retrieval. Writes HUC mapping to `output_file`.
    :param file output_file: file to write to
    """

    file_name = os.path.join(datadir, 'huc_lookup.json')
    data = get_huc_data()
    with open(file_name, 'w') as output_file:
        output_file.write(json.dumps(data, indent=4))
