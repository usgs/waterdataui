"""
Creates a JSON file that maps HUC codes to sub-HUC codes, and includes
metadata of each region.

The following service is used as a data source:
https://help.waterdata.usgs.gov/code/hucs_query?fmt=rdb
"""

import json

import requests

from waterdata.utils import parse_rdb


SOURCE_URL = 'https://help.waterdata.usgs.gov/code/hucs_query?fmt=rdb'


def get_huc_data():
    """
    Retrieve and parse HUC codes from service.
    :return: mapping of HUC code to details
    :rtype: dict
    """

    response = requests.get(SOURCE_URL)
    return {
        unit['huc_cd']: unit
        for unit in parse_rdb(iter(response.text.splitlines()))
    }


def write_hucs_to_file(output_file):
    """
    Entrypoint for HUC retrieval. Writes HUC mapping to `output_file`.
    :param file output_file: file to write to
    """

    output_file.write(json.dumps(get_huc_data(), indent=4))
