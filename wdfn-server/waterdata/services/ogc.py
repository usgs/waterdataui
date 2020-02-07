"""
Helpers to retrieve OGC data - Networks.
"""
from waterdata import app
from waterdata.utils import execute_get_request


def get_networks(network_cd):
    """
    Gets the network data from a json file
    :param network_cd: collections-id
    """
    # Handle feature flag for network pages
    if not app.config['NETWORK_PAGES_ENABLED']:
        return []

    url = app.config['OGC_SERVICE'].format('json')

    if network_cd != 'ALL':
        url = url +'/'+network_cd+'/'
    url = url + '?f=json'

    print('services: ogc.py: get_networks(): ' + url)
    response = execute_get_request(url)

    if response.status_code != 200:
        return []
    try:
        resp_json = response.json()
    except ValueError:
        return []
    else:
        if network_cd != 'ALL':
            return resp_json
        if network_cd == 'ALL':
            return resp_json.get('collections', [])
