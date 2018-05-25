const FloodDataInjector = require('inject-loader!./floodData');

describe('flood_data module', () => {

    describe('fetchFloodFeatures', () => {
        let ajaxMock;
        let floodData;

        const siteno = '12345678';

        describe('with valid response', () => {

            beforeEach(() => {
                /* eslint no-use-before-define: 0 */
                let getPromise = Promise.resolve(MOCK_FLOOD_FEATURE);
                ajaxMock = {
                    get: function () {
                        return getPromise;
                    }
                };
                spyOn(ajaxMock, 'get').and.callThrough();
                floodData = FloodDataInjector({'./ajax': ajaxMock});
            });

            it('url contains the siteno', () => {
                floodData.fetchFloodFeatures(siteno);

                expect(ajaxMock.get).toHaveBeenCalled();
                expect(ajaxMock.get.calls.mostRecent().args[0]).toContain(siteno);
            });

            it('expected response is json object with the stages', () => {
                floodData.fetchFloodFeatures(siteno).then((resp) => {
                    expect(resp.length).toBe(3);
                    expect(resp[0].attributes.STAGE).toBe(30);
                    expect(resp[1].attributes.STAGE).toBe(29);
                    expect(resp[2].attributes.STAGE).toBe(28);
                });
            });
        });

        describe('with error response', () =>{
            beforeEach(() => {
                let getPromise = Promise.reject(new Error('fail'));
                ajaxMock = {
                    get: function () {
                        return getPromise;
                    }
                };
                floodData = FloodDataInjector({'./ajax': ajaxMock});
            });

            it('On failed response return an empty feature list', () => {
               floodData.fetchFloodFeatures(siteno).then((resp) => {
                   expect(resp.length).toBe(0);
               });
            });
        });
    });

    describe('fetchFloodExtent', () => {
        let ajaxMock;
        let floodData;

        const siteno = '12345678';

        describe('with valid response', () => {

            beforeEach(() => {
                /* eslint no-use-before-define: 0 */
                let getPromise = Promise.resolve(MOCK_FLOOD_EXTENT);
                ajaxMock = {
                    get: function () {
                        return getPromise;
                    }
                };
                spyOn(ajaxMock, 'get').and.callThrough();
                floodData = FloodDataInjector({'./ajax': ajaxMock});
            });

            it('url contains the siteno', () => {
                floodData.fetchFloodExtent(siteno);

                expect(ajaxMock.get).toHaveBeenCalled();
                expect(ajaxMock.get.calls.mostRecent().args[0]).toContain(siteno);
            });

            it('expected response is json object with the extent', () => {
                floodData.fetchFloodExtent(siteno).then((resp) => {
                    expect(resp.extent).toBeDefined();
                    expect(resp.extent.xmin).toBe(-84.353211731250525);
                    expect(resp.extent.xmax).toBe(-84.223456338038901);
                    expect(resp.extent.ymin).toBe(34.016663666167332);
                    expect(resp.extent.ymax).toBe(34.100999075364072);
                });
            });
        });

        describe('with error response', () =>{
            beforeEach(() => {
                let getPromise = Promise.reject(new Error('fail'));
                ajaxMock = {
                    get: function () {
                        return getPromise;
                    }
                };
                floodData = FloodDataInjector({'./ajax': ajaxMock});
            });

            it('On failed response return an empty feature list', () => {
               floodData.fetchFloodExtent(siteno).then((resp) => {
                   expect(resp).toEqual({});
               });
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
