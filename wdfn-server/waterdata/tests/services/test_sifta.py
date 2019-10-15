"""
Tests for the cooperator service calls.
"""

import json
from unittest import mock

from waterdata.services import sifta


MOCK_RESPONSE = """
{"Site": "06864000", "Date": "6/19/2018", "Customers":[{"Name":"Kansas Water Office","URL":"http://www.kwo.org/","IconURL":"http://water.usgs.gov/customer/icons/6737.gif"},{"Name":"USGS - Cooperative Matching Funds","URL":"http://water.usgs.gov/coop/","IconURL":"http://water.usgs.gov/customer/icons/usgsIcon.gif"}]}
"""
MOCK_CUSTOMER_LIST = json.loads(MOCK_RESPONSE)['Customers']


def test_sifta_response(config):
    with mock.patch('waterdata.services.sifta.execute_get_request') as r_mock:
        response = mock.Mock()
        response.status_code = 200
        response.text = MOCK_RESPONSE
        response.json.return_value = json.loads(MOCK_RESPONSE)
        r_mock.return_value = response

        config['COOPERATOR_LOOKUP_ENABLED'] = True
        cooperators = sifta.get_cooperators('12345', 'district code ignored')
        assert cooperators == MOCK_CUSTOMER_LIST, 'Expected response'


def test_sifta_disabled(config):
    config['COOPERATOR_LOOKUP_ENABLED'] = False
    cooperators = sifta.get_cooperators('12345', 'district code ignored')
    assert cooperators == [], 'Expected empty response'


def test_sifta_district_enabled(config):
    with mock.patch('waterdata.services.sifta.execute_get_request') as r_mock:
        response = mock.Mock()
        response.status_code = 200
        response.text = MOCK_RESPONSE
        response.json.return_value = json.loads(MOCK_RESPONSE)
        r_mock.return_value = response

        config['COOPERATOR_LOOKUP_ENABLED'] = ['10', '15']
        cooperators = sifta.get_cooperators('12345', '10')
        assert cooperators == MOCK_CUSTOMER_LIST, 'Expected response'


def test_sifta_district_disabled(config):
    with mock.patch('waterdata.services.sifta.execute_get_request') as r_mock:
        response = mock.Mock()
        response.status_code = 200
        response.text = MOCK_RESPONSE
        response.json.return_value = json.loads(MOCK_RESPONSE)
        r_mock.return_value = response

        config['COOPERATOR_LOOKUP_ENABLED'] = ['10', '15']
        cooperators = sifta.get_cooperators('12345', '20')
        assert cooperators == [], 'Expected empty response'


def test_sifta_handling_bad_status_code(config):
    with mock.patch('waterdata.services.sifta.execute_get_request') as r_mock:
        response = mock.Mock()
        response.status_code = 500
        r_mock.return_value = response

        config['COOPERATOR_LOOKUP_ENABLED'] = ['10', '15']
        cooperators = sifta.get_cooperators('12345', '10')
        assert cooperators == [], 'Expected response'


def test_unparsable_json(config):
    with mock.patch('waterdata.services.sifta.execute_get_request') as r_mock:
        mock_resp = mock.Mock()
        mock_resp.status_code = 200
        mock_resp.json.side_effect = json.JSONDecodeError('mock message', '{"x", "A",}', 2)
        r_mock.return_value = mock_resp

        config['COOPERATOR_LOOKUP_ENABLED'] = ['10', '15']
        cooperators = sifta.get_cooperators('12345', '20')
        assert cooperators == [], 'Expected empty response'
