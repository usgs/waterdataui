"""
Unit tests for the main WDFN views.
"""

import json
import re
from unittest import TestCase, mock

import pytest
import requests_mock

from .. import app
from ..views import __version__, has_feedback_link
from ..utils import parse_rdb
from .mock_test_data import SITE_RDB, PARAMETER_RDB, MOCK_NETWORKS_RESPONSE, MOCK_NETWORK_RESPONSE


class TestHasFeedbackLink(TestCase):
    def setUp(self):
        self.app_client = app.test_client()

    def test_page_has_feedback_link(self):
        with app.test_request_context('/monitoring-location/0000000/'):
            self.assertTrue(has_feedback_link())
        with app.test_request_context('/networks/RTS/'):
            self.assertTrue(has_feedback_link())

    def test_no_feedback_link(self):
        with app.test_request_context('/questions-comments/some-email-address/'):
            self.assertFalse(has_feedback_link())
        with app.test_request_context('/provisional-data-statement/'):
            self.assertFalse(has_feedback_link())
        with app.test_request_context('/questions-comments/'):
            self.assertFalse(has_feedback_link())
        with app.test_request_context('/iv-data-availability-statement/'):
            self.assertFalse(has_feedback_link())
        with app.test_request_context('/hydrological-unit/'):
            self.assertFalse(has_feedback_link())
        with app.test_request_context('/hydrological-unit/0000/monitoring-locations/'):
            self.assertFalse(has_feedback_link())
        with app.test_request_context('/states/'):
            self.assertFalse(has_feedback_link())
        with app.test_request_context('/states/01/counties/23/monitoring-locations/'):
            self.assertFalse(has_feedback_link())


class TestHomeView(TestCase):
    def setUp(self):
        self.app_client = app.test_client()

    def test_version(self):
        response = self.app_client.get('/')

        self.assertEqual(response.status_code, 200)
        self.assertIn(__version__, response.data.decode('utf-8'))


class TestQuestionsCommentsView(TestCase):
    def setUp(self):
        self.app_client = app.test_client()

    def test_successful_view(self):
        fake_email = 'test%40test.gov'
        response = self.app_client.get('/questions-comments/{}/?referring_page_type=monitoring'.format(fake_email))
        self.assertEqual(200, response.status_code)


class TestFeedbackSubmitted(TestCase):
    def setUp(self):
        self.app_client = app.test_client()

    def test_successful_view(self):
        email_send_result = 'success'
        response = self.app_client.get('/feedback-submitted/{}/'.format(email_send_result))
        self.assertEqual(200, response.status_code)


class TestProvisionalDataStatementView(TestCase):
    def setUp(self):
        self.app_client = app.test_client()

    def test_successful_view(self):
        response = self.app_client.get('/provisional-data-statement/')

        self.assertEqual(response.status_code, 200)


class TestIvDataAvailabilityStatementView(TestCase):
    def setUp(self):
        self.app_client = app.test_client()

    def test_successful_view(self):
        response = self.app_client.get('/iv-data-availability-statement/')

        self.assertEqual(response.status_code, 200)


