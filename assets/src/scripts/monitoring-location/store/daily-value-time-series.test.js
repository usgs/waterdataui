import {applyMiddleware, combineReducers, createStore} from 'redux';
import {default as thunk} from 'redux-thunk';
import sinon from 'sinon';

import {Actions, dailyValueTimeSeriesDataReducer, dailyValueTimeSeriesStateReducer} from './daily-value-time-series';

describe('monitoring-location/store/daily-value-time-series module', () => {
    /* eslint no-use-before-define: 0 */
    let store;
    let fakeServer;

    beforeEach(() => {
        store = createStore(
            combineReducers({
                dailyValueTimeSeriesData: dailyValueTimeSeriesDataReducer,
                dailyValueTimeSeriesState: dailyValueTimeSeriesStateReducer
            }),
            {
                dailyValueTimeSeriesData: {},
                dailyValueTimeSeriesState: {}
            },
            applyMiddleware(thunk)
        );
        fakeServer = sinon.createFakeServer();
    });

    afterEach(() => {
        fakeServer.restore();
    });

    describe('dailyValueTimeSeriesDataReducer actions', () => {

        describe('Actions.setAvailableDVTimeSeries', () => {
            it('expect to set the availableDVTimeSeries', () => {
                store.dispatch(Actions.setAvailableDVTimeSeries([{id: '1'}, {id: '2'}]));

                expect(store.getState().dailyValueTimeSeriesData.availableDVTimeSeries).toEqual([{id: '1'}, {id: '2'}]);
            });
        });

        describe('Actions.addDVTimeSeries', () => {
            it('expect to add the dvTimeSeries to the store', () => {
                store.dispatch(Actions.addDVTimeSeries('ffff345', {id: 'fffff345'}));

                expect(store.getState().dailyValueTimeSeriesData.dvTimeSeries.ffff345).toEqual({id: 'fffff345'});
            });

            it('Expect to retain other time series but add new to the store', () =>{
                store.dispatch(Actions.addDVTimeSeries('ffff345', {id: 'fffff345'}));
                store.dispatch(Actions.addDVTimeSeries('aaaa345', {id: 'aaaa345'}));
                const state = store.getState();

                expect(state.dailyValueTimeSeriesData.dvTimeSeries.ffff345).toEqual({id: 'fffff345'});
                expect(state.dailyValueTimeSeriesData.dvTimeSeries.aaaa345).toEqual({id: 'aaaa345'});
            });
        });

        describe('Actions.retrieveAvailableDVTimeSeries', () => {
            it('Expects a successful fetch request to update the store', () => {
                const promise = store.dispatch(Actions.retrieveAvailableDVTimeSeries('USGS-12345678'));

                expect(fakeServer.requests[0].url).toContain('USGS-12345678');
                fakeServer.requests[0].respond(200, {}, MOCK_AVAILABLE_TIME_SERIES);

                return promise.then(() => {
                    const state = store.getState();
                    expect(state.dailyValueTimeSeriesData.availableDVTimeSeries).toBeDefined();
                    expect(state.dailyValueTimeSeriesData.availableDVTimeSeries).toEqual([
                        {
                            'parameterCode': '72019',
                            'statisticCode': '00002',
                            'url': 'string',
                            'description': 'Depth to water level, ft below land surface, daily maximum',
                            'id': 'AGENCY-FEATURE-TIMESERIES'
                        }
                    ]);
                });
            });

            it('Expects a successful fetch request with no time series sets the store to show empty array', () => {
                const promise = store.dispatch(Actions.retrieveAvailableDVTimeSeries('USGS-12345678'));

                fakeServer.requests[0].respond(200, {}, MOCK_EMPTY_AVAILABLE_TIME_SERIES);

                return promise.then(() => {
                    expect(store.getState().dailyValueTimeSeriesData.availableDVTimeSeries).toEqual([]);
                });
            });

            it('Expects a bad fetch request to not update the store', () => {
                const promise = store.dispatch(Actions.retrieveAvailableDVTimeSeries('USGS-12345678'));
                fakeServer.requests[0].respond(500, {}, 'Bad Data');

                return promise.then(() => {
                    const state = store.getState();
                    expect(state.dailyValueTimeSeriesData.availableDVTimeSeries).toEqual([]);
                });
            });
        });

        describe('Actions.retrieveDVTimeSeries', () => {
            it('Expects a successful fetch request to update the store', () => {
                const promise = store.dispatch(Actions.retrieveDVTimeSeries('USGS-12345678', 'ffff345'));
                const url = fakeServer.requests[0].url;
                expect(url).toContain('USGS-12345678');
                expect(url).toContain('ffff345');

                fakeServer.requests[0].respond(200, {}, MOCK_DV_TIME_SERIES);

                return promise.then(() => {
                    const state = store.getState();
                    expect(state.dailyValueTimeSeriesData.dvTimeSeries).toBeDefined();
                    expect(state.dailyValueTimeSeriesData.dvTimeSeries.ffff345).toBeDefined();
                    expect(state.dailyValueTimeSeriesData.dvTimeSeries.ffff345.id).toEqual('USGS-12345678-ffff345');
                });
            });

            it('Expects that if the time series has already been fetched, the data is not refetched', () => {
                store.dispatch(Actions.addDVTimeSeries('ffff345', {id: 'ffff345'}));
                store.dispatch(Actions.retrieveDVTimeSeries('USGS-12345678', 'ffff345'));

                expect(fakeServer.requests).toHaveLength(0);
            });

            it('Expects a bad fetch request to not add a time series the store', () => {
                const initPromise = store.dispatch(Actions.retrieveDVTimeSeries('USGS-12345678', 'ffff345'));
                fakeServer.requests[0].respond(200, {}, MOCK_DV_TIME_SERIES);

                return initPromise.then(() => {
                    const promise = store.dispatch(Actions.retrieveDVTimeSeries('USGS-12345678', 'aaaa345'));
                    fakeServer.requests[1].respond(500, {}, 'Bad Data');

                    return promise.then(() => {
                        const state = store.getState();
                        expect(state.dailyValueTimeSeriesData.dvTimeSeries.ffff345).toBeDefined();
                        expect(state.dailyValueTimeSeriesData.dvTimeSeries.aaaa345).toBeDefined();
                        expect(state.dailyValueTimeSeriesData.dvTimeSeries.aaaa345).toEqual({});
                    });
                });
            });
        });
    });

    describe('dailyValueTimeSeriesStateReducer actions', () => {

        describe('Actions.setCurrentDVTimeSeriesIds', () => {
            it('Updates the current set of DV time series ids', () => {
                store.dispatch(Actions.setCurrentDVTimeSeriesIds('ffff3455', 'dddd1111', 'cccc3333'));

                expect(store.getState().dailyValueTimeSeriesState.currentDVTimeSeriesId).toEqual({
                    min: 'ffff3455',
                    mean: 'dddd1111',
                    max: 'cccc3333'
                });

                store.dispatch(Actions.setCurrentDVTimeSeriesIds('aaaa3455', null, null));
                expect(store.getState().dailyValueTimeSeriesState.currentDVTimeSeriesId).toEqual({
                    min: 'aaaa3455',
                    mean: null,
                    max: null
                });
            });
        });

        describe('Actions.setCurrentDVGraphCursorOffset', () => {
            it('updates cursor offset', () => {
                store.dispatch(Actions.setDVGraphCursorOffset(1234512345));

                expect(store.getState().dailyValueTimeSeriesState.dvGraphCursorOffset).toEqual(1234512345);
            });
        });

        describe('Actions.setDVGraphBrushOffset', () => {
            it('updates brush offset', () => {
                store.dispatch(Actions.setDVGraphBrushOffset(1234512345, 1111122222));

                expect(store.getState().dailyValueTimeSeriesState.dvGraphBrushOffset).toEqual({
                    start: 1234512345,
                    end: 1111122222
                });
            });
        });

        describe('Actions.clearDVGraphBrushOffset', () => {
            it('clear the  brush offset', () => {
                store.dispatch(Actions.setDVGraphBrushOffset(1234512345, 1111122222));
                store.dispatch(Actions.clearDVGraphBrushOffset());
                expect(store.getState().dailyValueTimeSeriesState.dvGraphBrushOffset).not.toBeDefined();
            });
        });
    });
});

