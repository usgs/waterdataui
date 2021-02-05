"""
Helpers to retrieve timezone information for a location
"""
from .. import app
from ..utils import execute_get_request

def get_iana_time_zone(latitude, longitude):
    resp = execute_get_request(app.config['WEATHER_SERVICE_ROOT'], f'points/{latitude},{longitude}')
    if resp.status_code != 200:
        return None

    return resp.properties.get('timeZone', None) if 'properties' in resp else None