"""
Classes and functions for calling NWIS services and working with
the returned data.

"""
from ..utils import execute_get_request, parse_rdb


class NwisWebServices:
    """
    Access to NWISWeb services required by the waterdataui application
    to render pages.

    """

    def __init__(self, service_root, path='/nwis/site/', data_format='rdb'):
        """
        Constructor method.

        :param str service_root: the scheme and host of the NWISWeb service
        :param str path: the service path to be queried, defaults to `/nwis/site/`
        :param str data_format: the data format to be returned from the service call, defaults to `rdb`

        """
        self.service_root = service_root
        self.path = path
        self.data_format = data_format

    def get_site(self, site_no, agency_cd):
        """
        Get a the sites owned by an agency.

        :param str site_no: site identifier
        :param str agency_cd: identifier for the agency that owns the site
        :return: an object containing the sites requested
        :rtype: requests.Response

        """
        resp = execute_get_request(
            self.service_root,
            path=self.path,
            params={
                'site': site_no,
                'agency_cd': agency_cd,
                'siteOutput': 'expanded',
                'format': self.data_format
            }
        )
        return resp

    def get_site_parameters(self, site_no, agency_cd):
        """
        Get the parameters measured at a site.

        :param str site_no: site identifier
        :param str agency_cd: identifier for the agency that owns the site:
        :return: parameters that have been measured at a site
        :rtype: list

        """
        resp = execute_get_request(
            self.service_root,
            path=self.path,
            params={
                'sites': site_no,
                'format': self.data_format,
                'seriesCatalogOutput': True,
                'siteStatus': 'all',
                'agencyCd': agency_cd
            }
        )
        status_code = resp.status_code
        data = []
        if status_code == 200:
            data = [datum for datum in parse_rdb(resp.iter_lines(decode_unicode=True))]
        return data

    def get_huc_sites(self, huc_cd):
        """
        Get all sites within a hydrologic unit as identified by its
        hydrologic unit code (HUC).

        :param str huc_cd: hydrologic unit code
        :return: all sites in the specified HUC
        :rtype: iterator, either a list or generator

        """
        resp = execute_get_request(
            self.service_root,
            path=self.path,
            params={
                'format': self.data_format,
                'huc': huc_cd
            }
        )
        monitoring_locations = []
        if resp.status_code == 200:
            monitoring_locations = parse_rdb(resp.iter_lines(decode_unicode=True))
        return monitoring_locations

    def get_county_sites(self, state_county_cd):
        """
        Get all sites within a county.

        :param str state_county_cd: FIPS ID for a county
        :return: all sites within the specified county
        :rtype: iterator, either a list or generator

        """
        resp = execute_get_request(
            self.service_root,
            path=self.path,
            params={
                'format': self.data_format,
                'countyCd': state_county_cd
            }
        )
        monitoring_locations = []
        if resp.status_code == 200:
            monitoring_locations = parse_rdb(resp.iter_lines(decode_unicode=True))
        return monitoring_locations
