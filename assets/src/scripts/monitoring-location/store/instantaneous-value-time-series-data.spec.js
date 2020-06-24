import {applyMiddleware, combineReducers, createStore} from 'redux';
import {default as thunk} from 'redux-thunk';

import {MOCK_IV_DATA} from '../../mock-service-data';

import {Actions as floodStateActions, floodStateReducer} from './flood-inundation';
import {Actions, ivTimeSeriesDataReducer} from './instantaneous-value-time-series-data';
import {Actions as ivTimeSeriesStateActions, ivTimeSeriesStateReducer} from './instantaneous-value-time-series-state';

describe('monitoring-location/store/instantaneous-value-time-series-data module', () => {
    let store;
    describe('ivTimeSeriesDataReducer module', () => {
        beforeEach(() => {
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
                        currentDateRangeKind: 'P7D',
                        loadingIVTSKeys: []
                    }
                },
                applyMiddleware(thunk)
            );
            jasmine.Ajax.install();
        });

        afterEach(() => {
            jasmine.Ajax.uninstall();
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
                spyOn(Actions, 'addIVTimeSeriesCollection').and.callThrough();
                spyOn(Actions, 'resetIVTimeSeries').and.callThrough();
                spyOn(Actions, 'retrieveCompareIVTimeSeries').and.callThrough();
                spyOn(floodStateActions, 'setGageHeight').and.callThrough();
            });

            it('Service url should contain the siteno and period=P7D', () => {
                store.dispatch(Actions.retrieveIVTimeSeries('12345678'));

                const url = jasmine.Ajax.requests.mostRecent().url;
                expect(url).toContain('sites=12345678');
                expect(url).toContain('period=P7D');
            });

            it('Loading key should be set for this time series before fetch is complete', () => {
                store.dispatch(Actions.retrieveIVTimeSeries('12345678'));

                expect(store.getState().ivTimeSeriesState.loadingIVTSKeys).toContain('current:P7D');
            });

            it('Expect that a successful fetch updates the data and sets the state appropriately', (done) => {
                const promise = store.dispatch(Actions.retrieveIVTimeSeries('12345678'));
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200,
                    responseText: MOCK_IV_DATA
                });
                promise.then(() => {
                    const tsState = store.getState().ivTimeSeriesState;
                    expect(Actions.retrieveCompareIVTimeSeries).toHaveBeenCalled();
                    expect(Actions.addIVTimeSeriesCollection).toHaveBeenCalled();
                    expect(floodStateActions.setGageHeight).toHaveBeenCalled();
                    expect(tsState.loadingIVTSKeys).not.toContain('current:P7D');
                    expect(tsState.showIVTimeSeries.current).toBe(true);
                    expect(tsState.currentIVVariableID).toBe('45807197');
                    done();
                });
            });

            it('Expect that a failed fetch resets the time series and removes the loading key', (done) => {
                const promise = store.dispatch(Actions.retrieveIVTimeSeries('12345678'));
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 500,
                    responseText: 'Internal server error'
                });
                promise.then(() => {
                    const tsState = store.getState().ivTimeSeriesState;
                    expect(Actions.resetIVTimeSeries).toHaveBeenCalled();
                    expect(tsState.loadingIVTSKeys).not.toContain('current:P7D');
                    done();
                });
            });
        });

        describe('Actions.retrieveCompareIVTimeSeries', () => {
            const startDT = 1586793994000;
            const endDT = 1587398794000;
            beforeEach(() => {
                spyOn(Actions, 'addIVTimeSeriesCollection').and.callThrough();
                spyOn(Actions, 'resetIVTimeSeries').and.callThrough();
            });

            it('Service url should contain the siteno, startDT, and endDT', () => {
                store.dispatch(Actions.retrieveCompareIVTimeSeries('12345678', 'P7D', startDT, endDT));

                const url = jasmine.Ajax.requests.mostRecent().url;
                expect(url).toContain('sites=12345678');
                expect(url).toContain('startDT=');
                expect(url).toContain('endDT=');
            });

            it('Loading key should be set for this time series before fetch is complete', () => {
                store.dispatch(Actions.retrieveCompareIVTimeSeries('12345678', 'P7D', startDT, endDT));

                expect(store.getState().ivTimeSeriesState.loadingIVTSKeys).toContain('compare:P7D');
            });

            it('Expect that a successful fetch updates the data and sets the state appropriately', (done) => {
                const promise = store.dispatch(Actions.retrieveCompareIVTimeSeries('12345678', 'P7D', startDT, endDT));
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200,
                    responseText: MOCK_IV_DATA
                });
                promise.then(() => {
                    const tsState = store.getState().ivTimeSeriesState;
                    expect(Actions.addIVTimeSeriesCollection).toHaveBeenCalled();
                    expect(tsState.loadingIVTSKeys).not.toContain('compare:P7D');
                    done();
                });
            });

            it('Expect that a failed fetch resets the time series and removes the loading key', (done) => {
                const promise = store.dispatch(Actions.retrieveCompareIVTimeSeries('12345678', 'P7D', startDT, endDT));
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 500,
                    responseText: 'Internal server error'
                });
                promise.then(() => {
                    const tsState = store.getState().ivTimeSeriesState;
                    expect(Actions.resetIVTimeSeries).toHaveBeenCalled();
                    expect(tsState.loadingIVTSKeys).not.toContain('compare:P7D');
                    done();
                });
            });
        });

        describe('Actions.retrieveCustomTimePeriodIVTimeSeries', () => {
            beforeEach(() => {
                spyOn(Actions, 'addIVTimeSeriesCollection').and.callThrough();
                spyOn(Actions, 'resetIVTimeSeries').and.callThrough();
            });

            it('Service url should contain the siteno, startDT, and endDT', () => {
                store.dispatch(Actions.retrieveCustomTimePeriodIVTimeSeries('12345678', '00060', 'P14D'));

                const url = jasmine.Ajax.requests.mostRecent().url;
                expect(url).toContain('sites=12345678');
                expect(url).toContain('parameterCd=00060');
                expect(url).toContain('period=P14D');
            });

            it('Loading key should be set for this time series before fetch is complete and current date range kind set to custo', () => {
                store.dispatch(Actions.retrieveCustomTimePeriodIVTimeSeries('12345678', '00060', 'P14D'));

                const tsState = store.getState().ivTimeSeriesState;
                expect(tsState.loadingIVTSKeys).toContain('current:custom:00060');
                expect(tsState.currentIVDateRangeKind).toBe('custom');
            });

            it('Expect that a successful fetch updates the data and sets the state appropriately', (done) => {
                const promise = store.dispatch(Actions.retrieveCustomTimePeriodIVTimeSeries('12345678', '00060', 'P14D'));
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200,
                    responseText: MOCK_IV_DATA
                });
                promise.then(() => {
                    const tsState = store.getState().ivTimeSeriesState;
                    expect(Actions.addIVTimeSeriesCollection).toHaveBeenCalled();
                    expect(tsState.currentIVVariableID).toBe(45807197);
                    expect(tsState.loadingIVTSKeys).not.toContain('current:custom:00060');
                    done();
                });
            });

            it('Expect that a failed fetch resets the time series and removes the loading key', (done) => {
                const promise = store.dispatch(Actions.retrieveCustomTimePeriodIVTimeSeries('12345678', '00060', 'P14D'));
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 500,
                    responseText: 'Internal server error'
                });
                promise.then(() => {
                    const tsState = store.getState().ivTimeSeriesState;
                    expect(Actions.resetIVTimeSeries).toHaveBeenCalled();
                    expect(tsState.loadingIVTSKeys).not.toContain('current:custom:00060');
                    done();
                });
            });
        });

        describe('Actions.retrieveCustomIVTimeSeries', () => {
            const startDT = 1586793994000;
            const endDT = 1587398794000;

            beforeEach(() => {
                spyOn(Actions, 'addIVTimeSeriesCollection').and.callThrough();
                spyOn(Actions, 'resetIVTimeSeries').and.callThrough();
                store.dispatch(ivTimeSeriesStateActions.setCurrentIVVariable('45807197'));
            });

            it('Service url should contain the siteno, startDT, and endDT and current parameter code', () => {
                store.dispatch(Actions.retrieveCustomIVTimeSeries('12345678', startDT, endDT));

                const url = jasmine.Ajax.requests.mostRecent().url;
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

            it('Expect that a successful fetch updates the data and sets the state appropriately', (done) => {
                const promise = store.dispatch(Actions.retrieveCustomIVTimeSeries('12345678', startDT, endDT));
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200,
                    responseText: MOCK_IV_DATA
                });
                promise.then(() => {
                    const tsState = store.getState().ivTimeSeriesState;
                    expect(Actions.addIVTimeSeriesCollection).toHaveBeenCalled();
                    expect(tsState.loadingIVTSKeys).not.toContain('current:custom:00060');
                    done();
                });
            });

            it('Expect that a failed fetch resets the time series and removes the loading key', (done) => {
                const promise = store.dispatch(Actions.retrieveCustomIVTimeSeries('12345678', '00060', 'P14D'));
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 500,
                    responseText: 'Internal server error'
                });
                promise.then(() => {
                    const tsState = store.getState().ivTimeSeriesState;
                    expect(Actions.addIVTimeSeriesCollection).toHaveBeenCalledWith({});
                    expect(tsState.loadingIVTSKeys).not.toContain('current:custom:00060');
                    done();
                });
            });
        });

        describe('Actions.retrieveExtendedIVTimeSeries', () => {
            let initialPromise;
            beforeEach(() => {
                spyOn(Actions, 'addIVTimeSeriesCollection').and.callThrough();
                spyOn(Actions, 'resetIVTimeSeries').and.callThrough();
                spyOn(Actions, 'retrieveCompareIVTimeSeries').and.callThrough();
                store.dispatch(ivTimeSeriesStateActions.setCurrentIVVariable('45807197'));
                initialPromise = store.dispatch(Actions.retrieveIVTimeSeries('12345678'));
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200,
                    responseText: MOCK_IV_DATA
                });
            });

            it('Service url should contain the siteno, current parameter code, and period', (done) => {
                initialPromise.then(() => {
                    store.dispatch(Actions.retrieveExtendedIVTimeSeries('12345678', 'P30D'));

                    const url = jasmine.Ajax.requests.mostRecent().url;
                    expect(url).toContain('sites=12345678');
                    expect(url).toContain('startDT=');
                    expect(url).toContain('endDT=');
                    done();
                });
            });

            it('Loading key should be set for this time series before fetch is complete ', (done) => {
                initialPromise.then(() => {
                    store.dispatch(Actions.retrieveExtendedIVTimeSeries('12345678', 'P30D'));

                    expect(store.getState().ivTimeSeriesState.loadingIVTSKeys).toContain('current:P30D:00060');
                    done();
                });
            });

            it('Expect that a successful fetch updates the data and sets the state appropriately', (done) => {
                initialPromise.then(() => {
                    const promise = store.dispatch(Actions.retrieveExtendedIVTimeSeries('12345678', 'P30D:00060'));
                    jasmine.Ajax.requests.mostRecent().respondWith({
                        status: 200,
                        responseText: MOCK_IV_DATA
                    });
                    promise.then(() => {
                        const tsState = store.getState().ivTimeSeriesState;
                        expect(Actions.addIVTimeSeriesCollection).toHaveBeenCalled();
                        expect(Actions.retrieveCompareIVTimeSeries).toHaveBeenCalled();
                        expect(tsState.loadingIVTSKeys).not.toContain('current:P30D');
                        done();
                    });
                });
            });

            it('Expect that a failed fetch resets the time series and removes the loading key', (done) => {
                initialPromise.then(() => {
                    const promise = store.dispatch(Actions.retrieveExtendedIVTimeSeries('12345678', 'P30D'));
                    jasmine.Ajax.requests.mostRecent().respondWith({
                        status: 500,
                        responseText: 'Internal server error'
                    });
                    promise.then(() => {
                        const tsState = store.getState().ivTimeSeriesState;
                        expect(Actions.addIVTimeSeriesCollection).toHaveBeenCalledWith({});
                        expect(tsState.loadingIVTSKeys).not.toContain('current:P30D:00060');
                        done();
                    });
                });
            });
        });

        describe('Actions.updateIVCurrentVariableAndRetrieveTimeSeries', () => {
            const startDT = 1586793994000;
            const endDT = 1587398794000;
            beforeEach(() => {
                spyOn(Actions, 'retrieveCustomIVTimeSeries').and.callThrough();
                spyOn(Actions, 'retrieveExtendedIVTimeSeries').and.callThrough();
            });

            it('Expect to retrieve custom time series if date range kind is custom', () => {
                store.dispatch(ivTimeSeriesStateActions.setCurrentIVDateRangeKind('custom'));
                store.dispatch(ivTimeSeriesStateActions.setCustomIVTimeRange(startDT, endDT));
                store.dispatch(Actions.updateIVCurrentVariableAndRetrieveTimeSeries('12345678', '45807197'));

                expect(store.getState().ivTimeSeriesState.currentIVVariableID).toEqual('45807197');
                expect(Actions.retrieveCustomIVTimeSeries).toHaveBeenCalled();
            });

            it('Expect to retrieve extended time series if date range kind is not custom', (done) => {
                store.dispatch(ivTimeSeriesStateActions.setCurrentIVVariable('45807197'));
                let initialPromise = store.dispatch(Actions.retrieveIVTimeSeries('12345678'));
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200,
                    responseText: MOCK_IV_DATA
                });
                initialPromise.then(() => {
                    store.dispatch(Actions.updateIVCurrentVariableAndRetrieveTimeSeries('12345678', '45807197'));
                    expect(Actions.retrieveExtendedIVTimeSeries).toHaveBeenCalled();
                    done();
                });
            });
        });

        describe('retrieveUserRequestedIVDataForDateRange', () => {
            let mockDispatch;
            let mockGetState;

            beforeEach(() => {
                mockDispatch = jasmine.createSpy('mockDispatch');
                mockGetState = jasmine.createSpy('mockGetState').and.returnValue({
                    ianaTimeZone: 'America/Chicago'
                });

                spyOn(Actions, 'retrieveCustomIVTimeSeries');
            });

            afterEach(() => {
            });

            it('Converts time strings to javascript date/time objects correctly', () => {
                Actions.retrieveUserRequestedIVDataForDateRange('12345678', '2010-01-01', '2010-03-01')(mockDispatch, mockGetState);
                expect(Actions.retrieveCustomIVTimeSeries).toHaveBeenCalled();
                expect(Actions.retrieveCustomIVTimeSeries.calls.argsFor(0)[0]).toEqual('12345678');
                expect(Actions.retrieveCustomIVTimeSeries.calls.argsFor(0)[1]).toEqual(1262325600000);
                expect(Actions.retrieveCustomIVTimeSeries.calls.argsFor(0)[2]).toEqual(1267423200000);
            });
        });
    });
});