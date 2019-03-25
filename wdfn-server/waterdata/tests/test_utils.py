"""
Unit tests for the main WDFN views.
"""

from unittest import TestCase, mock

import requests as r

from ..utils import construct_url, defined_when, execute_get_request


class TestConstructUrl(TestCase):

    def setUp(self):
        self.test_netloc = 'https://fakeurl.gov'
        self.test_path = '/blah1/blah2'
        self.test_params_dict = {'param1': 'value1', 'param2': 'value2'}
        self.test_params_sequence = (('param1', 'value1'), ('param2', 'value2'))

    def test_with_params_as_dict(self):
        expected = 'https://fakeurl.gov/blah1/blah2?param1=value1&param2=value2'
        self.assertEqual(construct_url(self.test_netloc, self.test_path, self.test_params_dict), expected)

    def test_with_params_as_sequence(self):
        expected = 'https://fakeurl.gov/blah1/blah2?param1=value1&param2=value2'
        self.assertEqual(construct_url(self.test_netloc, self.test_path, self.test_params_sequence), expected)

    def test_with_no_params(self):
        expected = 'https://fakeurl.gov/blah1/blah2'
        self.assertEqual(construct_url(self.test_netloc, self.test_path), expected)


class TestGetWaterServicesData(TestCase):

    def setUp(self):
        self.test_service_root = 'http://blah.usgs.fake'
        self.test_site_number = '345670'
        self.test_url = '{0}/nwis/site/?site={1}'.format(self.test_service_root, self.test_site_number)
        self.test_rdb_text = ('#\n#\n# US Geological Survey\n# retrieved: 2018-01-02 09:31:20 -05:00\t(caas01)\n#\n# '
                              'The Site File stores location and general information about groundwater,\n# surface '
                              'water, and meteorological sites\n# for sites in USA.\n#\n# File-format description:  '
                              'http://help.waterdata.usgs.gov/faq/about-tab-delimited-output\n# Automated-retrieval '
                              'info: http://waterservices.usgs.gov/rest/Site-Service.html\n#\n# Contact:   '
                              'gs-w_support_nwisweb@usgs.gov\n#\n# The following selected fields are included in this '
                              'output:\n#\n#  agency_cd       -- Agency\n'
                              '#  site_no         -- Site identification number\n#  station_nm      -- Site name\n'
                              '#  site_tp_cd      -- Site type\n#  dec_lat_va      -- Decimal latitude\n'
                              '#  dec_long_va     -- Decimal longitude\n'
                              '#  coord_acy_cd    -- Latitude-longitude accuracy\n'
                              '#  dec_coord_datum_cd -- Decimal Latitude-longitude datum\n'
                              '#  alt_va          -- Altitude of Gage/land surface\n'
                              '#  alt_acy_va      -- Altitude accuracy\n#  alt_datum_cd    -- Altitude datum\n'
                              '#  huc_cd          -- Hydrologic unit code\n#\nagency_cd\tsite_no\tstation_nm\t'
                              'site_tp_cd\tdec_lat_va\tdec_long_va\tcoord_acy_cd\tdec_coord_datum_cd\talt_va\t'
                              'alt_acy_va\talt_datum_cd\thuc_cd\n5s\t15s\t50s\t7s\t16s\t16s\t1s\t10s\t8s\t3s\t10s\t'
                              '16s\nUSGS\t345670\tSome Random Site\tST\t200.94977778\t-100.12763889\tS\t'
                              'NAD83\t 151.20\t .1\tNAVD88\t02070010\n')
        self.test_bad_resp = 'Garbage Text'

    @mock.patch('waterdata.utils.r.get')
    def test_success(self, r_mock):
        m_resp = mock.Mock(r.Response)
        m_resp.text = self.test_rdb_text
        m_resp.reason = 'OK'
        r_mock.return_value = m_resp

        r_mock.get(self.test_url, status_code=200, text=self.test_rdb_text, reason='OK')
        result = execute_get_request(self.test_service_root,
                                     path='/nwis/site/',
                                     params={'site': self.test_site_number}
                                     )
        r_mock.assert_called_with('http://blah.usgs.fake/nwis/site/', params={'site': '345670'})
        self.assertEqual(self.test_rdb_text, result.text)
        self.assertEqual('OK', result.reason)

    @mock.patch('waterdata.utils.r.get')
    def test_bad_request(self, r_mock):
        m_resp = mock.Mock(spec=r.Response)
        m_resp.status_code = 400
        m_resp.text = self.test_bad_resp
        m_resp.reason = 'Some Reason'
        r_mock.return_value = m_resp

        result = execute_get_request(self.test_service_root,
                                     path='/nwis/site/',
                                     params={'site': self.test_site_number}
                                     )
        r_mock.assert_called_with('http://blah.usgs.fake/nwis/site/', params={'site': '345670'})
        self.assertEqual(self.test_bad_resp, result.text)
        self.assertEqual('Some Reason', result.reason)

    @mock.patch('waterdata.utils.r.get')
    def test_no_opt_args(self, r_mock):
        m_resp = mock.Mock(spec=r.Response)
        m_resp.status_code = 200
        r_mock.return_value = m_resp

        result = execute_get_request(self.test_service_root)
        r_mock.assert_called_with('http://blah.usgs.fake', params=None)
        self.assertEqual(result.status_code, 200)

    @mock.patch('waterdata.utils.r.get')
    def test_service_timeout(self, r_mock):
        r_mock.side_effect = r.exceptions.Timeout
        result = execute_get_request(self.test_url,
                                     path='/nwis/site/',
                                     params={'site': self.test_site_number}
                                     )
        r_mock.assert_called_with('http://blah.usgs.fake/nwis/site/', params={'site': '345670'})
        self.assertIsNone(result.status_code)
        self.assertIsNone(result.content)
        self.assertEqual(result.text, '')

    @mock.patch('waterdata.utils.r.get')
    def test_connection_error(self, r_mock):
        r_mock.side_effect = r.exceptions.ConnectionError
        result = execute_get_request(self.test_url,
                                     path='/nwis/site/',
                                     params={'site': self.test_site_number}
                                     )
        r_mock.assert_called_with('http://blah.usgs.fake/nwis/site/', params={'site': '345670'})
        self.assertIsNone(result.status_code)
        self.assertIsNone(result.content)
        self.assertEqual(result.text, '')


class TestDefinedWhen(TestCase):
    def setUp(self):
        pass

    def test_true(self):
        @defined_when(True, lambda: 'fallback')
        def decorated():
            return 'called'
        self.assertEqual(decorated(), 'called')

    def test_false(self):
        @defined_when(False, lambda: 'fallback')
        def decorated():
            return 'called'
        self.assertEqual(decorated(), 'fallback')

    def test_arg_passing(self):
        @defined_when(True, lambda: 'fallback')
        def decorated(*args, **kwargs):
            return ','.join([*args, *kwargs.keys(), *kwargs.values()])
        self.assertEqual(decorated('1', '2', kw1='3', kw2='4'), '1,2,kw1,kw2,3,4')
