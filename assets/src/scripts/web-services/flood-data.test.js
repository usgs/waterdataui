import sinon from 'sinon';

import {MOCK_WATERWATCH_FLOOD_LEVELS} from 'ui/mock-service-data';

import {fetchFIMPublicStatus, fetchFloodExtent, fetchFloodFeatures,
    fetchWaterwatchFloodLevels} from './flood-data';


describe('flood_data module', () => {
    let fakeServer;
    beforeEach(() => {
        fakeServer = sinon.createFakeServer();
    });

    afterEach(() => {
        fakeServer.restore();
    });

    describe('web-services/fetchFIMPublicStatus', () => {
        const siteno = '12345678';
        describe('with valid response', () => {
            let promise;

            it('expected response is true', (done) => {
                promise = fetchFIMPublicStatus(siteno);
                fakeServer.requests[0].respond(
                    200,
                    {'Content-Type': 'application/json'},
                    `{
                        "features" :[{
                            "attributes": {
                                "Public": 1,
                                "SITE_NO": "12345678"
                            }
                        }]
                    }`
                );

                promise.then((resp) => {
                    expect(resp).toBeTruthy();
                    done();
                });
            });

            it('expected response is False', (done) => {
                promise = fetchFIMPublicStatus(siteno);
                fakeServer.requests[0].respond(
                    200,
                    {
                        'Content-Type': 'appliation/json'
                    },
                    `{
                        "features": [{
                            "attributes": {
                                "Public": 0,
                                "SITE_NO": "12345678"
                            }
                        }]
                    }`
                );

                promise.then((resp) => {
                    expect(resp).toBeFalsy();
                    done();
                });
            });
        });

        describe('with error response', () => {
            it('On failed response return false', (done) => {
                fetchFIMPublicStatus(siteno).then((resp) => {
                   expect(resp).toBeFalsy();
                   done();
                });
                fakeServer.requests[0].respond(500);
            });
        });
    });

    describe('fetchFloodFeatures', () => {
        const siteno = '12345678';

        describe('with valid response', () => {
            let promise;

            beforeEach(() => {
                /* eslint no-use-before-define: 0 */
                promise = fetchFloodFeatures(siteno);
                fakeServer.requests[0].respond(
                    200,
                    {
                        'Content-Type': 'application/json'
                    },
                    MOCK_FLOOD_FEATURE
                );
            });

            it('expected response is json object with the stages', () => {
                promise.then((resp) => {
                    expect(resp.length).toBe(3);
                    expect(resp[0].attributes.STAGE).toBe(30);
                    expect(resp[1].attributes.STAGE).toBe(29);
                    expect(resp[2].attributes.STAGE).toBe(28);
                });
            });
        });

        describe('with error response', () => {
            it('On failed response return an empty feature list', () => {
                fetchFloodFeatures(siteno).then((resp) => {
                   expect(resp.length).toBe(0);
                });
                fakeServer.requests[0].respond(500);
            });
        });
    });

    describe('web-services/fetchFloodExtent', () => {
        let promise;
        const siteno = '12345678';

        describe('with valid response', () => {

            beforeEach(() => {
                /* eslint no-use-before-define: 0 */
                promise = fetchFloodExtent(siteno);
                fakeServer.requests[0].respond(
                    200,
                    {
                        'Content-Type': 'application/json'
                    },
                    MOCK_FLOOD_EXTENT
                );
            });

            it('expected response is json object with the extent', () => {
                promise.then((resp) => {
                    expect(resp.extent).toBeDefined();
                    expect(resp.extent.xmin).toBe(-84.353211731250525);
                    expect(resp.extent.xmax).toBe(-84.223456338038901);
                    expect(resp.extent.ymin).toBe(34.016663666167332);
                    expect(resp.extent.ymax).toBe(34.100999075364072);
                });
            });
        });

        describe('with error response', () => {
            beforeEach(() => {
                /* eslint no-use-before-define: 0 */
                promise = fetchFloodExtent(siteno);
                fakeServer.requests[0].respond(500);
            });

            it('On failed response return an empty feature list', () => {
               promise.then((resp) => {
                   expect(resp).toEqual({});
               });
            });
        });
    });

    describe('web-services/fetchWaterwatchFloodLevels', () => {
        let floodLevelPromise;
        const siteno = '07144100';

        describe('with valid response', () => {

            beforeEach(() => {
                /* eslint no-use-before-define: 0 */

                floodLevelPromise = fetchWaterwatchFloodLevels(siteno);

                fakeServer.requests[0].respond(
                    200,
                    {
                        'Content-Type': 'application/json'
                    },
                    MOCK_WATERWATCH_FLOOD_LEVELS
                );
            });

            it('expected response is json object with the flood levels', () => {
                floodLevelPromise.then((resp) => {
                    expect(resp).not.toEqual(null);
                    expect(resp.site_no).toBe('07144100');
                });
            });
        });

        describe('with error response', () => {
            it('On failed response return an empty flood levels list', () => {
                fetchWaterwatchFloodLevels(siteno).then((resp) => {
                    expect(resp).toBeNull();
                });
                fakeServer.requests[0].respond(500, {}, 'Error');
            });
        });
    });
});

const MOCK_FLOOD_FEATURE = `
{
	"displayFieldName": "USGSID",
	"fieldAliases": {
		"USGSID": "USGSID",
		"STAGE": "STAGE"
	},
	"fields": [{
		"name": "USGSID",
		"type": "esriFieldTypeString",
		"alias": "USGSID",
		"length": 254
	}, {
		"name": "STAGE",
		"type": "esriFieldTypeDouble",
		"alias": "STAGE"
	}],
	"features": [{
		"attributes": {
			"USGSID": "03341500",
			"STAGE": 30
		}
	}, {
		"attributes": {
			"USGSID": "03341500",
			"STAGE": 29
		}
	}, {
		"attributes": {
			"USGSID": "03341500",
			"STAGE": 28
		}
	}]
}
`;

const MOCK_FLOOD_EXTENT = `
{
	"extent": {
		"xmin": -84.353211731250525,
		"ymin": 34.016663666167332,
		"xmax": -84.223456338038901,
		"ymax": 34.100999075364072,
		"spatialReference": {
			"wkid": 4326,
			"latestWkid": 4326
		}
	}
}
`;
