"""
Tests for the cooperator service calls.
"""

import json
from unittest import mock

from requests_mock import Mocker

from ...services.ogc import MonitoringLocationNetworkService
from ..mock_test_data import MOCK_NETWORKS_RESPONSE, MOCK_NETWORK_RESPONSE

ENDPOINT = 'https://www.fakemlogc.gov/api/'


def test_ogc_response_with_network_cd():
    network_service = MonitoringLocationNetworkService(ENDPOINT)
    with Mocker(session=network_service.session) as session_mock:
        session_mock.get(f'{ENDPOINT}monitoring-locations', text=MOCK_NETWORK_RESPONSE)
        result = network_service.get_networks('monitoring-locations')

        assert session_mock.call_count == 1
        assert session_mock.request_history[0].query == 'f=json'
        assert result == json.loads(MOCK_NETWORK_RESPONSE)


def test_ogc_response_with_no_network_cd():
    network_service = MonitoringLocationNetworkService(ENDPOINT)
    with Mocker(session=network_service.session) as session_mock:
        session_mock.get(ENDPOINT, text=MOCK_NETWORKS_RESPONSE)
        networks = network_service.get_networks()

        assert session_mock.call_count == 1
        assert session_mock.request_history[0].query == 'f=json'
        assert networks == json.loads(MOCK_NETWORKS_RESPONSE), 'Expected response'


def test_ogc_handling_bad_status_code():
    network_service = MonitoringLocationNetworkService(ENDPOINT)
    with Mocker(session=network_service.session) as session_mock:
        session_mock.get(ENDPOINT, status_code=404)
        networks = network_service.get_networks()

        assert session_mock.call_count == 1
        assert session_mock.request_history[0].query == 'f=json'
        assert networks == {}, 'Expected response'


def test_invalid_json():
    network_service = MonitoringLocationNetworkService(ENDPOINT)
    with Mocker(session=network_service.session) as session_mock:
        session_mock.get(ENDPOINT, status_code=200, text='{"x", "A",}')
        networks = network_service.get_networks()

        assert session_mock.call_count == 1
        assert session_mock.request_history[0].query == 'f=json'
        assert networks == {}, 'Expected empty response'
