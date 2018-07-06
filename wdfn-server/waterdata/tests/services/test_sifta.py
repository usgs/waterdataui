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


@pytest.fixture(scope='module', autouse=True)
def mock_request():
    """Return mock response on all GET requests"""
    with requests_mock.mock() as req:
        req.get(requests_mock.ANY, text=MOCK_RESPONSE)
        yield


def test_sifta_response(config):
    config['COOPERATOR_LOOKUP_ENABLED'] = True
    cooperators = sifta.get_cooperators('12345', 'district code ignored')
    assert cooperators == MOCK_CUSTOMER_LIST, 'Expected response'


def test_sifta_disabled(config):
    config['COOPERATOR_LOOKUP_ENABLED'] = False
    cooperators = sifta.get_cooperators('12345', 'district code ignored')
    assert cooperators == [], 'Expected empty response'


def test_sifta_district_enabled(config):
    config['COOPERATOR_LOOKUP_ENABLED'] = ['10', '15']
    cooperators = sifta.get_cooperators('12345', '10')
    assert cooperators == MOCK_CUSTOMER_LIST, 'Expected response'


def test_sifta_district_disabled(config):
    config['COOPERATOR_LOOKUP_ENABLED'] = ['10', '15']
    cooperators = sifta.get_cooperators('12345', '20')
    assert cooperators == [], 'Expected empty response'
