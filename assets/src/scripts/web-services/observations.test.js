import sinon from 'sinon';

import config from 'ui/config';
import {MOCK_OBSERVATION_ITEM} from 'ui/mock-service-data';

import {fetchAvailableDVTimeSeries, fetchDVTimeSeries, fetchNetworkMonitoringLocations,
    fetchMonitoringLocationMetaData} from './observations';

describe('web-services/observations module', () => {
    /* eslint no-use-before-define: off */
    let fakeServer;

    beforeEach(() => {
        fakeServer = sinon.createFakeServer();
    });

    afterEach(() => {
        fakeServer.restore();
    });

    describe('fetchNetworkMonitoringLocations', () => {
        const networkCd = 'AHS';
        let networkPromise;

        beforeEach(() => {
            /* eslint no-use-before-define: 0 */

            networkPromise = fetchNetworkMonitoringLocations(networkCd );
        });

        it('expect url to contain networkCd and no additional query parameters', () => {
            networkPromise = fetchNetworkMonitoringLocations(networkCd);
            const url = fakeServer.requests[0].url;

            expect(url).toContain(networkCd);
            expect(url.split('?')[1]).toEqual('f=json');
        });

        it('Expect url to contain query parameters', () => {
            fetchNetworkMonitoringLocations(networkCd, {active: true, agencyCode: 'USGS'});
            const url = fakeServer.requests[1].url;
            const queryString = url.split('?')[1];

            expect(url).toContain(networkCd);
            expect(queryString).toContain('active=true');
            expect(queryString).toContain('agencyCode=USGS');
            expect(queryString).toContain('f=json');
            expect(queryString.split('&')).toHaveLength(3);
        });

        it('expected response is json object with the network sites', () => {
            networkPromise = fetchNetworkMonitoringLocations(networkCd);
            fakeServer.requests[fakeServer.requests.length - 1].respond(
                200,
                {'Content-Type': 'application/json'},
                MOCK_NETWORK_FEATURE
            );

            return networkPromise.then((resp) => {
                expect(resp).toHaveLength(1);
                expect(resp).toEqual(JSON.parse(MOCK_NETWORK_FEATURE).features);
            });
        });
    });

    describe('fetchAvailableDVTimeSeries', () => {
        it('Expects ths url to contain monitoringLocationId', () => {
            fetchAvailableDVTimeSeries('USGS-1234567890');
            expect(fakeServer.requests[0].url).toContain('USGS-1234567890');
        });

        it('Expects json response with a valid response', () => {
            const fetchPromise = fetchAvailableDVTimeSeries('USGS-1234567890');
            fakeServer.requests[0].respond(
                200,
                {'Content-Type': 'application/json'},
                VALID_AVAILABLE_STATS_RESPONSE
            );
            return fetchPromise
                .then((resp) => {
                    expect(resp).toBeInstanceOf(Object);
                    expect(resp.timeSeries).toBeDefined();
                    expect(resp.timeSeries).toHaveLength(1);
                });

        });

        it('Expect empty object with an bad response', () => {
            const fetchPromise = fetchAvailableDVTimeSeries('USGS-1234567890');
            fakeServer.requests[0].respond(500);
            return fetchPromise
                .then((resp) => {
                    expect(resp).toBeInstanceOf(Object);
                    expect(resp).toEqual({});
                });
        });
    });

    describe('fetchStatisticalTimeSeries', () => {
        it('Expects the url to contain monitoringLocationId and time series id', () => {
            fetchDVTimeSeries('USGS-1234567890', '12345670abcdef');
            const url = fakeServer.requests[0].url;
            expect(url).toContain('USGS-1234567890');
            expect(url).toContain('12345670abcdef');
        });

        it('Expect json response with a valid response', () => {
            const fetchPromise = fetchDVTimeSeries('USGS-1234567890', '12345670abcdef');
            fakeServer.requests[0].respond(
                200,
                {'Content-Type': 'application/json'},
                VALID_STATS_RESPONSE
            );
            return fetchPromise.then((resp) => {
                    expect(resp).toBeInstanceOf(Object);
                    expect(resp.properties).toBeDefined();
                    expect(resp.properties.timeStep).toEqual(['2013-10-02', '2013-10-03', '2013-10-04']);
                });

        });

        it('Expect empty object with an bad response', () => {
            const fetchPromise = fetchDVTimeSeries('1234567890', '12345670abcdef');
            fakeServer.requests[0].respond(500);
            return fetchPromise
                .then((resp) => {
                    expect(resp).toBeInstanceOf(Object);
                    expect(resp).toEqual({});
                });
        });
    });

    describe('fetchObservationItem', () => {
        it('Expects the url to contain monitoringLocationId and time series id', () => {
            fetchMonitoringLocationMetaData('USGS-1234567890');
            const url = fakeServer.requests[0].url;
            expect(url).toContain('USGS-1234567890');
        });

        it('Expect json response with a valid response', () => {
            const fetchPromise = fetchMonitoringLocationMetaData('USGS-1234567890');
            fakeServer.requests[0].respond(
                200,
                {'Content-Type': 'application/json'},
                MOCK_OBSERVATION_ITEM
            );
            return fetchPromise
                .then((resp) => {
                    expect(resp).toBeInstanceOf(Object);
                    expect(resp.properties).toBeDefined();
                    expect(resp.links).toHaveLength(6);
                });

        });

        it('Expect empty object with an bad response', () => {
            const fetchPromise = fetchMonitoringLocationMetaData('1234567890');
            fakeServer.requests[0].respond(500);
            return fetchPromise
                .then((resp) => {
                    expect(resp).toBeInstanceOf(Object);
                    expect(resp).toEqual({});
                });
        });
    });
});

