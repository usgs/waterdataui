import {applyMiddleware, combineReducers, createStore} from 'redux';
import {default as thunk} from 'redux-thunk';

import {MOCK_WATERWATCH_FLOOD_LEVELS} from 'ui/mock-service-data';

import {Actions, floodDataReducer, floodStateReducer} from 'ml/store/flood-inundation';

describe('monitoriing-location/store/flood-inundation module', () => {
    /* eslint no-use-before-define: 0 */
    let store;

    beforeEach(() => {
        store = createStore(
            combineReducers({
                floodData: floodDataReducer,
                floodState: floodStateReducer
            }),
            {
                floodData: {},
                floodState: {}
            },
            applyMiddleware(thunk)
        );
        jasmine.Ajax.install();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
    });

    describe('floodDataReducer', () => {
        describe('Actions.setFloodFeatures', () => {
            it('Updates the flood features', () => {
                store.dispatch(Actions.setFloodFeatures([1, 2, 3], {
                    xmin: -87.46671436884024,
                    ymin: 39.434393043085194,
                    xmax: -87.40838667928894,
                    ymax: 39.514453931168774
                }));
                const floodData = store.getState().floodData;

                expect(floodData.stages).toEqual([1, 2, 3]);
                expect(floodData.extent).toEqual({
                    xmin: -87.46671436884024,
                    ymin: 39.434393043085194,
                    xmax: -87.40838667928894,
                    ymax: 39.514453931168774
                });
            });
        });

        describe('Actions.retrieveFloodData', () => {
            it('Expects features and extents ajax calls are made', () => {
                store.dispatch(Actions.retrieveFloodData('1234567'));

                expect(jasmine.Ajax.requests.count()).toBe(2);
                const req1 = jasmine.Ajax.requests.at(0);
                const req2 = jasmine.Ajax.requests.at(1);

                expect(req1.url).toContain('1234567');
                expect(req2.url).toContain('1234567');

                expect(req1.url).toContain('outFields=USGSID%2C+STAGE');
                expect(req2.url).toContain('returnExtentOnly=true');
            });

            it('Expects successful ajax calls to populate the store', (done) => {
                let promise = store.dispatch(Actions.retrieveFloodData('1234567'));
                jasmine.Ajax.requests.at(0).respondWith({
                    status: 200,
                    responseText: MOCK_STAGES
                });
                jasmine.Ajax.requests.at(1).respondWith({
                    status: 200,
                    responseText: MOCK_EXTENT
                });

                promise.then(() => {
                    const floodData = store.getState().floodData;

                    expect(floodData.stages).toEqual([28, 29, 30]);
                    expect(floodData.extent).toEqual(JSON.parse(MOCK_EXTENT).extent);
                    done();
                });
            });

            it('Expects a failed stages call to not populate stages', (done) => {
                let promise = store.dispatch(Actions.retrieveFloodData('1234567'));
                jasmine.Ajax.requests.at(0).respondWith({
                    status: 500,
                    responseText: 'Internal server error'
                });
                jasmine.Ajax.requests.at(1).respondWith({
                    status: 200,
                    responseText: MOCK_EXTENT
                });

                promise.then(() => {
                    const floodData = store.getState().floodData;

                    expect(floodData.stages).toEqual([]);
                    expect(floodData.extent).toEqual(JSON.parse(MOCK_EXTENT).extent);
                    done();
                });
            });
        });

        it('Expects a failed extent call to not populate extent', (done) => {
            let promise = store.dispatch(Actions.retrieveFloodData('1234567'));
            jasmine.Ajax.requests.at(0).respondWith({
                status: 200,
                responseText: MOCK_STAGES
            });
            jasmine.Ajax.requests.at(1).respondWith({
                status: 500,
                responseText: 'Server error'
            });

            promise.then(() => {
                const floodData = store.getState().floodData;

                expect(floodData.stages).toEqual([28, 29, 30]);
                expect(floodData.extent).toEqual({});
                done();
            });
        });

        describe('retrieveWaterwatchData', () => {
            it('Expects that fetching urls have the siteno', () => {
                store.dispatch(Actions.retrieveWaterwatchData('12345678'));

                expect(jasmine.Ajax.requests.count()).toBe(1);
                expect(jasmine.Ajax.requests.at(0).url).toContain('12345678');
            });

            it('Expects the store to be updated on successful fetches', (done) => {
                const promise = store.dispatch(Actions.retrieveWaterwatchData('12345678'));

                jasmine.Ajax.requests.at(0).respondWith({
                    status: 200,
                    responseText: MOCK_WATERWATCH_FLOOD_LEVELS
                });

                promise.then(() => {
                    const waterwatchData = store.getState().floodData;
                    expect(waterwatchData.floodLevels.action_stage)
                        .toEqual(JSON.parse(MOCK_WATERWATCH_FLOOD_LEVELS).sites[0].action_stage);
                    expect(waterwatchData.floodLevels.flood_stage)
                        .toEqual(JSON.parse(MOCK_WATERWATCH_FLOOD_LEVELS).sites[0].flood_stage);
                    expect(waterwatchData.floodLevels.moderate_flood_stage)
                        .toEqual(JSON.parse(MOCK_WATERWATCH_FLOOD_LEVELS).sites[0].moderate_flood_stage);
                    expect(waterwatchData.floodLevels.major_flood_stage)
                        .toEqual(JSON.parse(MOCK_WATERWATCH_FLOOD_LEVELS).sites[0].major_flood_stage);
                    done();
                });
            });

            it('Expects the store to not contain empty features if calls are unsuccessful', (done) => {

                const promise = store.dispatch(Actions.retrieveWaterwatchData('12345678'));

                jasmine.Ajax.requests.at(0).respondWith({
                    status: 500,
                    responseText: 'Internal server error'
                });

                promise.then(() => {
                    const waterwatchData = store.getState().floodData;

                    expect(waterwatchData.floodLevels).toEqual(null);
                    done();
                });
            });
        });

        describe('setWaterwatchFloodLevels', () => {
            const FLOOD_LEVELS = [
                    {
                        site_no: '07144100',
                        action_stage: '20',
                        flood_stage: '22',
                        moderate_flood_stage: '25',
                        major_flood_stage: '26'
                    }
                ];

            it('expect waterwatch data to be updated', () => {
                store.dispatch(
                    Actions.setWaterwatchFloodLevels(FLOOD_LEVELS));
                const waterwatchData = store.getState().floodData;

                expect(waterwatchData.floodLevels[0].action_stage).toEqual(FLOOD_LEVELS[0].action_stage);
                expect(waterwatchData.floodLevels[0].flood_stage).toEqual(FLOOD_LEVELS[0].flood_stage);
                expect(waterwatchData.floodLevels[0].moderate_flood_stage).toEqual(FLOOD_LEVELS[0].moderate_flood_stage);
                expect(waterwatchData.floodLevels[0].major_flood_stage).toEqual(FLOOD_LEVELS[0].major_flood_stage);
            });
        });
    });

    describe('floodStateReducer', () => {
        describe('Actions.setGageHeight', () => {
            it('Updates the gageHeight', () => {
                store.dispatch(Actions.setGageHeight(12));

                expect(store.getState().floodState.gageHeight).toBe(12);
            });
        });
    });
});

const MOCK_STAGES = `
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
		},
		{
			"name": "STAGE",
			"type": "esriFieldTypeDouble",
			"alias": "STAGE"
		}
	],
	"features": [{
			"attributes": {
				"USGSID": "03341500",
				"STAGE": 30
			}
		},
		{
			"attributes": {
				"USGSID": "03341500",
				"STAGE": 29
			}
		},
		{
			"attributes": {
				"USGSID": "03341500",
				"STAGE": 28
			}
		}
	]
}`;

const MOCK_EXTENT = `{
    "extent": {
        "xmin": -87.46671436884024,
        "ymin": 39.434393043085194,
        "xmax": -87.40838667928894,
        "ymax": 39.514453931168774,
        "spatialReference": {"wkid": 4326, "latestWkid": 4326}
    }
}`;