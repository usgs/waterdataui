import config from 'ui/config';
import {MOCK_OBSERVATION_ITEM} from 'ui/mock-service-data';

import {fetchAvailableDVTimeSeries, fetchDVTimeSeries, fetchNetworkMonitoringLocations,
    fetchMonitoringLocationMetaData} from './observations';

describe('web-services/observations module', () => {
    /* eslint no-use-before-define: off */
    beforeEach(() => {
        jasmine.Ajax.install();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
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
            const url = jasmine.Ajax.requests.mostRecent().url;

            expect(url).toContain(networkCd);
            expect(url.split('?')[1]).toEqual('f=json');
        });

        it('Expect url to contain query parameters', () => {
            networkPromise = fetchNetworkMonitoringLocations(networkCd, {active: true, agencyCode: 'USGS'});
            const url = jasmine.Ajax.requests.mostRecent().url;
            const queryString = url.split('?')[1];

            expect(url).toContain(networkCd);
            expect(queryString).toContain('active=true');
            expect(queryString).toContain('agencyCode=USGS');
            expect(queryString).toContain('f=json');
            expect(queryString.split('&').length).toBe(3);
        });

        it('expected response is json object with the network sites', () => {
            networkPromise = fetchNetworkMonitoringLocations(networkCd );
            jasmine.Ajax.stubRequest(`${config.OBSERVATIONS_ENDPOINT}/${networkCd}/items`).andReturn({
                status: 200,
                responseText: MOCK_NETWORK_FEATURE,
                contentType: 'application/json'
            });
            networkPromise.then((resp) => {
                expect(resp.length).toBe(1);
                expect(resp).toEqual(JSON.parse(MOCK_NETWORK_FEATURE).features);
            });
        });
    });

    describe('fetchAvailableDVTimeSeries', () => {
        it('Expects ths url to contain monitoringLocationId', () => {
            fetchAvailableDVTimeSeries('USGS-1234567890');
            expect(jasmine.Ajax.requests.mostRecent().url).toContain('USGS-1234567890');
        });

        it('Expects json response with a valid response', (done) => {
            fetchAvailableDVTimeSeries('USGS-1234567890')
                .then((resp) => {
                    expect(resp).toBeInstanceOf(Object);
                    expect(resp.timeSeries).toBeDefined;
                    expect(resp.timeSeries.length).toBe(1);

                    done();
                });
            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                responseText: VALID_AVAILABLE_STATS_RESPONSE,
                contentType: 'application/json'
            });
        });

        it('Expect empty object with an bad response', (done) => {
            fetchAvailableDVTimeSeries('USGS-1234567890')
                .then((resp) => {
                    expect(resp).toBeInstanceOf(Object);
                    expect(resp).toEqual({});
                    done();
                });
            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 500
            });
        });
    });

    describe('fetchStatisticalTimeSeries', () => {
        it('Expects the url to contain monitoringLocationId and time series id', () => {
            fetchDVTimeSeries('USGS-1234567890', '12345670abcdef');
            const url = jasmine.Ajax.requests.mostRecent().url;
            expect(url).toContain('USGS-1234567890');
            expect(url).toContain('12345670abcdef');
        });

        it('Expect json response with a valid response', (done) => {
            fetchDVTimeSeries('USGS-1234567890', '12345670abcdef')
                .then((resp) => {
                    expect(resp).toBeInstanceOf(Object);
                    expect(resp.properties).toBeDefined;
                    expect(resp.properties.timeStep).toEqual(['2013-10-02', '2013-10-03', '2013-10-04']);

                    done();
                });
            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                responseText: VALID_STATS_RESPONSE,
                contentType: 'application/json'
            });
        });

        it('Expect empty object with an bad response', (done) => {
            fetchDVTimeSeries('1234567890', '12345670abcdef')
                .then((resp) => {
                    expect(resp).toBeInstanceOf(Object);
                    expect(resp).toEqual({});
                    done();
                });
            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 500
            });
        });
    });

    describe('fetchObservationItem', () => {
        it('Expects the url to contain monitoringLocationId and time series id', () => {
            fetchMonitoringLocationMetaData('USGS-1234567890');
            const url = jasmine.Ajax.requests.mostRecent().url;
            expect(url).toContain('USGS-1234567890');
        });

        it('Expect json response with a valid response', (done) => {
            fetchMonitoringLocationMetaData('USGS-1234567890')
                .then((resp) => {
                    expect(resp).toBeInstanceOf(Object);
                    expect(resp.properties).toBeDefined;
                    expect(resp.links.length).toEqual(6);

                    done();
                });
            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                responseText: MOCK_OBSERVATION_ITEM,
                contentType: 'application/json'
            });
        });

        it('Expect empty object with an bad response', (done) => {
            fetchMonitoringLocationMetaData('1234567890')
                .then((resp) => {
                    expect(resp).toBeInstanceOf(Object);
                    expect(resp).toEqual({});
                    done();
                });
            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 500
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