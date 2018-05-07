"""
Unit tests for the main WDFN views.
"""

import json
import re
from unittest import TestCase, mock

import pytest
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
    # pylint: disable=R0902

    def setUp(self):
        self.app_client = app.test_client()
        self.test_site_number = '01630500'
        self.test_url = '{0}/nwis/site/?site={1}'.format(app.config['SERVER_SERVICE_ROOT'], self.test_site_number)
        self.test_rdb_text = MOCK_SITE_LIST_1
        self.test_rdb_lines = self.test_rdb_text.split('\n')
        self.test_param_rdb = MOCK_SITE_LIST_2
        self.parameter_lines = self.test_param_rdb.split('\n')
        self.headers = {'Accept': 'application/ld+json'}

    @mock.patch('waterdata.views.execute_lookup_request')
    @mock.patch('waterdata.views.execute_get_request')
    def test_everything_okay(self, r_mock, r_mock_lookup):
        m_resp = mock.Mock()
        m_resp.status_code = 200
        m_resp.text = self.test_rdb_text
        m_resp.iter_lines.return_value = iter(self.test_rdb_lines)
        m_resp_param = mock.Mock()
        m_resp_param.status_code = 200
        m_resp_param.iter_lines.return_value = iter(self.parameter_lines)
        r_mock.side_effect = [m_resp, m_resp_param]

        m_resp_lookup = mock.Mock()
        m_resp_lookup.status_code = 200
        m_resp_lookup.return_value = {'Customers': [{'Name': 'mock_cooperator',
                                                     'URL': 'http://www.fake.gov',
                                                     'IconURL': 'http://www.fake.gov'}]}
        r_mock_lookup.return_value.json = m_resp_lookup

        response = self.app_client.get('/monitoring-location/{}/?agency_cd=USGS'.format(self.test_site_number))
        self.assertEqual(response.status_code, 200)
        self.assertIn('Some Random Site', response.data.decode('utf-8'))
        self.assertIn('@context', response.data.decode('utf-8'))
        # make sure no weird escaping happens when the page responds
        self.assertIn(('https://waterdata.usgs.gov/nwisweb/graph'
                       '?agency_cd=USGS&site_no=01630500&parm_cd=00060&period=100'),
                      response.data.decode('utf-8'))

        # reset iterators for json-ld tests
        m_resp.iter_lines.return_value = iter(self.test_rdb_lines)
        m_resp_param.iter_lines.return_value = iter(self.parameter_lines)
        r_mock.side_effect = [m_resp, m_resp_param]
        json_ld_response = self.app_client.get(
            '/monitoring-location/{}/?agency_cd=USGS'.format(self.test_site_number),
            headers=self.headers
        )
        self.assertEqual(json_ld_response.status_code, 200)
        self.assertIsInstance(json.loads(json_ld_response.data), dict)


    @mock.patch('waterdata.views.execute_get_request')
    def test_4xx_from_water_services(self, r_mock):
        m_resp = mock.Mock()
        m_resp.status_code = 400
        m_resp.reason = 'Site number is invalid.'
        r_mock.return_value = m_resp

        response = self.app_client.get('/monitoring-location/{}/'.format(self.test_site_number))
        self.assertEqual(response.status_code, 200)
        self.assertIn('Site number is invalid.', response.data.decode('utf-8'))
        self.assertNotIn('@context', response.data.decode('utf-8'))

        json_ld_response = self.app_client.get(
            '/monitoring-location/{}/'.format(self.test_site_number),
            headers=self.headers
        )
        self.assertEqual(json_ld_response.status_code, 200)
        self.assertIsNone(json.loads(json_ld_response.data))

    @mock.patch('waterdata.views.execute_get_request')
    def test_5xx_from_water_services(self, r_mock):
        m_resp = mock.Mock()
        m_resp.status_code = 500
        r_mock.return_value = m_resp

        r_mock.get(self.test_url, status_code=500)
        response = self.app_client.get('/monitoring-location/{}/'.format(self.test_site_number))
        self.assertEqual(response.status_code, 503)

        json_ld_response = self.app_client.get(
            '/monitoring-location/{}/'.format(self.test_site_number),
            headers=self.headers
        )
        self.assertEqual(json_ld_response.status_code, 503)
        self.assertIsNone(json.loads(json_ld_response.data))

    @mock.patch('waterdata.views.execute_get_request')
    def test_agency_cd(self, r_mock):
        r_mock.return_value.status_code = 500
        response = self.app_client.get('/monitoring-location/{0}/?agency_cd=USGS'.format(self.test_site_number))
        r_mock.assert_called_with(app.config['SERVER_SERVICE_ROOT'],
                                  path='/nwis/site/',
                                  params={'site': self.test_site_number,
                                          'agencyCd': 'USGS',
                                          'siteOutput': 'expanded',
                                          'format': 'rdb'})
        self.assertEqual(response.status_code, 503)


