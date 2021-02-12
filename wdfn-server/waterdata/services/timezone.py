"""
Helpers to retrieve timezone information for a location
"""
from .. import app
from ..utils import execute_get_request

def get_iana_time_zone(latitude, longitude):
    """
    Returns the iana time zone string or None if the service fails.
    :param latitude: str
    :param longitude: str
    :return str
    """
    resp = execute_get_request(app.config['WEATHER_SERVICE_ROOT'], f'points/{latitude},{longitude}')
    if resp.status_code != 200:
        return None

    json_data = resp.json()
    return json_data['properties'].get('timeZone', None) if 'properties' in jsonData else None