const MOCK_NETWORK_FEATURE = `
{
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "id": "USGS-343048093030401",
        "geometry": {
            "type": "Point",
            "coordinates": [
            -93.0511417,
            34.513375]
            },
        "properties": {
            "agency": "U.S. Geological Survey",
            "monitoringLocationNumber": "343048093030401",
            "monitoringLocationName": "02S19W33CBD1 Hot Springs",
            "monitoringLocationType": "Well",
            "district": "Arkansas",
            "state": "Arkansas",
            "county": "Garland County",
            "country": "US",
            "monitoringLocationAltitudeLandSurface": "749",
            "altitudeMethod": "Interpolated from Digital Elevation Model",
            "altitudeAccuracy": "4.3",
            "altitudeDatum": "North American Vertical Datum of 1988",
            "nationalAquifer": "Other aquifers",
            "localAquifer": "Hot Springs Sandstone",
            "localAquiferType": "Unconfined single aquifer",
            "wellDepth": "336.5",
            "holeDepth": "336.5",
            "holeDepthSource": "L",
            "agencyCode": "USGS",
            "districtCode": "05",
            "stateFIPS": "US:05",
            "countyFIPS": "US:05:051",
            "countryFIPS": "US",
            "hydrologicUnit": "080401010804",
            "monitoringLocationUrl": "https://waterdata.usgs.gov/monitoring-location/343048093030401"
        },
        "links": [
            {
                "rel": "self",
                "type": "application/geo+json",
                "title": "This document as GeoJSON",
                "href": "https://labs.waterdata.usgs.gov/api/observations/collections/AHS/items/USGS-343048093030401?f=json"
            },
            {
            "rel": "collection",
            "type": "application/json",
            "title": "Arkansas Hot Springs National Park Network",
            "href": "https://labs.waterdata.usgs.gov/api/observations/collections/AHS?f=json"
        }]
    }]
}
`
;

const VALID_AVAILABLE_STATS_RESPONSE = `
{
  "type": "Feature",
  "id": "USGS-07227448",
  "geometry": {
    "type": "Point",
    "coordinates": [
      0
    ]
  },
  "properties": {
    "samplingFeatureName": "Yahara River at Main St."
  },
  "timeSeries": [
    {
      "statisticCode": "00002",
      "parameterCode": "72019",
      "url": "string",
      "description": "Depth to water level, ft below land surface, daily maximum",
      "id": "AGENCY-FEATURE-TIMESERIES"
    }
  ]
}`;

const VALID_STATS_RESPONSE = `{
    "type": "Feature",
    "id": "USGS-123456789",
    "geometry": {
        "type": "Point",
        "coordinates": [
            -72.0591667,
            41.7110166
        ]
    },
    "properties": {
        "observationType": "MeasureTimeseriesObservation",
        "phenomenonTimeStart": "2013-10-02",
        "phenomenonTimeEnd": "2013-10-04",
        "observedPropertyName": "Water level, depth LSD",
        "observedPropertyReference": null,
        "samplingFeatureName": "CT-SC    22 SCOTLAND",
        "statistic": null,
        "statisticReference": null,
        "timeStep": [
            "2013-10-02",
            "2013-10-03",
            "2013-10-04"
        ],
        "unitOfMeasureName": "ft",
        "unitOfMeasureReference": null,
        "result": [
            "1.2",
            "2.5",
            "1.8"
        ],
        "nilReason": [
            null,
            null,
            null
        ],
        "approvals": [
            ["Approved"],
            ["Approved"],
            ["Approved"]
        ],
        "qualifiers": [
            null,
            null,
            null
        ],
        "grades": [
            ["50"],
            ["60"],
            ["50"]
        ]
    }
}`;
