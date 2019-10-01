"""
Tests for the cooperator service calls.
"""

import json

import pytest
import requests_mock

from waterdata.services import sifta


MOCK_RESPONSE = """
{"Site": "06864000", "Date": "6/19/2018", "Customers":[{"Name":"Kansas Water Office","URL":"http://www.kwo.org/","IconURL":"http://water.usgs.gov/customer/icons/6737.gif"},{"Name":"USGS - Cooperative Matching Funds","URL":"http://water.usgs.gov/coop/","IconURL":"http://water.usgs.gov/customer/icons/usgsIcon.gif"}]}
"""
MOCK_CUSTOMER_LIST = json.loads(MOCK_RESPONSE)['Customers']


@pytest.fixture(scope='module')
def mock_request():
    """Return mock response on all GET requests"""
    with requests_mock.mock() as req:
        req.get(requests_mock.ANY, text=MOCK_RESPONSE)
        yield


@pytest.fixture(scope='module')
def mock_bad_request():
    """
    Mock response with invalid JSON.

    """
    with requests_mock.mock() as req:
        req.get(requests_mock.ANY, exc=json.JSONDecodeError)


@pytest.mark.usefixtures('mock_request')
def test_sifta_response(config):
    config['COOPERATOR_LOOKUP_ENABLED'] = True
    cooperators = sifta.get_cooperators('12345', 'district code ignored')
    assert cooperators == MOCK_CUSTOMER_LIST, 'Expected response'


@pytest.mark.usefixtures('mock_request')
def test_sifta_disabled(config):
    config['COOPERATOR_LOOKUP_ENABLED'] = False
    cooperators = sifta.get_cooperators('12345', 'district code ignored')
    assert cooperators == [], 'Expected empty response'


@pytest.mark.usefixtures('mock_request')
def test_sifta_district_enabled(config):
    config['COOPERATOR_LOOKUP_ENABLED'] = ['10', '15']
    cooperators = sifta.get_cooperators('12345', '10')
    assert cooperators == MOCK_CUSTOMER_LIST, 'Expected response'


@pytest.mark.usefixtures('mock_request')
def test_sifta_district_disabled(config):
    config['COOPERATOR_LOOKUP_ENABLED'] = ['10', '15']
    cooperators = sifta.get_cooperators('12345', '20')
    assert cooperators == [], 'Expected empty response'


@pytest.mark.usefixtures('mock_bad_request')
def test_unparsable_json(config):
    config['COOPERATOR_LOOKUP_ENABLED'] = ['10', '15']
    cooperators = sifta.get_cooperators('12345', '20')
    assert cooperators == [], 'Expected empty response'