class TestHydrologicalUnitView:
    # pylint: disable=R0201

    @pytest.fixture(autouse=True)
    def mock_site_call(self):
        """Return the same mock site list for each call to the site service"""
        with requests_mock.mock() as req:
            url = re.compile('{host}/nwis/site/.*'.format(host=app.config['SERVER_SERVICE_ROOT']))
            req.get(url, text=MOCK_SITE_LIST_2)
            yield

    def test_huc2(self, client):
        response = client.get('/hydrological-unit/')
        assert response.status_code == 200

    def test_some_exist(self, client):
        for huc_cd in list(app.config['HUC_LOOKUP']['hucs'].keys())[:20]:
            response = client.get('/hydrological-unit/{}/'.format(huc_cd))
            assert response.status_code == 200

    def test_404s(self, client):
        response = client.get('/hydrological-unit/1/')
        assert response.status_code == 404

    def test_locations_list(self, client):
        response = client.get('/hydrological-unit/01010001/monitoring-locations/')
        assert response.status_code == 200
        text = response.data.decode('utf-8')
        # There are eight instances of this site in MOCK_SITE_LIST_2.
        assert text.count('01630500') == 16, 'Expected site 01630500 in output'


class TestCountryStateCountyView:
    # pylint: disable=R0201

    @pytest.fixture(autouse=True)
    def mock_site_call(self):
        """Return the same mock site list for each call to the site service"""
        with requests_mock.mock() as req:
            url = re.compile('{host}/nwis/site/.*'.format(host=app.config['SERVER_SERVICE_ROOT']))
            req.get(url, text=MOCK_SITE_LIST_2)
            yield

    def test_country_level_search_us(self, client):
        response = client.get('/states/')
        assert response.status_code == 200

    def test_some_counties_exist(self, client):
        for state_cd in list(app.config['COUNTRY_STATE_COUNTY_LOOKUP']['US']['state_cd'].keys())[:20]:
            response = client.get('/states/{}/'.format(state_cd))
            assert response.status_code == 200

    def test_404s_incorrect_state_code(self, client):
        response = client.get('/states/1/')
        assert response.status_code == 404

    def test_404s_incorrect_county_code(self, client):
        response = client.get('/states/01/counties/1/')
        assert response.status_code == 404

    def test_locations_list(self, client):
        response = client.get('/states/23/counties/003/monitoring-locations/')
        assert response.status_code == 200
        text = response.data.decode('utf-8')
        assert text.count('01630500') == 16, 'Expected site 01630500 in output'


class TestTimeSeriesComponentView:
    # pylint: disable=R0201,R0903

    def test_get(self, client):
        response = client.get('/components/time-series/01646500/')
        assert response.status_code == 200
        text = response.data.decode('utf-8')
        assert text.count('class="wdfn-component" data-component="hydrograph"') == 1, 'Component expected'


