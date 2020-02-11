import {fetchTimeSeries} from './observations';

describe('web-services/observations module', () => {
    /* eslint no-use-before-define: off */
    beforeEach(() => {
        jasmine.Ajax.install();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
    });

    describe('fetchTimeSeries', () => {

        it('Expect json response with a valid response', (done) => {

            fetchTimeSeries('1234567890', '12345670abcdef')
                .then((resp) => {
                    expect(resp).toBeInstanceOf(Object);
                    expect(resp.properties).toBeDefined;
                    expect(resp.properties.timeStep).toEqual(['2013-10-02', '2013-10-03', '2013-10-04']);
                    done();
                });
            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                responseText: VALID_RESPONSE,
                contentType: 'application/json'
            });
        });

        it('Expect empty object with an bad response', (done) => {
            fetchTimeSeries('1234567890', '12345670abcdef')
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

const VALID_RESPONSE = `{
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