"""
Tests for NWISWeb service calls.

"""
from unittest import TestCase, mock

from waterdata.services.nwis import NwisWebServices


class TestNwisWebServices(TestCase):

    def setUp(self):
        self.service_root = 'https://fake.nwis.url.gov'
        self.path = '/some/path/'
        self.site_no = '029055631'
        self.agency_cd = 'ABYZ'
        self.huc_cd = '77771111'
        self.county_code = '055:213'

    def test_default_path(self):
        ns = NwisWebServices(self.service_root)
        self.assertEqual(ns.path, '/nwis/site/')

    @mock.patch('waterdata.services.nwis.execute_get_request')
    def test_get_site(self, r_mock):
        ns = NwisWebServices(self.service_root, self.path)
        ns.get_site(self.site_no, self.agency_cd)
        r_mock.assert_called_with(
            self.service_root,
            path=self.path,
            params={
                'site': self.site_no,
                'agency_cd': self.agency_cd,
                'siteOutput': 'expanded',
                'format': 'rdb'
            }
        )

    @mock.patch('waterdata.services.nwis.execute_get_request')
    def test_get_site_parameters(self, r_mock):
        nwis = NwisWebServices(self.service_root, self.path)
        nwis.get_site_parameters(self.site_no, self.agency_cd)
        r_mock.assert_called_with(
            self.service_root,
            path=self.path,
            params={
                'sites': self.site_no,
                'format': 'rdb',
                'seriesCatalogOutput': True,
                'siteStatus': 'all',
                'agencyCd': self.agency_cd
            }
        )

    @mock.patch('waterdata.services.nwis.execute_get_request')
    def test_get_huc_sites(self, r_mock):
        nwis = NwisWebServices(self.service_root, self.path)
        nwis.get_huc_sites(self.huc_cd)
        r_mock.assert_called_with(
            self.service_root,
            path=self.path,
            params={
                'format': 'rdb',
                'huc': self.huc_cd
            }
        )

    @mock.patch('waterdata.services.nwis.execute_get_request')
    def test_get_county_sites(self, r_mock):
        nwis = NwisWebServices(self.service_root, self.path)
        nwis.get_county_sites(self.county_code)
        r_mock.assert_called_with(
            self.service_root,
            path=self.path,
            params={
                'format': 'rdb',
                'countyCd': self.county_code
            }
        )
