"""
Helpers to retrieve timezone information for a location
"""
from requests import exceptions as request_exceptions, Session

from .. import app


class TimeZoneService:
    """
    Provide access to a service that returns the IANA time zone string for a given
    lat/lon
    """

    def __init__(self, endpoint):
        self.endpoint = endpoint
        self.session = Session()

    def get_iana_time_zone(self, latitude, longitude):
        """
        Returns the iana time zone string or None if the service fails.
        :param latitude: str
        :param longitude: str
        :return str
        """
        url = f'{self.endpoint}/points/{latitude},{longitude}'
        try:
            response = self.session.get(url)
        except (request_exceptions.Timeout, request_exceptions.ConnectionError) as err:
            app.logger.error(repr(err))
            return {}
        if response.status_code != 200:
            return None

        json_data = response.json()
        return json_data['properties'].get('timeZone', None) if 'properties' in json_data else None
