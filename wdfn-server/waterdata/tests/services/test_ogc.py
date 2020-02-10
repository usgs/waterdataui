"""
Tests for the cooperator service calls.
"""

import json
from unittest import mock

from waterdata.services import ogc

MOCK_RESPONSE = """
{"id": "monitoring-locations","itemType": "feature","title": "NWIS Monitoring Locations","description": "USGS water monitoring locations managed in the National Water Information System"}
"""
MOCK_NETWORK_LIST = json.loads(MOCK_RESPONSE)


def test_ogc_response():
    with mock.patch('waterdata.services.ogc.execute_get_request') as r_mock:
        response = mock.Mock()
        response.status_code = 200
        response.text = MOCK_RESPONSE
        response.json.return_value = json.loads(MOCK_RESPONSE)
        r_mock.return_value = response

        networks = ogc.get_networks('monitoring-locations')
        assert networks == MOCK_NETWORK_LIST, 'Expected response'


def test_ogc_handling_bad_status_code():
    with mock.patch('waterdata.services.ogc.execute_get_request') as r_mock:
        response = mock.Mock()
        response.status_code = 500
        r_mock.return_value = response

        networks = ogc.get_networks('invalid-network')
        assert networks == [], 'Expected response'


def test_unparsable_json():
    with mock.patch('waterdata.services.ogc.execute_get_request') as r_mock:
        mock_resp = mock.Mock()
        mock_resp.status_code = 200
        mock_resp.json.side_effect = json.JSONDecodeError('mock message', '{"x", "A",}', 2)
        r_mock.return_value = mock_resp

        networks = ogc.get_networks()
        assert networks == [], 'Expected empty response'
