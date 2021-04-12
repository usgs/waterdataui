"""
Tests for timezone module
"""
from requests_mock import Mocker

from ...services.timezone import TimeZoneService

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

ENDPOINT = 'https://www.fakeapi.gov'


def test_good_weather_service_response():
    time_zone_service = TimeZoneService(ENDPOINT)
    with Mocker(session=time_zone_service.session) as session_mock:
        session_mock.get(f'{ENDPOINT}/points/45.0,-100.0', text=MOCK_RESPONSE)
        result = time_zone_service.get_iana_time_zone('45.0', '-100.0')

        assert session_mock.call_count == 1
        assert result == 'America/New_York'


def test_bad_weather_service_response():
    time_zone_service = TimeZoneService(ENDPOINT)
    with Mocker(session=time_zone_service.session) as session_mock:
        session_mock.get(f'{ENDPOINT}/points/46.0,-110.0', status_code=500)

        result = time_zone_service.get_iana_time_zone('46.0', '-110.0')
        assert session_mock.call_count == 1
        assert result is None
