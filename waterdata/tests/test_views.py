
from unittest import TestCase

import requests_mock

from .. import app
from ..views import __version__


class TestHomeView(TestCase):

    def setUp(self):
        self.app_client = app.test_client()

    def test_version(self):
        response = self.app_client.get('/')

        self.assertEqual(response.status_code, 200)
        self.assertIn(__version__, response.data.decode('utf-8'))


class TestMonitoringLocationView(TestCase):

    def setUp(self):
        self.test_hostname = app.config['WATER_SERVICES']
        self.app_client = app.test_client()
        self.test_site_number = '345670'
        self.test_url = '{0}/nwis/site/?site={1}'.format(self.test_hostname, self.test_site_number)
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

    @requests_mock.mock()
    def test_everything_okay(self, r_mock):
        r_mock.get(self.test_url, status_code=200, text=self.test_rdb_text)
        response = self.app_client.get('/monitoringlocation/{}'.format(self.test_site_number))
        self.assertEqual(response.status_code, 200)
        self.assertIn('Some Random Site', response.data.decode('utf-8'))

    @requests_mock.mock()
    def test_4XX_from_water_services(self, r_mock):
        r_mock.get(self.test_url, status_code=400, reason='Site number is invalid.')
        response = self.app_client.get('/monitoringlocation/{}'.format(self.test_site_number))
        self.assertEqual(response.status_code, 200)
        self.assertIn('Site number is invalid.', response.data.decode('utf-8'))

    @requests_mock.mock()
    def test_500_from_water_services(self, r_mock):
        r_mock.get(self.test_url, status_code=500)
        response = self.app_client.get('/monitoringlocation/{}'.format(self.test_site_number))
        self.assertEqual(response.status_code, 502)
