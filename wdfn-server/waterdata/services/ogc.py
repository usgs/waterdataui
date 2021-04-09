"""
Class and functions for calling the observations OGC endpoint for monitoring location collections
"""
from requests import exceptions as request_exceptions, Session

from .. import app


class MonitoringLocationNetworkService:
    """
    Provide access to the OGC Observations API service for networks of monitoring locations
    """

    def __init__(self, endpoint):
        self.endpoint = endpoint
        self.session = Session()

    def get_networks(self, network_cd=''):
        """
        Fetches the network data for the specified network. If network_cd is blank,
        all networks are returned
        :param network_cd: collections-id
        :return dictionary representing the OGC Feature collection if network_cd is not blank or
        a dictionary containing a list of collections.
        """
        url = f"{self.endpoint}{network_cd}"
        try:
            response = self.session.get(url, params={'f': 'json'})
        except (request_exceptions.Timeout, request_exceptions.ConnectionError) as err:
            app.logger.error(repr(err))
            return {}

        if response.status_code != 200:
            return {}
        try:
            resp_json = response.json()
        except ValueError:
            return {}
        else:
            return resp_json
