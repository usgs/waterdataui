"""
Helpers to retrieve SIFTA cooperator data.
"""
from requests import exceptions as request_exceptions, Session

from .. import app


class SiftaService:
    """
    Provide access to a service that returns cooperator data
    """
    def __init__(self, endpoint):
        self.endpoint = endpoint
        self.session = Session()

    def get_cooperators(self, site_no):
        """
        Gets the cooperator data the SIFTA service

        :param site_no: USGS site number
        :return Array of dict
        """
        url = f'{self.endpoint}{site_no}'
        try:
            response = self.session.get(url)
        except (request_exceptions.Timeout, request_exceptions.ConnectionError) as err:
            app.logger.error(repr(err))
            return []

        if response.status_code != 200:
            return []
        try:
            resp_json = response.json()
        except ValueError:
            return []
        else:
            return resp_json.get('Customers', [])
