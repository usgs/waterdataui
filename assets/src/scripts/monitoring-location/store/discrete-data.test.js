import mockConsole from 'jest-mock-console';
import {applyMiddleware,  combineReducers, createStore} from 'redux';
import {default as thunk} from 'redux-thunk';
import sinon from 'sinon';

import {MOCK_GWLEVEL_DATA} from 'ui/mock-service-data';
import {addGroundwaterLevels, retrieveGroundwaterLevels, discreteDataReducer} from './discrete-data';

describe('monitoring-location/store/discrete-data', () => {
    let store;
    let fakeServer;
    let restoreConsole;

    beforeEach(() => {
        store = createStore(
            combineReducers({
                discreteData: discreteDataReducer
            }),
            {
                discreteData: {}
            },
            applyMiddleware(thunk)
        );
        fakeServer = sinon.createFakeServer();
        restoreConsole = mockConsole();
    });

    afterEach(() => {
        fakeServer.restore();
        restoreConsole();
    });

    describe('addGroundwaterLevels action', () => {
        const TEST_DATA = {
            variable: {
                variableCode: {
                    value: '72019',
                    variableID: '12345'
                }
            },
            values: [
                {
                    value: '34.5',
                    qualifiers: [],
                    dateTime: 1604775600000
                },
                {
                    value: '40.2',
                    qualifiers: [],
                    datetime: 1607972400000
                }
            ]
        };
        it('adds the groundwater levels to the store', () => {
            store.dispatch(addGroundwaterLevels('72019', TEST_DATA));
            const state = store.getState();

            expect(state.discreteData.groundwaterLevels['72019']).toEqual(TEST_DATA);
        });

        it('add the groundwater levels for the parameter code to the store while retaining data from other parameter codes', () => {
            const testDataOne = {
                variable: {
                    variableCode: {
                        value: '60123',
                        variableID: '55555'
                    }
                },
                values: [
                    {
                        value: '12.5',
                        qualifiers: [],
                        dateTime: 1597431600000
                    },
                    {
                        value: '10.2',
                        qualifiers: [],
                        datetime: 1600110000000
                    }
                ]
            };
            store.dispatch(addGroundwaterLevels('60123', testDataOne));
            store.dispatch(addGroundwaterLevels('72019', TEST_DATA));
            const state = store.getState();

            expect(state.discreteData.groundwaterLevels['60123']).toEqual(testDataOne);
            expect(state.discreteData.groundwaterLevels['72019']).toEqual(TEST_DATA);
        });

        it('replace the existing data for the parameter code', () => {
            const changedTestData = {
                ...TEST_DATA,
                values: [{
                    value: '14.5',
                    qualifiers: [],
                    dateTime: 1604775600000
                },
                {
                    value: '4.2',
                    qualifiers: [],
                    datetime: 1607972400000
                }]
            };
            store.dispatch(addGroundwaterLevels('72019', TEST_DATA));
            store.dispatch(addGroundwaterLevels('72019', changedTestData));
            const state = store.getState();
            
            expect(state.discreteData.groundwaterLevels['72019']).toEqual(changedTestData);
        });
    });

    describe('asynchronous action retrieveGroundwaterLevels', () => {
        it('Fetches groundwater levels and updates the store while converting the dateTimes to epoch', () => {
            fakeServer.respondWith([200, {'Content-Type': 'application/json'}, MOCK_GWLEVEL_DATA]);
            const dispatchPromise = store.dispatch(retrieveGroundwaterLevels('12345678', '72019', '2020-01-01', '2020-11-17)'));
            fakeServer.respond();
            return dispatchPromise.then(() => {
                const state = store.getState();

                expect(state.discreteData.groundwaterLevels['72019']).toBeDefined();
                expect(state.discreteData.groundwaterLevels['72019'].variable.variableCode[0].value).toEqual('72019');
                expect(state.discreteData.groundwaterLevels['72019'].values).toHaveLength(7);
                expect(state.discreteData.groundwaterLevels['72019'].values[0]).toEqual({
                    value: '26.07',
                    qualifiers: [],
                    dateTime: 1579788360000
                });
            });
        });

        it('Fetches groundwater levels with no levels and updates state', () => {
            const MOCK_DATA = {
                value: {
                    timeSeries: [
                        {
                            variable: {variableId: 11112222},
                            values: [{value: []}]
                        }
                    ]
                }
            };
            fakeServer.respondWith([200, {'Content-Type': 'application/json'}, JSON.stringify(MOCK_DATA)]);
            const dispatchPromise = store.dispatch(retrieveGroundwaterLevels('12345678', '72019', '2020-01-01', '2020-11-17)'));
            fakeServer.respond();
            return dispatchPromise.then(() => {
                const state = store.getState();
                expect(state.discreteData.groundwaterLevels['72019'].values).toHaveLength(0);
            });
        });

        it('Bad fetch updates groundwater level with empty object', () => {
            fakeServer.respondWith([500, {}, 'Internal server error']);
            const dispatchPromise = store.dispatch(retrieveGroundwaterLevels('12345678', '72019', '2020-01-01', '2020-11-17)'));
            fakeServer.respond();
            return dispatchPromise.then(() => {
                const state = store.getState();

                expect(state.discreteData.groundwaterLevels['72019']).toEqual({});
            });
        });
    });
});