class TestMonitoringLocationView(TestCase):
    # pylint: disable=R0902

    def setUp(self):
        self.app_client = app.test_client()
        self.test_site_number = '01630500'
        self.test_url = '{0}/?site={1}'.format(app.config['SITE_DATA_ENDPOINT'], self.test_site_number)
        self.test_rdb_text = SITE_RDB
        self.test_rdb_lines = self.test_rdb_text.split('\n')
        self.headers = {'Accept': 'application/ld+json'}

    @mock.patch('waterdata.views.SiteService.get_period_of_record')
    @mock.patch('waterdata.views.SiteService.get_site_data')
    def test_everything_okay(self, site_mock, param_mock):
        site_mock.return_value = (200, '', [datum for datum in parse_rdb(iter(SITE_RDB.split('\n')))])

        param_mock.return_value = (200, '', [datum for datum in parse_rdb(iter(PARAMETER_RDB.split('\n')))])

        response = self.app_client.get('/monitoring-location/{}/?agency_cd=USGS'.format(self.test_site_number))
        self.assertEqual(response.status_code, 200)
        self.assertIn('Some Random Site', response.data.decode('utf-8'))
        self.assertIn('@context', response.data.decode('utf-8'))
        # make sure no weird escaping happens when the page responds
        self.assertIn(('https://waterdata.usgs.gov/nwisweb/graph'
                       '?agency_cd=USGS&site_no=01630500&parm_cd=00060&period=100'),
                      response.data.decode('utf-8'))

        # reset iterators for json-ld tests
        json_ld_response = self.app_client.get(
            '/monitoring-location/{}/?agency_cd=USGS'.format(self.test_site_number),
            headers=self.headers
        )
        self.assertEqual(json_ld_response.status_code, 200)
        self.assertIsInstance(json.loads(json_ld_response.data), dict)

    @mock.patch('waterdata.views.SiteService.get_site_data')
    def test_4xx_from_water_services(self, site_mock):
        site_mock.return_value = (400, 'Site number is invalid.', [])

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

    @mock.patch('waterdata.views.SiteService.get_site_data')
    def test_5xx_from_water_services(self, site_mock):
        site_mock.return_value = (500, '', None)

        site_mock.get(self.test_url, status_code=500)
        response = self.app_client.get('/monitoring-location/{}/'.format(self.test_site_number))
        self.assertEqual(response.status_code, 503)

        json_ld_response = self.app_client.get(
            '/monitoring-location/{}/'.format(self.test_site_number),
            headers=self.headers
        )
        self.assertEqual(json_ld_response.status_code, 503)
        self.assertIsNone(json.loads(json_ld_response.data))

    @mock.patch('waterdata.views.SiteService.get_site_data')
    def test_agency_cd(self, site_mock):
        site_mock.return_value = (500, '', None)
        response = self.app_client.get('/monitoring-location/{0}/?agency_cd=USGS'.format(self.test_site_number))
        site_mock.assert_called_with(self.test_site_number, 'USGS')
        self.assertEqual(response.status_code, 503)


class TestHydrologicalUnitView:
    # pylint: disable=R0201

    @pytest.fixture(autouse=True)
    def mock_site_call(self):
        """Return the same mock site list for each call to the site service"""
        with requests_mock.mock() as req:
            url = re.compile('{host}.*'.format(host=app.config['SITE_DATA_ENDPOINT']))
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
        self.test_url = '{0}'.format(app.config['MONITORING_LOCATIONS_OBSERVATIONS_ENDPOINT'])
        self.network = 'monitoring-locations'
        self.format = 'json'

    @mock.patch('waterdata.services.ogc.MonitoringLocationNetworkService.get_networks')
    def test_networks(self, network_mock):
        network_mock.return_value = json.loads(MOCK_NETWORKS_RESPONSE)
        response = self.app_client.get('/networks/')
        # Assert network listing works
        assert response.status_code == 200

    @mock.patch('waterdata.services.ogc.MonitoringLocationNetworkService.get_networks')
    def test_one_network(self, network_mock):
        network_mock.return_value = json.loads(MOCK_NETWORK_RESPONSE)
        response = self.app_client.get('/networks/{}/'.format(self.network))
        # Assert a known network works in gui
        assert response.status_code == 200

    @mock.patch('waterdata.services.ogc.MonitoringLocationNetworkService.get_networks')
    def test_invalid_network(self, network_mock):
        network_mock.return_value = {}
        response = self.app_client.get('/networks/')
        # Assert an invalid network in gui does not 404
        assert response.status_code == 404

    @mock.patch('waterdata.services.ogc.MonitoringLocationNetworkService.get_networks')
    def test_invalid_network_json_call(self, network_mock):
        network_mock.return_value = {}
        network = 'monitoring-locations-invalid'
        response = self.app_client.get('/networks/monitoring-locations-invalid/')
        # Assert an invalid ogc json network call 404s
        assert response.status_code == 404

class TestCountryStateCountyView:
    # pylint: disable=R0201

    @pytest.fixture(autouse=True)
    def mock_site_call(self):
        """Return the same mock site list for each call to the site service"""
        with requests_mock.mock() as req:
            url = re.compile('{host}.*'.format(host=app.config['SITE_DATA_ENDPOINT']))
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
