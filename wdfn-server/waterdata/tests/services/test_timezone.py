"""
Tests for timezone module
"""
import json
from unittest import mock

from ...services.timezone import get_iana_time_zone

MOCK_RESPONSE = """
{"id": "https://api.weather.gov/points/38.9498,-77.1276",
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [
            -77.127600000000001,
            38.949800000000003
        ]
    },
    "properties": {
        "@id": "https://api.weather.gov/points/38.9498,-77.1276",
        "@type": "wx:Point",
        "cwa": "LWX",
        "forecastOffice": "https://api.weather.gov/offices/LWX",
        "gridId": "LWX",
        "gridX": 92,
        "gridY": 72,
        "forecast": "https://api.weather.gov/gridpoints/LWX/92,72/forecast",
        "forecastHourly": "https://api.weather.gov/gridpoints/LWX/92,72/forecast/hourly",
        "forecastGridData": "https://api.weather.gov/gridpoints/LWX/92,72",
        "observationStations": "https://api.weather.gov/gridpoints/LWX/92,72/stations",
        "relativeLocation": {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -77.129442999999995,
                    38.954484000000001
                ]
            },
            "properties": {
                "city": "Brookmont",
                "state": "MD",
                "distance": {
                    "value": 544.67498026369003,
                    "unitCode": "unit:m"
                },
                "bearing": {
                    "value": 162,
                    "unitCode": "unit:degrees_true"
                }
            }
        },
        "forecastZone": "https://api.weather.gov/zones/forecast/MDZ504",
        "county": "https://api.weather.gov/zones/county/MDC031",
        "fireWeatherZone": "https://api.weather.gov/zones/fire/MDZ504",
        "timeZone": "America/New_York",
        "radarStation": "KLWX"
    }
}
"""


def test_good_weather_service_response():
    with mock.patch('waterdata.services.timezone.execute_get_request') as r_mock:
        response = mock.Mock()
        response.status_code = 200
        response.text = MOCK_RESPONSE
        response.json.return_value = json.loads(MOCK_RESPONSE)
        r_mock.return_value = response

        timezone = get_iana_time_zone('45.0', '-100.0')
        r_mock.assert_called_once()
        assert r_mock.call_args[0][1] == 'points/45.0,-100.0'
        assert timezone == 'America/New_York'


def test_bad_weather_service_response():
    with mock.patch('waterdata.services.timezone.execute_get_request') as r_mock:
        response = mock.Mock()
        response.status_code = 500
        r_mock.return_value = response

        timezone = get_iana_time_zone('46.0', '-110.0')
        r_mock.assert_called_once()
        assert r_mock.call_args[0][1] == 'points/46.0,-110.0'
        assert timezone is None
