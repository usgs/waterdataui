import { applyMiddleware, combineReducers, createStore } from 'redux';
import {default as thunk} from 'redux-thunk';


import {retrieveAvailableDVTimeSeries, retrieveDVTimeSeries, setAvailableDVTimeSeries,
    addDVTimeSeries, observationsDataReducer, setCurrentDVTimeSeriesId, setDVGraphCursorOffset,
    setDVGraphBrushOffset, clearDVGraphBrushOffset, observationsStateReducer
} from './observations';

describe('store/observations module', () => {
    /* eslint no-use-before-define: 0 */
    let store;

    beforeEach(() => {
        store = createStore(
            combineReducers({
                observationsData: observationsDataReducer,
                observationsState: observationsStateReducer
            }),
            {
                observationsData: {},
                observationsState: {}
            },
            applyMiddleware(thunk)
        );
        jasmine.Ajax.install();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
    });

    describe('observationsDataReducer actions', () => {

        describe('setAvailableDVTimeSeries', () => {
            it('expect to set the availableDVTimeSeries', () => {
                store.dispatch(setAvailableDVTimeSeries([{id: '1'}, {id: '2'}]));

                expect(store.getState().observationsData.availableDVTimeSeries).toEqual([{id: '1'}, {id: '2'}]);
            });
        });

        describe('addDVTimeSeries', () => {
            it('expect to add the dvTimeSeries to the store', () => {
                store.dispatch(addDVTimeSeries('ffff345', {id: 'fffff345'}));

                expect(store.getState().observationsData.dvTimeSeries.ffff345).toEqual({id: 'fffff345'});
            });

            it('Expect to retain other time series but add new to the store', () =>{
                store.dispatch(addDVTimeSeries('ffff345', {id: 'fffff345'}));
                store.dispatch(addDVTimeSeries('aaaa345', {id: 'aaaa345'}));
                const state = store.getState();

                expect(state.observationsData.dvTimeSeries.ffff345).toEqual({id: 'fffff345'});
                expect(state.observationsData.dvTimeSeries.aaaa345).toEqual({id: 'aaaa345'});
            });
        });

        describe('retrieveAvailableDVTimeSeries', () => {
            it('Expects a successful fetch request to update the store', (done) => {
                const promise = store.dispatch(retrieveAvailableDVTimeSeries('USGS-12345678'));

                expect(jasmine.Ajax.requests.mostRecent().url).toContain('USGS-12345678');
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200,
                    responseText: MOCK_AVAILABLE_TIME_SERIES
                });

                promise.then(() => {
                    const state = store.getState();
                    expect(state.observationsData.availableDVTimeSeries).toBeDefined();
                    expect(state.observationsData.availableDVTimeSeries).toEqual([
                        {
                            'parameterCode': '72019',
                            'statisticCode': '00002',
                            'url': 'string',
                            'description': 'Depth to water level, ft below land surface, daily maximum',
                            'id': 'AGENCY-FEATURE-TIMESERIES'
                        }
                    ]);
                    done();
                });
            });

            it('Expects a successful fetch request with no time series sets the store to show empty array', (done) => {
                const promise = store.dispatch(retrieveAvailableDVTimeSeries('USGS-12345678'));

                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200,
                    responseText: MOCK_EMPTY_AVAILABLE_TIME_SERIES
                });

                promise.then(() => {
                    expect(store.getState().observationsData.availableDVTimeSeries).toEqual([]);

                    done();
                });
            });

            it('Expects a bad fetch request to not update the store', (done) => {
                const promise = store.dispatch(retrieveAvailableDVTimeSeries('USGS-12345678'));
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 500,
                    responseText: 'Bad Data'
                });

                promise.then(() => {
                    const state = store.getState();
                    expect(state.observationsData.availableDVTimeSeries).toEqual([]);

                    done();
                });
            });
        });

        describe('retrieveDVTimeSeries', () => {
            it('Expects a successful fetch request to update the store', (done) => {
                const promise = store.dispatch(retrieveDVTimeSeries('USGS-12345678', 'ffff345'));
                const url = jasmine.Ajax.requests.mostRecent().url;
                expect(url).toContain('USGS-12345678');
                expect(url).toContain('ffff345');

                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200,
                    responseText: MOCK_DV_TIME_SERIES
                });

                promise.then(() => {
                    const state = store.getState();
                    expect(state.observationsData.dvTimeSeries).toBeDefined();
                    expect(state.observationsData.dvTimeSeries.ffff345).toBeDefined();
                    expect(state.observationsData.dvTimeSeries.ffff345.id = 'USGS-1234567-ffff345');

                    done();
                });
            });

            it('Expects a bad fetch request to not add a time series the store', (done) => {
                const initPromise = store.dispatch(retrieveDVTimeSeries('USGS-12345678', 'ffff345'));
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200,
                    responseText: MOCK_DV_TIME_SERIES
                });
                initPromise.then(() => {
                    const promise = store.dispatch(retrieveDVTimeSeries('USGS-12345678', 'aaaa345'));
                    jasmine.Ajax.requests.mostRecent().respondWith({
                        status: 500,
                        responseText: 'Bad Data'
                    });

                    promise.then(() => {
                        const state = store.getState();
                        expect(state.observationsData.dvTimeSeries.ffff345).toBeDefined();
                        expect(state.observationsData.dvTimeSeries.aaaa345).toBeDefined();
                        expect(state.observationsData.dvTimeSeries.aaaa345).toEqual({});

                        done();
                    });
                });
            });
        });
    });

    describe('observationsStateReducer actions', () => {
        describe('setCurrentDVTimeSeriesId', () => {
            it('updates current time series id', () => {
                store.dispatch(setCurrentDVTimeSeriesId('ffff345'));

                expect(store.getState().observationsState.currentDVTimeSeriesId).toEqual('ffff345');
            });
        });

        describe('setCurrentDVGraphCursorOffset', () => {
            it('updates cursor offset', () => {
                store.dispatch(setDVGraphCursorOffset(1234512345));

                expect(store.getState().observationsState.dvGraphCursorOffset).toEqual(1234512345);
            });
        });

        describe('setDVGraphBrushOffset', () => {
            it('updates brush offset', () => {
                store.dispatch(setDVGraphBrushOffset(1234512345, 1111122222));

                expect(store.getState().observationsState.dvGraphBrushOffset).toEqual({
                    start: 1234512345,
                    end: 1111122222
                });
            });
        });

        describe('clearDVGraphBrushOffset', () => {
            it('clear the  brush offset', () => {
                store.dispatch(setDVGraphBrushOffset(1234512345, 1111122222));
                store.dispatch(clearDVGraphBrushOffset());
                expect(store.getState().observationsState.dvGraphBrushOffset).not.toBeDefined();
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