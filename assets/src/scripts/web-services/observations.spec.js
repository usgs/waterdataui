import {fetchAvailableDVTimeSeries, fetchDVTimeSeries,
    fetchMonitoringLocationMetaData} from './observations';
import {MOCK_OBSERVATION_ITEM} from 'ui/mock-service-data';

describe('web-services/observations module', () => {
    /* eslint no-use-before-define: off */
    beforeEach(() => {
        jasmine.Ajax.install();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
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