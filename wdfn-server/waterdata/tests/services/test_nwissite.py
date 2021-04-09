"""
Tests for NWISWeb service calls.

"""
from unittest import TestCase

from requests_mock import Mocker

from ...services.nwissite import SiteService
from ..mock_test_data import SITE_RDB, PARAMETER_RDB


class TestSiteService(TestCase):

    def setUp(self):
        self.endpoint = 'https://www.fakesiteservice.gov/nwis'
        self.site_service = SiteService(self.endpoint)

    def test_successful_get_no_query_parameters(self):
        with Mocker(session=self.site_service.session) as session_mock:
            session_mock.get(self.endpoint, text=SITE_RDB)
            status_code, _, result = self.site_service.get({})
            self.assertEqual(session_mock.call_count, 1)
            self.assertIn('format=rdb', session_mock.request_history[0].query)
            self.assertEqual(status_code, 200)
            self.assertEqual(len(result), 1)
            self.assertEqual(result[0]['site_no'], '01630500')

    def test_successful_get_query_parameters(self):
        with Mocker(session=self.site_service.session) as session_mock:
            session_mock.get(self.endpoint, text=SITE_RDB)
            status_code, _, result = self.site_service.get({
                'param1': 'this',
                'param2': 'that'
            })
            self.assertEqual(status_code, 200)
            self.assertIn('param1=this', session_mock.request_history[0].query)
            self.assertIn('param2=that', session_mock.request_history[0].query)
            self.assertIn('format=rdb', session_mock.request_history[0].query)

    def test_500_get(self):
        with Mocker(session=self.site_service.session) as session_mock:
            session_mock.get(self.endpoint, reason='Bad server', status_code=500)
            status_code, reason, _ = self.site_service.get({})
            self.assertEqual(status_code, 500)
            self.assertEqual(reason, 'Bad server')

    def test_non500_error_get(self):
        with Mocker(session=self.site_service.session) as session_mock:
            session_mock.get(self.endpoint, reason='Not found', status_code=404)
            status_code, reason, result = self.site_service.get({})
            self.assertEqual(status_code, 404)
            self.assertEqual(reason, 'Not found')
            self.assertEqual(result, [])

    def test_successful_get_site_data_with_no_agency_cd(self):
        with Mocker(session=self.site_service.session) as session_mock:
            session_mock.get(self.endpoint, text=SITE_RDB, reason='OK')
            status_code, reason, result = self.site_service.get_site_data('01630500')
            self.assertIn('sites=01630500', session_mock.request_history[0].query)
            self.assertIn('siteoutput=expanded', session_mock.request_history[0].query)
            self.assertNotIn('agencycd', session_mock.request_history[0].query)
            self.assertEqual(status_code, 200)
            self.assertEqual(reason, 'OK')
            self.assertEqual(len(result), 1)

    def test_successful_get_site_with_agency_cd(self):
        with Mocker(session=self.site_service.session) as session_mock:
            session_mock.get(self.endpoint, text=SITE_RDB, reason='OK')
            status_code, reason, result = self.site_service.get_site_data('01630500', agency_cd='USGS')
            self.assertIn('sites=01630500', session_mock.request_history[0].query)
            self.assertIn('siteoutput=expanded', session_mock.request_history[0].query)
            self.assertIn('agencycd=usgs', session_mock.request_history[0].query)
            self.assertEqual(status_code, 200)
            self.assertEqual(reason, 'OK')
            self.assertEqual(len(result), 1)

    def test_404_get_site(self):
        with Mocker(session=self.site_service.session) as session_mock:
            session_mock.get(self.endpoint, text=SITE_RDB, reason='Not found', status_code=404)
            status_code, reason, result = self.site_service.get_site_data('01630500', agency_cd='USGS')
            self.assertEqual(status_code, 404)
            self.assertEqual(reason, 'Not found')
            self.assertEqual(result, [])

    def test_successful_get_period_of_record_with_no_agency_cd(self):
        with Mocker(session=self.site_service.session) as session_mock:
            session_mock.get(self.endpoint, text=PARAMETER_RDB, reason='OK')
            status_code, reason, result = self.site_service.get_period_of_record('01630500')
            self.assertIn('sites=01630500', session_mock.request_history[0].query)
            self.assertIn('sitestatus=all', session_mock.request_history[0].query)
            self.assertIn('seriescatalogoutput=true', session_mock.request_history[0].query)
            self.assertNotIn('agencycd', session_mock.request_history[0].query)
            self.assertEqual(status_code, 200)
            self.assertEqual(reason, 'OK')
            self.assertEqual(len(result), 8)

    def test_successful_get_period_of_record_with_agency_cd(self):
        with Mocker(session=self.site_service.session) as session_mock:
            session_mock.get(self.endpoint, text=PARAMETER_RDB, reason='OK')
            status_code, reason, result = self.site_service.get_period_of_record('01630500', agency_cd='USGS')
            self.assertIn('sites=01630500', session_mock.request_history[0].query)
            self.assertIn('sitestatus=all', session_mock.request_history[0].query)
            self.assertIn('seriescatalogoutput=true', session_mock.request_history[0].query)
            self.assertIn('agencycd=usgs', session_mock.request_history[0].query)
            self.assertEqual(status_code, 200)
            self.assertEqual(reason, 'OK')
            self.assertEqual(len(result), 8)

    def test_404_get_period_of_record(self):
        with Mocker(session=self.site_service.session) as session_mock:
            session_mock.get(self.endpoint, text=PARAMETER_RDB, reason='Not found', status_code=404)
            status_code, reason, result = self.site_service.get_period_of_record('01630500', agency_cd='USGS')
            self.assertEqual(status_code, 404)
            self.assertEqual(reason, 'Not found')
            self.assertEqual(result, [])

    def test_successful_get_huc_sites(self):
        with Mocker(session=self.site_service.session) as session_mock:
            session_mock.get(self.endpoint, text=SITE_RDB, reason='OK')
            status_code, reason, result = self.site_service.get_huc_sites('07010101')
            self.assertIn('huc=07010101', session_mock.request_history[0].query)
            self.assertEqual(status_code, 200)
            self.assertEqual(reason, 'OK')
            self.assertEqual(len(result), 1)

    def test_unsuccessful_get_huc_sites(self):
        with Mocker(session=self.site_service.session) as session_mock:
            session_mock.get(self.endpoint, text=SITE_RDB, reason='Not found', status_code=404)
            status_code, reason, result = self.site_service.get_huc_sites('07010101')
            self.assertIn('huc=07010101', session_mock.request_history[0].query)
            self.assertEqual(status_code, 404)
            self.assertEqual(reason, 'Not found')
            self.assertEqual(len(result), 0)

    def test_successful_get_county_sites(self):
        with Mocker(session=self.site_service.session) as session_mock:
            session_mock.get(self.endpoint, text=SITE_RDB, reason='OK')
            status_code, reason, result = self.site_service.get_county_sites('55003')
            self.assertIn('countycd=55003', session_mock.request_history[0].query)
            self.assertEqual(status_code, 200)
            self.assertEqual(reason, 'OK')
            self.assertEqual(len(result), 1)

    def test_unsuccessful_get_county_sites(self):
        with Mocker(session=self.site_service.session) as session_mock:
            session_mock.get(self.endpoint, text=SITE_RDB, reason='Not found', status_code=404)
            status_code, reason, result = self.site_service.get_county_sites('55003')
            self.assertIn('countycd=55003', session_mock.request_history[0].query)
            self.assertEqual(status_code, 404)
            self.assertEqual(reason, 'Not found')
            self.assertEqual(len(result), 0)
