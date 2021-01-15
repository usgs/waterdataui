import mockConsole from 'jest-mock-console';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import {default as thunk} from 'redux-thunk';
import sinon from 'sinon';

import {MOCK_IV_DATA} from 'ui/mock-service-data';

import {Actions as floodStateActions, floodStateReducer} from './flood-inundation';
import {Actions, ivTimeSeriesDataReducer} from './instantaneous-value-time-series-data';
import {Actions as ivTimeSeriesStateActions, ivTimeSeriesStateReducer} from './instantaneous-value-time-series-state';

describe('monitoring-location/store/instantaneous-value-time-series-data module', () => {
    let store;
    let fakeServer;
    let restoreConsole;
    describe('ivTimeSeriesDataReducer module', () => {
        beforeEach(() => {
            restoreConsole = mockConsole();
            store = createStore(
                combineReducers({
                    floodState: floodStateReducer,
                    ivTimeSeriesData: ivTimeSeriesDataReducer,
                    ivTimeSeriesState: ivTimeSeriesStateReducer
                }),
                {
                    floodState: {},
                    ivTimeSeriesData: {
                        variables: {
                            '45807197': {
                                variableCode: {
                                    value: '00060'
                                }
                            }
                        }
                    },
                    ivTimeSeriesState: {
                        loadingIVTSKeys: [],
                        userInputsForTimeRange: {
                            mainTimeRangeSelectionButton: 'P7D',
                            customTimeRangeSelectionButton: 'days-input',
                            numberOfDaysFieldValue: ''
                        }
                    }
                },
                applyMiddleware(thunk)
            );
            fakeServer = sinon.createFakeServer();
        });

        afterEach(() => {
            restoreConsole();
            fakeServer.restore();
        });

        describe('Actions.addIVTimeSeriesCollection', () => {
            it('Expect data to be added to previously empty collection', () => {
                store.dispatch(Actions.addIVTimeSeriesCollection({
                    variables: {
                        'var1': {
                            value: 'Value 1'
                        }
                    },
                    timeSeries: {
                        'var1:current:P7D': {
                            values: [1, 2, 3]
                        }
                    }
                }));

                expect(store.getState().ivTimeSeriesData).toEqual({
                    variables: {
                        'var1': {
                            value: 'Value 1'
                        },
                        '45807197': {
                            variableCode: {
                                value: '00060'
                            }
                        }
                    },
                    timeSeries: {
                        'var1:current:P7D': {
                            values: [1, 2, 3]
                        }
                    }
                });
            });

            it('Expect data to be merged in with existing data', () => {
                store.dispatch(Actions.addIVTimeSeriesCollection({
                    variables: {
                        '45807197': {
                            variableCode: {
                                value: '00060'
                            }
                        },
                        'var1': {
                            value: 'Value 1'
                        }
                    },
                    timeSeries: {
                        'var1:current:P7D': {
                            values: [1, 2, 3]
                        }
                    }
                }));
                store.dispatch(Actions.addIVTimeSeriesCollection({
                    variables: {
                        'var2': {
                            value: 'Value 2'
                        }
                    },
                    timeSeries: {
                        'var2:current:P7D': {
                            values: [5, 6, 7]
                        }
                    }
                }));

                expect(store.getState().ivTimeSeriesData).toEqual({
                    variables: {
                        '45807197': {
                            variableCode: {
                                value: '00060'
                            }
                        },
                        'var1': {
                            value: 'Value 1'
                        },
                        'var2': {
                            value: 'Value 2'
                        }
                    },
                    timeSeries: {
                        'var1:current:P7D': {
                            values: [1, 2, 3]
                        },
                        'var2:current:P7D': {
                            values: [5, 6, 7]
                        }
                    }
                });
            });
        });

        describe('Actions.resetIVTimeSeries', () => {
            it('Expect the specific time series to be cleared', () => {
                store.dispatch(Actions.addIVTimeSeriesCollection({
                    requests: {
                        'var1:current:P7D': {
                            queryInfo: 'var1:current:P7D'
                        },
                        'var2:current:P7D': {
                            queryInfo: 'var2:current:P7D'
                        }
                    },
                    timeSeries: {
                        'var1:current:P7D': {
                            tsKey: 'var1:current:P7D',
                            values: [1, 2, 3]
                        },
                        'var2:current:P7D': {
                            tsKey: 'var2:current:P7D',
                            values: [5, 6, 7]
                        }
                    }
                }));
                store.dispatch(Actions.resetIVTimeSeries('var2:current:P7D'));

                expect(store.getState().ivTimeSeriesData).toEqual({
                    variables: {
                        '45807197': {
                            variableCode: {
                                value: '00060'
                            }
                        }
                    },
                    requests: {
                        'var1:current:P7D': {
                            queryInfo: 'var1:current:P7D'
                        },
                        'var2:current:P7D': {}
                    },
                    timeSeries: {
                        'var1:current:P7D': {
                            tsKey: 'var1:current:P7D',
                            values: [1, 2, 3]
                        }
                    }
                });
            });
        });

        describe('Actions.retrieveIVTimeSeries', () => {
            beforeEach(() => {
                jest.spyOn(Actions, 'addIVTimeSeriesCollection');
                jest.spyOn(Actions, 'resetIVTimeSeries');
                jest.spyOn(Actions, 'retrieveCompareIVTimeSeries');
                jest.spyOn(floodStateActions, 'setGageHeight');
            });

            it('Service url should contain the siteno and period=P7D', () => {
                store.dispatch(Actions.retrieveIVTimeSeries('12345678'));

                const url = fakeServer.requests[0].url;
                expect(url).toContain('sites=12345678');
                expect(url).toContain('period=P7D');
            });

            it('Loading key should be set for this time series before fetch is complete', () => {
                store.dispatch(Actions.retrieveIVTimeSeries('12345678'));

                expect(store.getState().ivTimeSeriesState.loadingIVTSKeys).toContain('current:P7D');
            });

            it('Expect that a successful fetch updates the data and sets the state appropriately', () => {
                const promise = store.dispatch(Actions.retrieveIVTimeSeries('12345678'));
                fakeServer.requests[0].respond(200, {}, MOCK_IV_DATA);

                return promise.then(() => {
                    const tsState = store.getState().ivTimeSeriesState;
                    expect(Actions.retrieveCompareIVTimeSeries).toHaveBeenCalled();
                    expect(Actions.addIVTimeSeriesCollection).toHaveBeenCalled();
                    expect(floodStateActions.setGageHeight).toHaveBeenCalled();
                    expect(tsState.loadingIVTSKeys).not.toContain('current:P7D');
                    expect(tsState.showIVTimeSeries.current).toBe(true);
                    expect(tsState.currentIVVariableID).toBe('45807197');
                });
            });

            it('Expect that a failed fetch resets the time series and removes the loading key', () => {
                const promise = store.dispatch(Actions.retrieveIVTimeSeries('12345678'));
                fakeServer.requests[0].respond(500, {}, 'Internal server error');

                return promise.then(() => {
                    const tsState = store.getState().ivTimeSeriesState;
                    expect(Actions.resetIVTimeSeries).toHaveBeenCalled();
                    expect(tsState.loadingIVTSKeys).not.toContain('current:P7D');
                });
            });
        });

        describe('Actions.retrieveCompareIVTimeSeries', () => {
            const startDT = 1586793994000;
            const endDT = 1587398794000;
            beforeEach(() => {
                jest.spyOn(Actions, 'addIVTimeSeriesCollection');
                jest.spyOn(Actions, 'resetIVTimeSeries');
            });

            it('Service url should contain the siteno, startDT, and endDT', () => {
                store.dispatch(Actions.retrieveCompareIVTimeSeries('12345678', 'P7D', startDT, endDT));

                const url = fakeServer.requests[0].url;
                expect(url).toContain('sites=12345678');
                expect(url).toContain('startDT=');
                expect(url).toContain('endDT=');
            });

            it('Loading key should be set for this time series before fetch is complete', () => {
                store.dispatch(Actions.retrieveCompareIVTimeSeries('12345678', 'P7D', startDT, endDT));

                expect(store.getState().ivTimeSeriesState.loadingIVTSKeys).toContain('compare:P7D');
            });

            it('Expect that a successful fetch updates the data and sets the state appropriately', () => {
                const promise = store.dispatch(Actions.retrieveCompareIVTimeSeries('12345678', 'P7D', startDT, endDT));
                fakeServer.requests[0].respond(200, {}, MOCK_IV_DATA);

                return promise.then(() => {
                    const tsState = store.getState().ivTimeSeriesState;
                    expect(Actions.addIVTimeSeriesCollection).toHaveBeenCalled();
                    expect(tsState.loadingIVTSKeys).not.toContain('compare:P7D');
                });
            });

            it('Expect that a failed fetch resets the time series and removes the loading key', () => {
                const promise = store.dispatch(Actions.retrieveCompareIVTimeSeries('12345678', 'P7D', startDT, endDT));
                fakeServer.requests[0].respond(500, {}, 'Internal server error');

                return promise.then(() => {
                    const tsState = store.getState().ivTimeSeriesState;
                    expect(Actions.resetIVTimeSeries).toHaveBeenCalled();
                    expect(tsState.loadingIVTSKeys).not.toContain('compare:P7D');
                });
            });
        });

        describe('Actions.retrieveCustomTimePeriodIVTimeSeries', () => {
            beforeEach(() => {
                jest.spyOn(Actions, 'addIVTimeSeriesCollection');
                jest.spyOn(Actions, 'resetIVTimeSeries');
            });

            it('Service url should contain the siteno, startDT, and endDT', () => {
                store.dispatch(Actions.retrieveCustomTimePeriodIVTimeSeries('12345678', '00060', 'P14D'));

                const url = fakeServer.requests[0].url;
                expect(url).toContain('sites=12345678');
                expect(url).toContain('parameterCd=00060');
                expect(url).toContain('period=P14D');
            });

            it('Loading key should be set for this time series before fetch is complete and current user input time range selection button set to custom', () => {
                store.dispatch(Actions.retrieveCustomTimePeriodIVTimeSeries('12345678', '00060', 'P14D'));

                const tsState = store.getState().ivTimeSeriesState;
                expect(tsState.loadingIVTSKeys).toContain('current:P14D:00060');
                expect(tsState.userInputsForTimeRange.mainTimeRangeSelectionButton).toBe('custom');
            });

            it('Expect that a successful fetch updates the data and sets the state appropriately', () => {
                const promise = store.dispatch(Actions.retrieveCustomTimePeriodIVTimeSeries('12345678', '00060', 'P14D'));
                fakeServer.requests[0].respond(200, {}, MOCK_IV_DATA);

                return promise.then(() => {
                    const tsState = store.getState().ivTimeSeriesState;
                    expect(Actions.addIVTimeSeriesCollection).toHaveBeenCalled();
                    expect(tsState.loadingIVTSKeys).not.toContain('current:custom:00060');
                });
            });

            it('Expect that a failed fetch resets the time series and removes the loading key', () => {
                const promise = store.dispatch(Actions.retrieveCustomTimePeriodIVTimeSeries('12345678', '00060', 'P14D'));
                fakeServer.requests[0].respond(500, {}, 'Internal server error');

                return promise.then(() => {
                    const tsState = store.getState().ivTimeSeriesState;
                    expect(Actions.resetIVTimeSeries).toHaveBeenCalled();
                    expect(tsState.loadingIVTSKeys).not.toContain('current:custom:00060');
                });
            });
        });

        describe('Actions.retrieveCustomIVTimeSeries', () => {
            const startDT = 1586793994000;
            const endDT = 1587398794000;

            beforeEach(() => {
                jest.spyOn(Actions, 'addIVTimeSeriesCollection');
                jest.spyOn(Actions, 'resetIVTimeSeries');
                store.dispatch(ivTimeSeriesStateActions.setCurrentIVVariable('45807197'));
            });

            it('Service url should contain the siteno, startDT, and endDT and current parameter code', () => {
                store.dispatch(Actions.retrieveCustomIVTimeSeries('12345678', startDT, endDT));

                const url = fakeServer.requests[0].url;
                expect(url).toContain('sites=12345678');
                expect(url).toContain('parameterCd=00060');
                expect(url).toContain('startDT=');
                expect(url).toContain('endDT=');
            });

            it('Loading key should be set for this time series before fetch is complete and current date range kind set to custo', () => {
                store.dispatch(Actions.retrieveCustomIVTimeSeries('12345678', startDT, endDT));

                const tsState = store.getState().ivTimeSeriesState;
                expect(tsState.loadingIVTSKeys).toContain('current:custom:00060');
                expect(tsState.customIVTimeRange).toEqual({
                    start: startDT,
                    end: endDT
                });
                expect(tsState.showIVTimeSeries.median).toBe(false);
            });

            it('Expect that a successful fetch updates the data and sets the state appropriately', () => {
                const promise = store.dispatch(Actions.retrieveCustomIVTimeSeries('12345678', startDT, endDT));
                fakeServer.requests[fakeServer.requests.length - 1].respond(200, {}, MOCK_IV_DATA);

                return promise.then(() => {
                    const tsState = store.getState().ivTimeSeriesState;
                    expect(Actions.addIVTimeSeriesCollection).toHaveBeenCalled();
                    expect(tsState.loadingIVTSKeys).not.toContain('current:custom:00060');
                });
            });

            it('Expect that a failed fetch resets the time series and removes the loading key', () => {
                const promise = store.dispatch(Actions.retrieveCustomIVTimeSeries('12345678', '00060', 'P14D'));
                fakeServer.requests[fakeServer.requests.length - 1].respond(500, {}, 'Internal server error');

                return promise.then(() => {
                    const tsState = store.getState().ivTimeSeriesState;
                    expect(Actions.addIVTimeSeriesCollection).toHaveBeenCalledWith({});
                    expect(tsState.loadingIVTSKeys).not.toContain('current:custom:00060');     
                });
            });
        });

        describe('Actions.retrieveExtendedIVTimeSeries', () => {
            let initialPromise;
            beforeEach(() => {
                jest.spyOn(Actions, 'addIVTimeSeriesCollection');
                jest.spyOn(Actions, 'resetIVTimeSeries');
                jest.spyOn(Actions, 'retrieveCompareIVTimeSeries');
                store.dispatch(ivTimeSeriesStateActions.setCurrentIVVariable('45807197'));
                initialPromise = store.dispatch(Actions.retrieveIVTimeSeries('12345678'));
                fakeServer.requests[fakeServer.requests.length - 1].respond(200, {}, MOCK_IV_DATA);
            });

            it('Service url should contain the siteno, current parameter code, and period', () => {
                return initialPromise.then(() => {
                    store.dispatch(Actions.retrieveExtendedIVTimeSeries('12345678', 'P30D'));

                    const url = fakeServer.requests[fakeServer.requests.length - 1].url;
                    expect(url).toContain('sites=12345678');
                    expect(url).toContain('startDT=');
                    expect(url).toContain('endDT=');
                });
            });

            it('Loading key should be set for this time series before fetch is complete', () => {
                return initialPromise.then(() => {
                    store.dispatch(Actions.retrieveExtendedIVTimeSeries('12345678', 'P30D'));

                    expect(store.getState().ivTimeSeriesState.loadingIVTSKeys).toContain('current:P30D:00060');
                });
            });

            it('Expect that a successful fetch updates the data and sets the state appropriately', () => {
                return initialPromise.then(() => {
                    const promise = store.dispatch(Actions.retrieveExtendedIVTimeSeries('12345678', 'P30D:00060'));
                    fakeServer.requests[fakeServer.requests.length - 1].respond(200, {}, MOCK_IV_DATA);

                    return promise.then(() => {
                        const tsState = store.getState().ivTimeSeriesState;
                        expect(Actions.addIVTimeSeriesCollection).toHaveBeenCalled();
                        expect(Actions.retrieveCompareIVTimeSeries).toHaveBeenCalled();
                        expect(tsState.loadingIVTSKeys).not.toContain('current:P30D');
                    });
                });
            });

            it('Expect that a failed fetch resets the time series and removes the loading key', () => {
                return initialPromise.then(() => {
                    const promise = store.dispatch(Actions.retrieveExtendedIVTimeSeries('12345678', 'P30D'));
                    fakeServer.requests[fakeServer.requests.length - 1].respond(500, {}, 'Internal server error');

                    return promise.then(() => {
                        const tsState = store.getState().ivTimeSeriesState;
                        expect(Actions.addIVTimeSeriesCollection).toHaveBeenCalledWith({});
                        expect(tsState.loadingIVTSKeys).not.toContain('current:P30D:00060');
                    });
                });
            });
        });

        describe('Actions.updateIVCurrentVariableAndRetrieveTimeSeries', () => {
            const startDT = 1586793994000;
            const endDT = 1587398794000;
            beforeEach(() => {
                jest.spyOn(Actions, 'retrieveCustomIVTimeSeries');
                jest.spyOn(Actions, 'retrieveExtendedIVTimeSeries');
            });

            it('Expect to retrieve custom time series if date range kind is custom', () => {
                store.dispatch(ivTimeSeriesStateActions.setCurrentIVDateRange('custom'));
                store.dispatch(ivTimeSeriesStateActions.setCustomIVTimeRange(startDT, endDT));
                store.dispatch(Actions.updateIVCurrentVariableAndRetrieveTimeSeries('12345678', '45807197'));

                expect(store.getState().ivTimeSeriesState.currentIVVariableID).toEqual('45807197');
                expect(Actions.retrieveCustomIVTimeSeries).toHaveBeenCalled();
            });

            it('Expect to retrieve extended time series if date range kind is not custom', () => {
                store.dispatch(ivTimeSeriesStateActions.setCurrentIVVariable('45807197'));
                let initialPromise = store.dispatch(Actions.retrieveIVTimeSeries('12345678'));
                fakeServer.requests[0].respond(200, {}, MOCK_IV_DATA);

                return initialPromise.then(() => {
                    store.dispatch(Actions.updateIVCurrentVariableAndRetrieveTimeSeries('12345678', '45807197'));
                    expect(Actions.retrieveExtendedIVTimeSeries).toHaveBeenCalled();
                });
            });
        });

        describe('retrieveUserRequestedIVDataForDateRange', () => {
            let mockDispatch;
            let mockGetState;

            beforeEach(() => {
                mockDispatch = jest.fn();
                mockGetState = jest.fn(() => ({
                    ianaTimeZone: 'America/Chicago'
                }));

                jest.spyOn(Actions, 'retrieveCustomIVTimeSeries').mockImplementation(() => {});
            });

            afterEach(() => {
            });

            it('Converts time strings to javascript date/time objects correctly', () => {
                Actions.retrieveUserRequestedIVDataForDateRange('12345678', '2010-01-01', '2010-03-01')(mockDispatch, mockGetState);
                expect(Actions.retrieveCustomIVTimeSeries).toHaveBeenCalled();
                expect(Actions.retrieveCustomIVTimeSeries.mock.calls[0][0]).toEqual('12345678');
                expect(Actions.retrieveCustomIVTimeSeries.mock.calls[0][1]).toEqual(1262325600000);
                expect(Actions.retrieveCustomIVTimeSeries.mock.calls[0][2]).toEqual(1267509599999);
            });
        });
    });
});