const MOCK_AVAILABLE_TIME_SERIES = `
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
      "parameterCode": "72019",
      "statisticCode": "00002",
      "url": "string",
      "description": "Depth to water level, ft below land surface, daily maximum",
      "id": "AGENCY-FEATURE-TIMESERIES"
    }
  ]
}`;

const MOCK_EMPTY_AVAILABLE_TIME_SERIES = `{
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
  "timeSeries": []
}`;

const MOCK_DV_TIME_SERIES = `{
  "type": "Feature",
  "id": "USGS-12345678-ffff345",
  "geometry": {
    "type": "Point",
    "coordinates": [
      0
    ]
  },
  "properties": {
    "observationType": "MeasureTimeseriesObservation",
    "phenomenonTimeStart": "2019-11-09",
    "phenomenonTimeEnd": "2019-11-15",
    "observedPropertyName": "Depth to water level, ft below land surface",
    "observedPropertyReference": "https://waterdata.usgs.gov/nwisweb/rdf?parmCd=72019",
    "samplingFeatureName": "Punta De Agua Ck nr Channing, TX",
    "statistic": "DAILY MAXIMUM VALUES",
    "statisticReference": "https://waterdata.usgs.gov/nwisweb/rdf?statCd=00001",
    "timeStep": [
      "2020-04-08"
    ],
    "unitOfMeasureName": "ft",
    "unitOfMeasureReference": "http://www.opengis.net/def/uom/UCUM/ft",
    "result": [
      "string"
    ],
    "nilReason": [
      "string"
    ],
    "approvals": [
      "string"
    ],
    "qualifiers": [
      "string"
    ],
    "grades": [
      "string"
    ]
  }
}`;