MOCK_SITE_LIST_1 = (
    '#\n#\n# US Geological Survey\n# retrieved: 2018-01-02 09:31:20 -05:00\t(caas01)\n#\n# '
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
    '#  state_cd      -- State code\n'
    '#  county_cd     -- County_code\n'
    '#  alt_va          -- Altitude of Gage/land surface\n'
    '#  alt_acy_va      -- Altitude accuracy\n#  alt_datum_cd    -- Altitude datum\n'
    '#  huc_cd          -- Hydrologic unit code\n#\nagency_cd\tsite_no\tstation_nm\t'
    'site_tp_cd\tdec_lat_va\tdec_long_va\tcoord_acy_cd\tdec_coord_datum_cd\tstate_cd\tcounty_cd\talt_va\t'
    'alt_acy_va\talt_datum_cd\thuc_cd\n5s\t15s\t50s\t7s\t16s\t17s\ts17s\t16s\t1s\t10s\t8s\t3s\t10s\t'
    '16s\nUSGS\t01630500\tSome Random Site\tST\t200.94977778\t-100.12763889\tS\t'
    'NAD83\t48\t061\t 151.20\t .1\tNAVD88\t02070010'
)

MOCK_SITE_LIST_2 = (
    '#\nagency_cd\tsite_no\tstation_nm\tsite_tp_cd\tdec_lat_va\tdec_long_va\tcoord_acy_cd\t'
    'dec_coord_datum_cd\talt_va\talt_acy_va\talt_datum_cd\thuc_cd\tdata_type_cd\tparm_cd\t'
    'stat_cd\tts_id\tloc_web_ds\tmedium_grp_cd\tparm_grp_cd\tsrs_id\taccess_cd\tbegin_date\t'
    'end_date\tcount_nu\n5s\t15s\t50s\t7s\t16s\t16s\t1s\t10s\t8s\t3s\t10s\t16s\t2s\t5s\t5s\t'
    '5n\t30s\t3s\t3s\t5n\t4n\t20d\t20d\t5n\nUSGS\t01630500\t'
    'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t-77.12763889\t'
    'S\tNAD83\t 37.20\t .1\tNAVD88\t'
    '02070008\tuv\t00010\t\t69930\t4.1 ft from riverbed (middle)\twat\t\t1645597\t0\t'
    '2007-10-01\t2018-01-10\t3754\nUSGS\t01630500\t'
    'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t-77.12763889\tS\t'
    'NAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00010\t\t69931\t'
    '1.0 ft from riverbed (bottom)\twat\t\t1645597\t0\t2007-10-01\t2018-01-10\t3754\nUSGS\t'
    '01630500\tPOTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t'
    '-77.12763889\tS\tNAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00010\t\t69932\t'
    '7.1 ft from riverbed (top)\twat\t\t1645597\t0\t2007-10-01\t2018-01-10\t3754\nUSGS\t'
    '01630500\tPOTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t'
    '-77.12763889\tS\tNAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00010\t\t69942\t'
    'From multiparameter sonde\twat\t\t1645597\t0\t2013-11-23\t2018-01-10\t1509\nUSGS\t'
    '01630500\tPOTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t'
    '-77.12763889\tS\tNAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00060\t\t69928\t\twat\t\t'
    '1645423\t0\t1972-06-09\t2018-01-10\t16651\nUSGS\t01630500\t'
    'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t'
    '-77.12763889\tS\tNAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00065\t\t69929\t\twat\t\t'
    '17164583\t0\t2007-10-01\t2018-01-10\t3754\nUSGS\t01630500\t'
    'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t-77.12763889\tS\t'
    'NAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00095\t\t69933\t7.1 ft from riverbed (top)\t'
    'wat\t\t1646694\t0\t2007-10-01\t2018-01-10\t3754\nUSGS\t01630500\t'
    'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t-77.12763889\tS\t'
    'NAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00095\t\t69943\tFrom multiparameter sonde\t'
    'wat\t\t1646694\t0\t2013-11-23\t2018-01-10\t1509'
)
