
from unittest import TestCase, mock

import requests

from ..wqp_lookups import get_lookup_by_json, is_us_county, get_nwis_state_lookup, get_nwis_county_lookup


@mock.patch('lookup_generation.wqp_lookups.execute_get_request')
class GetLookupByJsonTestCase(TestCase):

    def test_sets_query_params_correctly(self, mrequest):
        mrequest.return_value = requests.Response()
        mrequest.return_value.status_code = 500
        get_lookup_by_json('http://fakehost.com', path='codes', params={'param1': 'value1'})
        mrequest.assert_called_with('http://fakehost.com',
                                    path='codes',
                                    params={'param1': 'value1', 'mimeType': 'json'})

    def test_bad_request(self, mrequest):
        mrequest.return_value = requests.Response()
        mrequest.return_value.status_code = 500
        self.assertEqual(get_lookup_by_json('http://fakehost.com', path='codes'), {})

    def test_good_request(self, mrequest):
        def test_json():
            return {'codes': []}

        mrequest.return_value = requests.Response()
        mrequest.return_value.status_code = 200
        mrequest.return_value.json = test_json
        self.assertEqual(get_lookup_by_json('http://fakehost.com', path='codes'), {'codes': []})


class IsUsCountyTestCase(TestCase):

    def test_empty_lookup(self):
        self.assertFalse(is_us_county({}))

    def test_lookup_with_no_colon_in_value(self):
        self.assertFalse(is_us_county({'value': '12US'}))

    def test_lookup_with_colon_and_us(self):
        self.assertTrue(is_us_county({'value': 'US:12'}))

    def test_lookup_with_colon_and_not_us(self):
        self.assertFalse(is_us_county({'value': 'CA:12'}))


class GetNwisStateLookupTestCase(TestCase):

    def test_empty_list(self):
        self.assertEqual(get_nwis_state_lookup([]), {})

    def test_valid_lookup(self):
        test_lookup = [
            {'value': 'US:55', 'desc': 'Wisconsin'},
            {'value': 'US:01', 'desc': 'Alabama'}
        ]
        self.assertEqual(get_nwis_state_lookup(test_lookup),
                         {'55': {'name': 'Wisconsin'},
                          '01': {'name': 'Alabama'}}
                         )


class GetNwisCountyLookupTestCase(TestCase):

    def test_empty_list(self):
        self.assertEqual(get_nwis_county_lookup([]), {})

    def test_valid_lookup(self):
        test_lookup = [
            {'value': 'US:01:001', 'desc': 'US, Alabama, Autauga County'},
            {'value': 'US:01:002', 'desc': 'US, Alabama, Baldwin County'},
            {'value': 'US:02:068', 'desc': 'US, Alaska, Denali Borough'}
        ]
        self.assertEqual(get_nwis_county_lookup(test_lookup),
                         {'01': {'001': {'name': 'Autauga County'}, '002': {'name': 'Baldwin County'}},
                          '02': {'068': {'name': 'Denali Borough'}}}
                         )
