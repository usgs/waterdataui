"""
Class and functions for calling NWIS services and working with
the returned data.

"""
from requests import exceptions as request_exceptions, Session
from ..utils import parse_rdb

from .. import app


class SiteService:
    """
    Provides access to the NWIS site service
    """

    def __init__(self, endpoint):
        """
        Constructor method.

        :param str endpoint: the scheme, host and path to the NWIS site service
        """
        self.endpoint = endpoint
        self.session = Session()

    def get(self, params):
        """
        Returns a tuple containing the request status code and a list of dictionaries that represent the contents of
        RDB file

        :param dict params:
        :returns
            - status_code - status code returned from the service request
            - reason - string
            - site_data - list of dictionaries
        """
        app.logger.debug(f'Requesting data from {self.endpoint}')
        default_params = {
            'format': 'rdb'
        }
        default_params.update(params)
        try:
            response = self.session.get(self.endpoint, params=default_params)
        except (request_exceptions.Timeout, request_exceptions.ConnectionError) as err:
            app.logger.error(repr(err))
            return 500, repr(err), None
        if response.status_code == 200:
            return 200, response.reason, list(parse_rdb(response.iter_lines(decode_unicode=True)))

        return response.status_code, response.reason, []

    def get_site_data(self, site_no, agency_cd=''):
        """
        Get the metadata for site_no, agency_cd (which may be blank) using the additional query parameters, param
        Note that more than one dictionary can be returned if agency_cd is empty.
        :param str site_no: site identifier
        :param str agency_cd: identifier for the agency that owns the site
        :returns:
            - status - status code from response
            - reason - string
            - site_metadata - list of dict representing the data returned in the rdb file
        """
        params = {
            'sites': site_no,
            'siteOutput': 'expanded'
        }
        if agency_cd:
            params['agencyCd'] = agency_cd
        return self.get(params)

    def get_period_of_record(self, site_no, agency_cd=''):
        """
        Get the parameters measured at the site(s).

        :param str site_no: site identifier
        :param str agency_cd: identifier for the agency that owns the site:
        :returns:
            - status - status code from response
            - reason - string
            - periodOfRecord - list of dict representing the period of record for the data available at the site
        """
        params = {
            'sites': site_no,
            'seriesCatalogOutput': True,
            'siteStatus': 'all'
        }
        if agency_cd:
            params['agencyCd'] = agency_cd
        return self.get(params)

    def get_huc_sites(self, huc_cd):
        """
        Get all sites within a hydrologic unit as identified by its
        hydrologic unit code (HUC).

        :param str huc_cd: hydrologic unit code
        :returns: all sites in the specified HUC
            - status - status code from response
            - reason - string
            - sites - list of dict representing the sites in huc_cd
        """
        return self.get({
            'huc': huc_cd
        })

    def get_county_sites(self, state_county_cd):
        """
        Get all sites within a county.

        :param str state_county_cd: FIPS ID for a statecounty
        :returns: all sites in the specified county
            - status - status code from response
            - reason - string
            - sites - list of dict representing the site in state_county_cd
         """
        return self.get({
            'countyCd': state_county_cd
        })
