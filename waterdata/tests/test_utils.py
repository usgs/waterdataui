
from unittest import TestCase, mock

import requests_mock
import requests as r

from ..utils import get_water_services_data, parse_rdb


class TestGetWaterServicesData(TestCase):

    def setUp(self):
        self.test_hostname = 'http://blah.usgs.fake'
        self.test_site_number = '345670'
        self.test_url = '{0}/nwis/site/?site={1}'.format(self.test_hostname, self.test_site_number)
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

    @requests_mock.mock()
    def test_success(self, r_mock):
        r_mock.get(self.test_url, status_code=200, text=self.test_rdb_text, reason='OK')
        result = get_water_services_data(self.test_hostname, 'nwis/site/?site={}'.format(self.test_site_number))
        expected = (self.test_rdb_text, 200, 'OK')
        self.assertTupleEqual(expected, result)

    @requests_mock.mock()
    def test_bad_request(self, r_mock):
        r_mock.get(self.test_url, status_code=400, text=self.test_bad_resp, reason='Some Reason')
        result = get_water_services_data(self.test_hostname, 'nwis/site/?site={}'.format(self.test_site_number))
        expected = (None, 400, 'Some Reason')
        self.assertTupleEqual(expected, result)

    def test_service_timeout(self):
        with mock.patch('waterdata.utils.r.get') as r_mock:
            r_mock.side_effect = r.exceptions.Timeout
            result = get_water_services_data(self.test_hostname, 'nwis/site/?site={}'.format(self.test_site_number))
        expected = (None, None, None)
        self.assertTupleEqual(expected, result)


class TestParseRdb(TestCase):

    def setUp(self):
        self.test_rdb_text = ('#\n#\n# US Geological Survey\n# retrieved: 2018-01-02 09:31:20 -05:00\t(caas01)\n#\n# '
                              'The Site File stores location and general information about groundwater,\n# surface '
                              'water, and meteorological sites\n# for sites in USA.\n#\n# File-format description:  '
                              'http://help.waterdata.usgs.gov/faq/about-tab-delimited-output\n# Automated-retrieval '
                              'info: http://waterservices.usgs.gov/rest/Site-Service.html\n#\n# Contact:   '
                              'gs-w_support_nwisweb@usgs.gov\n#\n'
                              '# The following selected fields are included in this '
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

    def test_parse(self):
        result = parse_rdb(self.test_rdb_text)
        expected = {'agency_cd': 'USGS',
                    'site_no': '345670',
                    'station_nm':
                    'Some Random Site',
                    'site_tp_cd': 'ST',
                    'dec_lat_va': '200.94977778',
                    'dec_long_va': '-100.12763889',
                    'coord_acy_cd': 'S',
                    'dec_coord_datum_cd':'NAD83',
                    'alt_va': ' 151.20',
                    'alt_acy_va': ' .1',
                    'alt_datum_cd': 'NAVD88',
                    'huc_cd': '02070010'
                    }
        self.assertListEqual(result, [expected])
        self.assertDictEqual(result[0], expected)