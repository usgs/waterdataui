"""
Tests for the cooperator service calls.
"""

import json

from requests_mock import Mocker

from ...services.sifta import SiftaService


MOCK_RESPONSE = """
{"Site": "06864000", "Date": "6/19/2018", "Customers":[{"Name":"Kansas Water Office","URL":"http://www.kwo.org/","IconURL":"http://water.usgs.gov/customer/icons/6737.gif"},{"Name":"USGS - Cooperative Matching Funds","URL":"http://water.usgs.gov/coop/","IconURL":"http://water.usgs.gov/customer/icons/usgsIcon.gif"}]}
"""
MOCK_CUSTOMER_LIST = json.loads(MOCK_RESPONSE)['Customers']

ENDPOINT = 'https://www.fakesifta.gov/'


def test_sifta_response():
    sifta_service = SiftaService(ENDPOINT)
    with Mocker(session=sifta_service.session) as session_mock:
        session_mock.get(f'{ENDPOINT}12345', text=MOCK_RESPONSE)
        result = sifta_service.get_cooperators('12345')

        assert session_mock.call_count == 1
        assert result == MOCK_CUSTOMER_LIST, 'Expected response'


def test_sifta_handling_bad_status_code():
    sifta_service = SiftaService(ENDPOINT)
    with Mocker(session=sifta_service.session) as session_mock:
        session_mock.get(f'{ENDPOINT}12345', status_code=500)
        result = sifta_service.get_cooperators('12345')

        assert session_mock.call_count == 1
        assert result == []
