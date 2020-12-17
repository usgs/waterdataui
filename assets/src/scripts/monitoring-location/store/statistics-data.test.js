import {applyMiddleware, combineReducers, createStore} from 'redux';
import {default as thunk} from 'redux-thunk';
import sinon from 'sinon';

import {MOCK_STATISTICS_RDB} from 'ui/mock-service-data';

import {statisticsDataReducer, Actions} from './statistics-data';

describe('monitoring-location/store/statistics-data module', () => {
    let store;
    let fakeServer;

    beforeEach(() => {
        store = createStore(
            combineReducers({
                statisticsData: statisticsDataReducer
            }),
            applyMiddleware(thunk)
        );
        fakeServer = sinon.createFakeServer();
    });

    afterEach(() => {
        fakeServer.restore();
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

            expect(fakeServer.requests[0].url).toContain('sites=12345678');
        });

        it('Expect that a succesful fetch updates the store', (done) => {
            const promise = store.dispatch(Actions.retrieveMedianStatistics('12345678'));
            fakeServer.requests[0].respond(200, {}, MOCK_STATISTICS_RDB);

            promise.then(() => {
                expect(store.getState().statisticsData.median['00060']).toBeDefined();
                done();
            });
        });

        it('Expect that a failed fetch leaves the store with an empty object', (done) => {
            const promise = store.dispatch(Actions.retrieveMedianStatistics('12345678'));
            fakeServer.requests[0].respond(500, {}, 'Internal Server error');

            promise.then(() => {
                expect(store.getState().statisticsData.median).toEqual({});
                done();
            });
        });
    });
});