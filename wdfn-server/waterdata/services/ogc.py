"""
Helpers to retrieve OGC data - Networks.
"""
from waterdata import app
from waterdata.utils import execute_get_request


def get_networks(network_cd=None):
    """
    Gets the network data from a json file
    :param network_cd: collections-id
    """
    url = app.config['NETWORK_ENDPOINT']
    if network_cd:
        url = url + '/' + network_cd

    response = execute_get_request(url, params={'f': 'json'})

    if response.status_code != 200:
        return []
    try:
        resp_json = response.json()
    except ValueError:
        return []
    else:
        return resp_json
