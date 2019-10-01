"""
Helpers to retrieve SIFTA cooperator data.
"""

import json

from waterdata import app
from waterdata.utils import execute_get_request


def get_cooperators(site_no, district_cd):
    """
    Gets the cooperator data from a json file, currently a feature toggle, and limited to district codes 20 and 51

    :param site_no: USGS site number
    :param district_cd: the district code of the monitoring location
    """

    # Handle feature flag for cooperator data
    if not app.config['COOPERATOR_LOOKUP_ENABLED'] or (
            app.config['COOPERATOR_LOOKUP_ENABLED'] is not True and
            district_cd not in app.config['COOPERATOR_LOOKUP_ENABLED']):
        return []

    url = app.config['COOPERATOR_SERVICE_PATTERN'].format(site_no=site_no)
    response = execute_get_request(url)
    if response.status_code != 200:
        return []
    try:
        resp_json = response.json()
    except json.JSONDecodeError:
        return []
    else:
        return resp_json.get('Customers', [])
