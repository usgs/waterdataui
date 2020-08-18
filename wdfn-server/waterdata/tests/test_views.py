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
from ..utils import parse_rdb
from .rdb_snippets import SITE_RDB, PARAMETER_RDB

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
        self.test_rdb_text = SITE_RDB
        self.test_rdb_lines = self.test_rdb_text.split('\n')
        self.headers = {'Accept': 'application/ld+json'}

    @mock.patch('waterdata.views.NwisWebServices.get_site_parameters')
    @mock.patch('waterdata.views.NwisWebServices.get_site')
    def test_everything_okay(self, site_mock, param_mock):
        m_resp = mock.Mock()
        m_resp.status_code = 200
        m_resp.text = self.test_rdb_text
        m_resp.iter_lines.return_value = iter(self.test_rdb_lines)
        site_mock.return_value = m_resp

        param_mock.return_value = [datum for datum in parse_rdb(iter(PARAMETER_RDB.split('\n')))]

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
        json_ld_response = self.app_client.get(
            '/monitoring-location/{}/?agency_cd=USGS'.format(self.test_site_number),
            headers=self.headers
        )
        self.assertEqual(json_ld_response.status_code, 200)
        self.assertIsInstance(json.loads(json_ld_response.data), dict)

    @mock.patch('waterdata.views.NwisWebServices.get_site')
    def test_4xx_from_water_services(self, site_mock):
        m_resp = mock.Mock()
        m_resp.status_code = 400
        m_resp.reason = 'Site number is invalid.'
        site_mock.return_value = m_resp

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

    @mock.patch('waterdata.views.NwisWebServices.get_site')
    def test_5xx_from_water_services(self, site_mock):
        m_resp = mock.Mock()
        m_resp.status_code = 500
        site_mock.return_value = m_resp

        site_mock.get(self.test_url, status_code=500)
        response = self.app_client.get('/monitoring-location/{}/'.format(self.test_site_number))
        self.assertEqual(response.status_code, 503)

        json_ld_response = self.app_client.get(
            '/monitoring-location/{}/'.format(self.test_site_number),
            headers=self.headers
        )
        self.assertEqual(json_ld_response.status_code, 503)
        self.assertIsNone(json.loads(json_ld_response.data))

    @mock.patch('waterdata.views.NwisWebServices.get_site')
    def test_agency_cd(self, site_mock):
        site_mock.return_value.status_code = 500
        response = self.app_client.get('/monitoring-location/{0}/?agency_cd=USGS'.format(self.test_site_number))
        site_mock.assert_called_with(self.test_site_number, 'USGS')
        self.assertEqual(response.status_code, 503)


class TestHydrologicalUnitView:
    # pylint: disable=R0201

    @pytest.fixture(autouse=True)
    def mock_site_call(self):
        """Return the same mock site list for each call to the site service"""
        with requests_mock.mock() as req:
            url = re.compile('{host}/nwis/site/.*'.format(host=app.config['SERVER_SERVICE_ROOT']))
            req.get(url, text=PARAMETER_RDB)
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


class TestNetworkView(TestCase):
    # pylint: disable=R0902

    def setUp(self):
        self.app_client = app.test_client()
        self.test_url = '{0}/'.format(app.config['NETWORK_ENDPOINT'])
        self.network = 'monitoring-locations'
        self.format = 'json'

    @mock.patch('waterdata.services.ogc.get_networks')
    def test_networks(self, network_mock):
        network_mock.return_value.status_code = 200
        response = self.app_client.get('/networks/')
        # Assert network listing works
        assert response.status_code == 200

    @mock.patch('waterdata.services.ogc.get_networks')
    def test_one_network(self, network_mock):
        network_mock.return_value.status_code = 200
        response = self.app_client.get('/networks/{}/'.format(self.network))
        # Assert a known network works in gui
        assert response.status_code == 200

    @mock.patch('waterdata.services.ogc.get_networks')
    def test_invalid_network(self, network_mock):
        network_mock.return_value.status_code = 200
        network = 'monitoring-locations-invalid'
        url = '/networks/{}/'.format(network)
        response = self.app_client.get(url)
        # Assert an invalid network in gui does not 404
        assert response.status_code == 200

    @mock.patch('waterdata.services.ogc.get_networks')
    def test_invalid_network_json_call(self, network_mock):
        network_mock.return_value.status_code = 200
        network = 'monitoring-locations-invalid'
        url = '{0}{1}?f={2}'.format(self.test_url, network, self.format)
        response = self.app_client.get(url)
        # Assert an invalid ogc json network call 404s
        assert response.status_code == 404


class TestCountryStateCountyView:
    # pylint: disable=R0201

    @pytest.fixture(autouse=True)
    def mock_site_call(self):
        """Return the same mock site list for each call to the site service"""
        with requests_mock.mock() as req:
            url = re.compile('{host}/nwis/site/.*'.format(host=app.config['SERVER_SERVICE_ROOT']))
            req.get(url, text=PARAMETER_RDB)
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
