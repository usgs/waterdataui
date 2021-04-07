"""
Helpers to retrieve OGC data - Networks.
"""
from .. import app
from ..utils import execute_get_request


def get_networks(network_cd=''):
    """
    Fetches the network data for the specified network. If network_cd is blank,
    all networks are returned
    :param network_cd: collections-id
    :return dictionary representing the OGC Feature collection if network_cd is not blank or
    a dictionary containing a list of collections.

    """
    url = f"{app.config['MONITORING_LOCATIONS_OBSERVATIONS_ENDPOINT']}{network_cd}"

    response = execute_get_request(url, params={'f': 'json'})

    if response.status_code != 200:
        return {}
    try:
        resp_json = response.json()
    except ValueError:
        return {}
    else:
        return resp_json
