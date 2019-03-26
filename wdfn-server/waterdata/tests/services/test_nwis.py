"""
Tests for NWISWeb service calls.

"""
from types import GeneratorType
from unittest import TestCase, mock

from waterdata.services.nwis import NwisWebServices
from ..rdb_snippets import SITE_RDB, PARAMETER_RDB


class TestNwisWebServices(TestCase):

    def setUp(self):
        self.service_root = 'https://fake.nwis.url.gov'
        self.path = '/some/path/'
        self.site_no = '029055631'
        self.agency_cd = 'ABYZ'
        self.huc_cd = '77771111'
        self.county_code = '055:213'

    def test_default_path(self):
        nwis = NwisWebServices(self.service_root)
        self.assertEqual(nwis.path, '/nwis/site/')

    @mock.patch('waterdata.services.nwis.execute_get_request')
    def test_get_site(self, r_mock):
        nwis = NwisWebServices(self.service_root, self.path)
        nwis.get_site(self.site_no, self.agency_cd)
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
    def test_get_site_parameters_okay(self, r_mock):
        mock_resp = mock.Mock()
        mock_resp.status_code = 200
        mock_resp.iter_lines.return_value = iter(PARAMETER_RDB.split('\n'))
        r_mock.return_value = mock_resp

        nwis = NwisWebServices(self.service_root, self.path)
        data = nwis.get_site_parameters(self.site_no, self.agency_cd)
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
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 8)

    @mock.patch('waterdata.services.nwis.execute_get_request')
    def test_get_site_parameters_bad(self, r_mock):
        mock_resp = mock.Mock()
        mock_resp.status_code = 503
        r_mock.return_value = mock_resp

        nwis = NwisWebServices(self.service_root, self.path)
        data = nwis.get_site_parameters(self.site_no, self.agency_cd)
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
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 0)

    @mock.patch('waterdata.services.nwis.execute_get_request')
    def test_get_huc_sites_okay(self, r_mock):
        mock_resp = mock.Mock()
        mock_resp.status_code = 200
        mock_resp.iter_lines.return_value = iter(SITE_RDB.split('\n'))
        r_mock.return_value = mock_resp

        nwis = NwisWebServices(self.service_root, self.path)
        data = nwis.get_huc_sites(self.huc_cd)
        r_mock.assert_called_with(
            self.service_root,
            path=self.path,
            params={
                'format': 'rdb',
                'huc': self.huc_cd
            }
        )
        self.assertIsInstance(data, GeneratorType)
        self.assertEqual(len(list(data)), 1)

    @mock.patch('waterdata.services.nwis.execute_get_request')
    def test_get_huc_sites_bad(self, r_mock):
        mock_resp = mock.Mock()
        mock_resp.status_code = 404
        r_mock.return_value = mock_resp

        nwis = NwisWebServices(self.service_root, self.path)
        data = nwis.get_huc_sites(self.huc_cd)
        r_mock.assert_called_with(
            self.service_root,
            path=self.path,
            params={
                'format': 'rdb',
                'huc': self.huc_cd
            }
        )
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 0)

    @mock.patch('waterdata.services.nwis.execute_get_request')
    def test_get_county_sites_okay(self, r_mock):
        mock_resp = mock.Mock()
        mock_resp.status_code = 200
        mock_resp.iter_lines.return_value = iter(SITE_RDB.split('\n'))
        r_mock.return_value = mock_resp

        nwis = NwisWebServices(self.service_root, self.path)
        data = nwis.get_county_sites(self.county_code)
        r_mock.assert_called_with(
            self.service_root,
            path=self.path,
            params={
                'format': 'rdb',
                'countyCd': self.county_code
            }
        )
        self.assertIsInstance(data, GeneratorType)
        self.assertEqual(len(list(data)), 1)

    @mock.patch('waterdata.services.nwis.execute_get_request')
    def test_get_county_sites_bad(self, r_mock):
        mock_resp = mock.Mock()
        mock_resp.status_code = 500
        r_mock.return_value = mock_resp

        nwis = NwisWebServices(self.service_root, self.path)
        data = nwis.get_county_sites(self.county_code)
        r_mock.assert_called_with(
            self.service_root,
            path=self.path,
            params={
                'format': 'rdb',
                'countyCd': self.county_code
            }
        )
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 0)
