"""
Unit tests for the main WDFN views.
"""

from unittest import TestCase, mock

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
        self.test_hostname = app.config['SERVICE_ROOT']
        self.app_client = app.test_client()
        self.test_site_number = '01630500'
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
                              '16s\nUSGS\t01630500\tSome Random Site\tST\t200.94977778\t-100.12763889\tS\t'
                              'NAD83\t 151.20\t .1\tNAVD88\t02070010')
        self.test_rdb_lines = self.test_rdb_text.split('\n')
        self.test_json_ld = {'@context': ['https://opengeospatial.github.io/ELFIE/json-ld/elf-index.jsonld',
                                          'https://opengeospatial.github.io/ELFIE/json-ld/hyf.jsonld'
                                          ],
                             '@id': 'https://waterdata.usgs.gov/monitoring-location/01630500',
                             '@type': 'http://www.opengeospatial.org/standards/waterml2/hy_features/HY_HydroLocation',
                             'name': 'Some Random Site',
                             'sameAs': 'https://waterdata.usgs.gov/nwis/inventory/?site_no=01630500',
                             'HY_HydroLocationType': 'hydrometricStation',
                             'geo': {'@type': 'schema:GeoCoordinates', 'latitude': '200.94977778',
                                     'longitude': '-100.12763889'},
                             'image': ('https://waterdata.usgs.gov/nwisweb/graph?'
                                       'agency_cd=USGS&site_no=01630500&parm_cd=00060&period=100')
                             }

    @mock.patch('waterdata.views.MonitoringLocation')
    @mock.patch('waterdata.location.execute_get_request')
    def test_everything_okay(self, r_mock, ml_mock):
        m_resp = mock.Mock()
        m_resp.status_code = 200
        m_resp.text = self.test_rdb_text
        m_resp.iter_lines.return_value = iter(self.test_rdb_lines)
        r_mock.return_value = m_resp
        # Mocking a class creates a MagicMock()...
        # when an instance of the class is created, a new MagicMock is created.
        # Then when one refers to the return_value of class's MagicMock, one gets
        # the MagicMock that was created when the instance was created.
        # This means syntax is slightly different between class and instance methods.
        #
        # Here, ml_mock represents the MagicMock object of the class.
        # Its return value is then another MagicMock representing an instance.
        # Hence, the syntax below for mocking an instance method:
        ml_mock.return_value.build_linked_data.return_value = self.test_json_ld
        ml_mock.return_value.get_expanded_metadata.return_value = (m_resp, {})

        response = self.app_client.get('/monitoring-location/{}'.format(self.test_site_number))
        self.assertEqual(response.status_code, 200)
        self.assertIn('Some Random Site', response.data.decode('utf-8'))
        self.assertIn('@context', response.data.decode('utf-8'))
        # make sure no weird escaping happens when the page responds
        self.assertIn(('https://waterdata.usgs.gov/nwisweb/graph'
                       '?agency_cd=USGS&site_no=01630500&parm_cd=00060&period=100'),
                      response.data.decode('utf-8')
                      )

    @mock.patch('waterdata.location.execute_get_request')
    def test_4xx_from_water_services(self, r_mock):
        m_resp = mock.Mock()
        m_resp.status_code = 400
        m_resp.reason = 'Site number is invalid.'
        r_mock.return_value = m_resp

        response = self.app_client.get('/monitoring-location/{}'.format(self.test_site_number))
        self.assertEqual(response.status_code, 200)
        self.assertIn('Site number is invalid.', response.data.decode('utf-8'))
        self.assertNotIn('@context', response.data.decode('utf-8'))

    @mock.patch('waterdata.location.execute_get_request')
    def test_5xx_from_water_services(self, r_mock):
        m_resp = mock.Mock()
        m_resp.status_code = 500
        r_mock.return_value = m_resp

        r_mock.get(self.test_url, status_code=500)
        response = self.app_client.get('/monitoring-location/{}'.format(self.test_site_number))
        self.assertEqual(response.status_code, 503)

    @mock.patch('waterdata.location.execute_get_request')
    def test_agency_cd(self, r_mock):
        r_mock.return_value.status_code = 500
        response = self.app_client.get('/monitoring-location/{0}?agency_cd=USGS'.format(self.test_site_number))
        r_mock.assert_called_with(self.test_hostname,
                                  '/nwis/site/',
                                  {'site': self.test_site_number,
                                   'agencyCd': 'USGS',
                                   'siteOutput': 'expanded',
                                   'format': 'rdb'
                                   }
                                  )
        self.assertEqual(response.status_code, 503)
