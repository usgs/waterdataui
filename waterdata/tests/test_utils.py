"""
Unit tests for the main WDFN views.
"""

from unittest import TestCase, mock

import requests as r

from ..utils import execute_get_request, parse_rdb


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


class TestParseRdb(TestCase):

    def setUp(self):
        self.test_rdb_lines = ['#',
                               '#',
                               '# US Geological Survey',
                               '# retrieved: 2018-01-02 09:31:20 -05:00	(caas01)',
                               '#',
                               '# The Site File stores location and general information about groundwater,',
                               '# surface water, and meteorological sites',
                               '# for sites in USA.',
                               '#',
                               ('# File-format description:  '
                                'http://help.waterdata.usgs.gov/faq/about-tab-delimited-output'),
                               '# Automated-retrieval info: http://waterservices.usgs.gov/rest/Site-Service.html',
                               '#',
                               '# Contact:   gs-w_support_nwisweb@usgs.gov',
                               '#',
                               '# The following selected fields are included in this output:',
                               '#',
                               '#  agency_cd       -- Agency',
                               '#  site_no         -- Site identification number',
                               '#  station_nm      -- Site name',
                               '#  site_tp_cd      -- Site type',
                               '#  dec_lat_va      -- Decimal latitude',
                               '#  dec_long_va     -- Decimal longitude',
                               '#  coord_acy_cd    -- Latitude-longitude accuracy',
                               '#  dec_coord_datum_cd -- Decimal Latitude-longitude datum',
                               '#  alt_va          -- Altitude of Gage/land surface',
                               '#  alt_acy_va      -- Altitude accuracy',
                               '#  alt_datum_cd    -- Altitude datum',
                               '#  huc_cd          -- Hydrologic unit code',
                               '#',
                               ('agency_cd	site_no	station_nm	site_tp_cd	dec_lat_va	dec_long_va	coord_acy_cd	'
                                'dec_coord_datum_cd	alt_va	alt_acy_va	alt_datum_cd	huc_cd'),
                               '5s	15s	50s	7s	16s	16s	1s	10s	8s	3s	10s	16s',
                               ('USGS	345670	Some Random Site	ST	200.94977778	-100.12763889	S	NAD83	 '
                                '151.20	 .1	NAVD88	02070010'),
                               ('USGS	345671	Some Random Site 1	ST	201.94977778	-101.12763889	S	NAD83	 '
                                '151.20	 .1	NAVD88	02070010')
                              ]

    def test_parse(self):
        result = parse_rdb(iter(self.test_rdb_lines))
        expected_1 = {'agency_cd': 'USGS',
                      'site_no': '345670',
                      'station_nm':
                      'Some Random Site',
                      'site_tp_cd': 'ST',
                      'dec_lat_va': '200.94977778',
                      'dec_long_va': '-100.12763889',
                      'coord_acy_cd': 'S',
                      'dec_coord_datum_cd': 'NAD83',
                      'alt_va': ' 151.20',
                      'alt_acy_va': ' .1',
                      'alt_datum_cd': 'NAVD88',
                      'huc_cd': '02070010'
                     }
        expected_2 = {'agency_cd': 'USGS',
                      'site_no': '345671',
                      'station_nm':
                      'Some Random Site 1',
                      'site_tp_cd': 'ST',
                      'dec_lat_va': '201.94977778',
                      'dec_long_va': '-101.12763889',
                      'coord_acy_cd': 'S',
                      'dec_coord_datum_cd': 'NAD83',
                      'alt_va': ' 151.20',
                      'alt_acy_va': ' .1',
                      'alt_datum_cd': 'NAVD88',
                      'huc_cd': '02070010'
                     }
        self.assertDictEqual(next(result), expected_1)
        self.assertDictEqual(next(result), expected_2)

    def test_no_data(self):
        with self.assertRaises(Exception) as err:
            parse_rdb(iter([]))
            self.assertEqual(err.exception.message, 'RDB column headers not found.')

    def test_only_comments(self):
        with self.assertRaises(Exception) as err:
            parse_rdb(iter(self.test_rdb_lines[0:5]))
            self.assertEqual(err.exception.message, 'RDB column headers not found.')

    def test_no_records(self):
        result = parse_rdb(iter(self.test_rdb_lines[:-2]))
        result_list = list(result)
        self.assertFalse(result_list)  # list should be empty and evaluate to False
