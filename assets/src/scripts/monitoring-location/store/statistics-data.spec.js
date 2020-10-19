import {applyMiddleware, combineReducers, createStore} from 'redux';
import {default as thunk} from 'redux-thunk';

import {MOCK_STATISTICS_RDB} from 'ui/mock-service-data';

import {statisticsDataReducer, Actions} from 'ml/store/statistics-data';

describe('monitoring-location/store/statistics-data module', () => {
    let store;

    beforeEach(() => {
        store = createStore(
            combineReducers({
                statisticsData: statisticsDataReducer
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

    describe('Actions.setMedianStats', () => {
        it('Updates the median statistics', () => {
            store.dispatch(Actions.setMedianStats({
                '00060': {
                    '51644': {
                        value: '1'
                    }
                }
            }));
            expect(store.getState().statisticsData.median).toEqual({
                '00060': {
                    '51644': {
                        value: '1'
                    }
                }
            });
        });
    });

    describe('Actions.retrieveMedianStatistics', () => {
        it('Expect url to fetch the median statistics contains the siteno', () => {
            store.dispatch(Actions.retrieveMedianStatistics('12345678'));

            expect(jasmine.Ajax.requests.mostRecent().url).toContain('sites=12345678');
        });

        it('Expect that a succesful fetch updates the store', (done) => {
            const promise = store.dispatch(Actions.retrieveMedianStatistics('12345678'));
            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                responseText: MOCK_STATISTICS_RDB
            });

            promise.then(() => {
                expect(store.getState().statisticsData.median['00060']).toBeDefined();
                done();
            });
        });

        it('Expect that a failed fetch leaves the store with an empty object', (done) => {
            const promise = store.dispatch(Actions.retrieveMedianStatistics('12345678'));
            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 500,
                responseText: 'Internal Server error'
            });

            promise.then(() => {
                expect(store.getState().statisticsData.median).toEqual({});
                done();
            });
        });
    });
});