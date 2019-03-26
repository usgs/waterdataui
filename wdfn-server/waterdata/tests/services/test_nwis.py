"""
Tests for NWISWeb service calls.

"""
from unittest import TestCase, mock

from waterdata.services.nwis import NwisWebServices, parse_rdb


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


class TestParseRdb(TestCase):

    def setUp(self):
        self.test_rdb_lines = [
            '#',
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

    def test_ignore_empty_lines(self):
        result = parse_rdb(iter(self.test_rdb_lines + ['\n', '\n']))
        result_list = list(result)
        self.assertEqual(len(result_list), 2)
