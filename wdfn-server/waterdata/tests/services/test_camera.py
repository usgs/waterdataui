"""
Tests for camera.py module
"""
import json
from unittest import mock

from ...services.camera import fetch_camera_metadata, get_monitoring_location_camera_details

MOCK_CAMERA_METADATA = """
{
    "success": true,
    "data": [{
        "_id": "5f62ebfb1bd1241518cd3db5",
        "enabled": true,
        "usgsSiteNumber": "425520078535601",
        "state": "NY",
        "cameraName": "NY-Buffalo-S1",
        "cameraDescription": "NY-Buffalo-S1",
        "imagesPath": "/ProjectsRegional/GLRI/NY-Buffalo-S1",
        "imagesBatchSize": 100,
        "fps": 10,
        "videoNameBase": "ny_buffalo_s1",
        "processingPriority": 1300,
        "createdAt": "2020-09-17T04:54:57.485Z",
        "updatedAt": "2021-01-15T14:53:20.535Z",
        "lastProcessedDateTime": "Jan 15, 2021 7:20 AM"
    }, {
        "_id": "5f62ebfb1bd1241518cd3db6",
        "enabled": true,
        "usgsSiteNumber": "425520078535601",
        "state": "NY",
        "cameraName": "NY-Buffalo-S4",
        "cameraDescription": "NY-Buffalo-S4",
        "imagesPath": "/ProjectsRegional/GLRI/NY-Buffalo-S4",
        "imagesBatchSize": 100,
        "fps": 10,
        "videoNameBase": "ny_buffalo_s4",
        "processingPriority": 1295,
        "updatedAt": "2021-01-15T14:53:20.535Z",
        "createdAt": "2020-09-17T04:55:24.464Z",
        "lastProcessedDateTime": "Jan 15, 2021 7:21 AM"
    }, {
        "_id": "5f62ebfb1bd1241518cd3db7",
        "enabled": true,
        "usgsSiteNumber": "04226000",
        "state": "NY",
        "cameraName": "NY-Keshequa",
        "cameraDescription": "NY-Keshequa Creek nr Sonyea, NY",
        "imagesPath": "/ProjectsRegional/GLRI/NY-Keshequa",
        "imagesBatchSize": 100,
        "fps": 10,
        "videoNameBase": "ny_keshequa",
        "processingPriority": 960,
        "updatedAt": "2021-01-15T14:53:20.535Z",
        "createdAt": "2020-09-17T04:56:32.989Z",
        "lastProcessedDateTime": "Jan 15, 2021 8:01 AM"
    }]
}
"""


def test_successful_fetch_camera_metadata():
    with mock.patch('waterdata.services.camera.execute_get_request') as r_mock:
        response = mock.Mock()
        response.status_code = 200
        response.text = MOCK_CAMERA_METADATA
        response.json.return_value = json.loads(MOCK_CAMERA_METADATA)
        r_mock.return_value = response
        camera_metadata = fetch_camera_metadata()
        expected_response = json.loads(MOCK_CAMERA_METADATA)

        assert camera_metadata == expected_response, 'Expected response'


def test_unsuccessful_fetch_camera_metadata():
    with mock.patch('waterdata.services.camera.execute_get_request') as r_mock:
        response = mock.Mock()
        response.status_code = 500
        r_mock.return_value = response
        camera_metadata = fetch_camera_metadata()

        assert camera_metadata == {}


def test_unparseable_json_fetch_camera_metadata():
    with mock.patch('waterdata.services.camera.execute_get_request') as r_mock:
        response = mock.Mock()
        response.status_code = 200
        response.json.side_effect = ValueError
        r_mock.return_value = response
        camera_metadata = fetch_camera_metadata()

        assert camera_metadata == {}


def test_fetching_and_returning_camera_details(config):
    if 'MONITORING_LOCATION_CAMERA_METADATA' in config:
        del config['MONITORING_LOCATION_CAMERA_METADATA']
    with mock.patch('waterdata.services.camera.execute_get_request') as r_mock:
        response = mock.Mock()
        response.status_code = 200
        response.text = MOCK_CAMERA_METADATA
        response.json.return_value = json.loads(MOCK_CAMERA_METADATA)
        r_mock.return_value = response

        details = get_monitoring_location_camera_details('04226000')
        assert r_mock.called, 'Expect to fetch data'
        assert len(details) == 1, 'Expected number of cameras'
        assert 'name' in details[0], 'Expected key'
        assert 'description' in details[0], 'Expected key'
        assert 'med_video' in details[0], 'Expected key'
        assert 'small_video' in details[0], 'Expected key'
        assert 'most_recent_image' in details[0], 'Expected key'
        assert 'details' in details[0], 'Expected key'


def test_no_fetch_existing_camera_details(config):
    config['MONITORING_LOCATION_CAMERA_METADATA'] = json.loads(MOCK_CAMERA_METADATA).get('data')
    with mock.patch('waterdata.services.camera.execute_get_request') as r_mock:
        response = mock.Mock()
        response.status_code = 200
        response.text = MOCK_CAMERA_METADATA
        response.json.return_value = json.loads(MOCK_CAMERA_METADATA)
        r_mock.return_value = response

        details = get_monitoring_location_camera_details('04226000')
        assert not r_mock.called, 'Expect to not fetch data'
        assert len(details) == 1, 'Expected number of cameras'


def test_site_no_with_more_than_one_camera(config):
    config['MONITORING_LOCATION_CAMERA_METADATA'] = json.loads(MOCK_CAMERA_METADATA).get('data')

    details = get_monitoring_location_camera_details('425520078535601')
    assert len(details) == 2, 'Expected number of cameras'


def test_site_no_with_no_cameras(config):
    config['MONITORING_LOCATION_CAMERA_METADATA'] = json.loads(MOCK_CAMERA_METADATA).get('data')

    details = get_monitoring_location_camera_details('425520078535602')
    assert not details, 'Expected number of cameras'
