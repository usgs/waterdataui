import { configureStore, Actions } from './index';


describe('Redux store', () => {

    describe('asynchronous actions', () => {
        const SITE_NO = '12345678';
        const LOCATION = {
            latitude: 44.8528,
            longitude: -92.2383
        };

        const TEST_STATE = {
            series: {
                requests: {
                    'current:P7D': {}
                },
                variables: {
                    '45807042': {
                        variableCode: {
                            'value': '00060'
                        }
                    },
                    '450807142': {
                        variableCode: {
                            'value': '00010'
                        }
                    }
                },
                queryInfo: {
                    'current:P7D': {
                        notes: {
                            requestDT: new Date(1490936400000),
                            'filter:timeRange': {
                                mode: 'PERIOD',
                                periodDays: 7,
                                modifiedSince: null
                            }
                        }
                    },
                    'current:P30D:00060': {
                        notes: {
                            requestDT: new Date(1490936400000),
                            'filter:timeRange': {
                                mode: 'RANGE',
                                interval: {
                                    start: new Date(1488348000000),
                                    end: new Date(1490936400000)
                                }
                            }
                        }
                    }
                }
            },
            timeSeriesState: {
                currentVariableID: '45807042',
                currentDateRange: 'P7D'
            }
        };

        describe('retrieveLocationTimeZone with good data', () => {
            let mockRetrieveLocationTimeZone;
            let mockDispatch;
            let mockGetState;

            beforeEach(() => {
                mockDispatch = jasmine.createSpy('mockDispatch');
                mockGetState = jasmine.createSpy('mockGetState').and.returnValue(TEST_STATE);
                mockRetrieveLocationTimeZone = jasmine.createSpy('get').and.returnValue(
                    Promise.resolve({
                        'properties': {'timeZone': 'America/Chicago'}
                    })
                );
                configureStore();
            });

            it('fetches data from the weather service', () => {
                Actions.retrieveLocationTimeZone(
                    LOCATION.latitude, LOCATION.longitude, mockRetrieveLocationTimeZone
                )(mockDispatch, mockGetState);
                expect(mockRetrieveLocationTimeZone).toHaveBeenCalledWith(LOCATION.latitude, LOCATION.longitude);
            });

            it('gets the data and sets the timezone', (done) => {
                spyOn(Actions, 'setLocationIanaTimeZone');
                let p = Actions.retrieveLocationTimeZone(
                    LOCATION.latitude, LOCATION.longitude, mockRetrieveLocationTimeZone
                )(mockDispatch, mockGetState);
                p.then(() => {
                    expect(Actions.setLocationIanaTimeZone.calls.count()).toBe(1);
                    expect(Actions.setLocationIanaTimeZone).toHaveBeenCalledWith('America/Chicago');
                    done();
                });
            });
        });

        describe('retrieveLocationTimeZone with bad data', () => {
            let mockQueryWeatherService;
            let mockDispatch;
            let mockGetState;

            beforeEach(() => {
                /* eslint no-use-before-define: 0 */
                mockDispatch = jasmine.createSpy('mockDispatch');
                mockGetState = jasmine.createSpy('mockGetState').and.returnValue(TEST_STATE);
                mockQueryWeatherService = jasmine.createSpy('get').and.returnValue(
                    Promise.reject(Error('Bad data'))
                );
                configureStore();
            });

            it('gets the data and sets the timezone to something', (done) => {
                spyOn(Actions, 'setLocationIanaTimeZone');
                let p = Actions.retrieveLocationTimeZone(
                    LOCATION.latitude, LOCATION.longitude, mockQueryWeatherService
                )(mockDispatch, mockGetState);
                p.then(() => {
                    expect(Actions.setLocationIanaTimeZone.calls.count()).toBe(1);
                    expect(Actions.setLocationIanaTimeZone).toHaveBeenCalledWith(null);
                    done();
                });
            });
        });

        describe('retrieveTimeSeries with good data', () => {
            let mockGetTimeSeries;
            let mockDispatch;
            let mockGetState;

            beforeEach(() => {
                /* eslint no-use-before-define: 0 */
                mockGetTimeSeries = jasmine.createSpy('get').and.returnValue(
                    Promise.resolve(JSON.parse(MOCK_DATA))
                );
                mockDispatch = jasmine.createSpy('mockDispatch');
                mockGetState = jasmine.createSpy('mockGetState').and.returnValue(TEST_STATE);

                configureStore();

                spyOn(Actions, 'addTimeSeriesLoading');
                spyOn(Actions, 'removeTimeSeriesLoading');
            });

            it('Fetches the time series data', () => {
                Actions.retrieveTimeSeries(SITE_NO, null, mockGetTimeSeries)(mockDispatch, mockGetState);

                expect(mockGetTimeSeries).toHaveBeenCalledWith({
                    sites: [SITE_NO],
                    params: null
                });

                expect(Actions.addTimeSeriesLoading.calls.count()).toBe(1);
                expect(Actions.addTimeSeriesLoading.calls.argsFor(0)[0]).toEqual(['current:P7D']);
            });

            it('should fetch the times series, retrieve the compare time series once the time series is fetched and fetch the statistics', (done) => {
                spyOn(Actions, 'addSeriesCollection');
                spyOn(Actions, 'retrieveLocationTimeZone');
                spyOn(Actions, 'retrieveCompareTimeSeries');
                spyOn(Actions, 'toggleTimeSeries');
                spyOn(Actions, 'setCurrentVariable');
                let p = Actions.retrieveTimeSeries(SITE_NO, null, mockGetTimeSeries)(mockDispatch, mockGetState);

                p.then(() => {
                    expect(mockDispatch.calls.count()).toBe(8);
                    expect(Actions.addSeriesCollection.calls.count()).toBe(1);
                    expect(Actions.addSeriesCollection.calls.argsFor(0)[0]).toBe('current');
                    expect(Actions.retrieveLocationTimeZone.calls.count()).toBe(1);
                    expect(Actions.retrieveLocationTimeZone.calls.argsFor(0)).toEqual([42.72027778, -90.8191667]);
                    expect(Actions.removeTimeSeriesLoading.calls.count()).toBe(1);
                    expect(Actions.removeTimeSeriesLoading.calls.argsFor(0)[0]).toEqual(['current:P7D']);
                    expect(Actions.retrieveCompareTimeSeries.calls.count()).toBe(1);
                    expect(Actions.retrieveCompareTimeSeries.calls.argsFor(0)[0]).toBe(SITE_NO);
                    expect(Actions.toggleTimeSeries.calls.count()).toBe(1);
                    expect(Actions.toggleTimeSeries.calls.argsFor(0)).toEqual(['current', true]);
                    expect(Actions.setCurrentVariable.calls.count()).toBe(1);
                    expect(Actions.setCurrentVariable.calls.argsFor(0)).toEqual(['45807197']);

                    done();
                });
            });

            it('The gage height is not set since there is no gage height data', (done) => {
                spyOn(Actions, 'setGageHeight');
                let p = Actions.retrieveTimeSeries(SITE_NO, null, mockGetTimeSeries)(mockDispatch, mockGetState);
                p.then(() => {
                    expect(Actions.setGageHeight).toHaveBeenCalledWith(null);

                    done();
                });
            });
        });

        describe('retrieveTimeSeries with gage height data', () => {
            let mockGetTimeSeries;
            let mockDispatch;
            let mockGetState;
            beforeEach(() => {
                /* eslint no-use-before-define: 0 */
                mockGetTimeSeries = jasmine.createSpy('getTimeSeries').and.returnValue(
                    Promise.resolve(JSON.parse(MOCK_GAGE_DATA))
                );
                mockDispatch = jasmine.createSpy('mockDispatch');
                mockGetState = jasmine.createSpy('mockGetState').and.returnValue(TEST_STATE);
                configureStore();
            });

            it('The gage height is set', (done) => {
                spyOn(Actions, 'setGageHeight');
                let p = Actions.retrieveTimeSeries(SITE_NO, null, mockGetTimeSeries)(mockDispatch, mockGetState);
                p.then(() => {
                    expect(Actions.setGageHeight).toHaveBeenCalledWith(20);

                    done();
                });
            });
        });

        describe('retrieveTimeSeries with bad data', () => {
            let mockGetTimeSeries;
            let mockDispatch;
            let mockGetState;

            beforeEach(() => {
                /* eslint no-use-before-define: 0 */
                mockGetTimeSeries = jasmine.createSpy('getTimeSeries').and.returnValue(
                    Promise.reject(Error('Bad data'))
                );
                mockDispatch = jasmine.createSpy('mockDispatch');
                mockGetState = jasmine.createSpy('mockGetState').and.returnValue(TEST_STATE);

                spyOn(Actions, 'addTimeSeriesLoading');
                spyOn(Actions, 'removeTimeSeriesLoading');
            });


            it('should reset the current time series', (done) => {
                spyOn(Actions, 'resetTimeSeries');
                spyOn(Actions, 'toggleTimeSeries');
                let p = Actions.retrieveTimeSeries(SITE_NO, null, mockGetTimeSeries)(mockDispatch, mockGetState);

                expect(Actions.addTimeSeriesLoading).toHaveBeenCalledWith(['current:P7D']);

                p.then(() => {
                    expect(mockDispatch.calls.count()).toBe(4);
                    expect(Actions.resetTimeSeries.calls.count()).toBe(1);
                    expect(Actions.resetTimeSeries.calls.argsFor(0)[0]).toBe('current:P7D');
                    expect(Actions.toggleTimeSeries.calls.count()).toBe(1);
                    expect(Actions.toggleTimeSeries.calls.argsFor(0)).toEqual(['current', false]);
                    expect(Actions.removeTimeSeriesLoading).toHaveBeenCalledWith(['current:P7D']);

                    done();
                });
            });
        });

        describe('retrieveCompareTimeSeries with good data', () => {
            let mockGetPreviousYearTimeSeries;
            let mockDispatch;
            let mockGetState;

            const START_DATE = new Date(1483250400000);
            const END_DATE = new Date(1483855200000);

            beforeEach(() => {
                /* eslint no-use-before-define: 0 */
                mockGetPreviousYearTimeSeries = jasmine.createSpy('getPreviousYearTimeSeries').and.returnValue(
                    Promise.resolve(JSON.parse(MOCK_LAST_YEAR_DATA))
                );
                mockDispatch = jasmine.createSpy('mockDispatch');
                mockGetState = jasmine.createSpy('mockGetState').and.returnValue(TEST_STATE);
                spyOn(Actions, 'addTimeSeriesLoading');
                spyOn(Actions, 'removeTimeSeriesLoading');
            });

            it('Fetches the previous year\'s time series', () => {
                Actions.retrieveCompareTimeSeries(
                    SITE_NO, 'P7D', START_DATE, END_DATE, mockGetPreviousYearTimeSeries
                )(mockDispatch, mockGetState);

                expect(Actions.addTimeSeriesLoading).toHaveBeenCalledWith(['compare:P7D']);
                expect(mockGetPreviousYearTimeSeries.calls.count()).toBe(1);
                expect(mockGetPreviousYearTimeSeries.calls.argsFor(0)[0]).toEqual({
                    site: SITE_NO,
                    startTime: START_DATE,
                    endTime: END_DATE
                });
            });

            it('Dispatches the action to add the compare time series and to set its visibility to false', (done) => {
                spyOn(Actions, 'addSeriesCollection');
                spyOn(Actions, 'toggleTimeSeries');
                let p = Actions.retrieveCompareTimeSeries(
                    SITE_NO, 'P7D', START_DATE, END_DATE, mockGetPreviousYearTimeSeries
                )(mockDispatch, mockGetState);
                p.then(() => {
                    expect(mockDispatch.calls.count()).toBe(3);
                    expect(Actions.addSeriesCollection.calls.count()).toBe(1);
                    expect(Actions.addSeriesCollection.calls.argsFor(0)[0]).toBe('compare:P7D');
                    expect(Actions.removeTimeSeriesLoading).toHaveBeenCalledWith(['compare:P7D']);

                    done();
                });
            });
        });

        describe('retrieveCompareTimeSeries with bad data', () => {
            let mockGetPreviousYearTimeSeries;
            let mockDispatch;
            let mockGetState;

            const START_DATE = new Date(1483250400000);
            const END_DATE = new Date(1483855200000);

            beforeEach(() => {
                mockGetPreviousYearTimeSeries = jasmine.createSpy('getPreviousYearTimeSeries').and.returnValue(
                    Promise.reject(Error('Bad data'))
                );
                mockDispatch = jasmine.createSpy('mockDispatch');
                mockGetState = jasmine.createSpy('mockGetState').and.returnValue(TEST_STATE);

                spyOn(Actions, 'addTimeSeriesLoading');
                spyOn(Actions, 'removeTimeSeriesLoading');
            });

            it('Dispatches the action to reset the compare time series', (done) => {
                spyOn(Actions, 'resetTimeSeries');
                let p = Actions.retrieveCompareTimeSeries(
                    SITE_NO, 'P7D', START_DATE, END_DATE, mockGetPreviousYearTimeSeries
                )(mockDispatch, mockGetState);

                expect(Actions.addTimeSeriesLoading).toHaveBeenCalledWith(['compare:P7D']);
                p.then(() => {
                    expect(mockDispatch.calls.count()).toBe(3);
                    expect(Actions.resetTimeSeries.calls.count()).toBe(1);
                    expect(Actions.resetTimeSeries.calls.argsFor(0)[0]).toBe('compare:P7D');
                    expect(Actions.removeTimeSeriesLoading).toHaveBeenCalledWith(['compare:P7D']);

                    done();
                });
            });
        });

        describe('retrieveMedianStatistics with data', () => {
            let mockFetchSiteStatistics;
            let mockDispatch;

            beforeEach(() => {
                /* eslint no-use-before-define: 0 */
                mockFetchSiteStatistics = jasmine.createSpy('fetchSiteStatistics').and.returnValue(
                    Promise.resolve({
                        '00010': {
                            '12': [{
                                month_nu: '3'
                            }]
                        }
                    })
                );
                mockDispatch = jasmine.createSpy('mockDispatch');
                configureStore();
                spyOn(Actions, 'addMedianStats');
                spyOn(Actions, 'toggleTimeSeries');

                mockDispatch = jasmine.createSpy('mockDispatch');
            });

            it('should fetch the site statistics and call the appropriate actions', (done) => {
                Actions.retrieveMedianStatistics('12345678', mockFetchSiteStatistics)(mockDispatch).then(() => {
                    expect(mockFetchSiteStatistics).toHaveBeenCalledWith({
                        site: '12345678',
                        statType: 'median'
                    });
                    expect(mockDispatch.calls.count()).toBe(2);
                    expect(Actions.addMedianStats).toHaveBeenCalled();
                    expect(Actions.toggleTimeSeries).toHaveBeenCalledWith('median', true);
                    done();
                });
            });
        });

        describe('retrieveExtendedTimeSeries with data', () => {
            let mockGetTimeSeries;
            let mockDispatch;
            let mockGetState;

            beforeEach(() => {
                mockGetTimeSeries = jasmine.createSpy('getTimeSeries').and.returnValue(
                    Promise.resolve(JSON.parse(MOCK_DATA))
                );
                mockDispatch = jasmine.createSpy('mockDispatch');
                mockGetState = jasmine.createSpy('mockGetState');

                spyOn(Actions, 'addTimeSeriesLoading');
                spyOn(Actions, 'removeTimeSeriesLoading');
            });

            it('Should dispatch the action to set the current date range', () => {
                mockGetState.and.returnValue(TEST_STATE);
                Actions.retrieveExtendedTimeSeries(
                    '12345678', 'P30D', mockGetTimeSeries
                )(mockDispatch, mockGetState);
                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SET_CURRENT_DATE_RANGE',
                    period: 'P30D'
                });
                expect(Actions.addTimeSeriesLoading).toHaveBeenCalledWith(['current:P30D:00060']);
            });

            it('Should call getTimeSeries with the appropriate parameters', () => {
                mockGetState.and.returnValue(TEST_STATE);
                Actions.retrieveExtendedTimeSeries(
                    '12345678', 'P30D', mockGetTimeSeries
                )(mockDispatch, mockGetState);

                expect(mockGetTimeSeries).toHaveBeenCalled();
                const args = mockGetTimeSeries.calls.argsFor(0)[0];
                expect(args.sites).toEqual(['12345678']);
                expect(args.params).toEqual(['00060']);
                expect(args.endDate).toEqual(new Date(1490936400000));
            });

            it('Should dispatch add series collection and retrieveCompareTimeSeries', (done) => {
                mockGetState.and.returnValue(TEST_STATE);
                spyOn(Actions, 'retrieveCompareTimeSeries');
                spyOn(Actions, 'addSeriesCollection');
                let p = Actions.retrieveExtendedTimeSeries(
                    '12345678', 'P30D', mockGetTimeSeries
                )(mockDispatch, mockGetState);
                p.then(() => {
                    expect(mockDispatch.calls.count()).toBe(5);
                    expect(Actions.addSeriesCollection).toHaveBeenCalled();
                    expect(Actions.addSeriesCollection.calls.argsFor(0)[0]).toEqual('current:P30D:00060');
                    expect(Actions.retrieveCompareTimeSeries).toHaveBeenCalled();
                    expect(Actions.retrieveCompareTimeSeries.calls.argsFor(0)[1]).toEqual('P30D');
                    expect(Actions.removeTimeSeriesLoading).toHaveBeenCalledWith(['current:P30D:00060']);
                    done();
                });
            });

            it('Should not retrieve the time series if it has already been retrieved', () => {
                mockGetState.and.returnValue(Object.assign({}, TEST_STATE, {
                    series: Object.assign({}, TEST_STATE.series, {
                        requests: Object.assign({}, TEST_STATE.series.requests, {
                            'current:P30D:00060': {}
                        })
                    })
                }));
                Actions.retrieveExtendedTimeSeries(
                    '12345678', 'P30D', mockGetTimeSeries
                )(mockDispatch, mockGetState);
                expect(mockGetTimeSeries).not.toHaveBeenCalled();
                expect(Actions.addTimeSeriesLoading).not.toHaveBeenCalled();
                expect(Actions.removeTimeSeriesLoading).not.toHaveBeenCalled();
            });
        });

        describe('retrieveExtendedTimeSeries with bad data', () => {
            let mockGetTimeSeries;
            let mockDispatch;
            let mockGetState;
            const TEST_STATE = {
                series: {
                    requests: {
                        'current:P7D': {}
                    },
                    variables: {
                        '45807042': {
                            variableCode: {
                                'value': '00060'
                            }
                        },
                        '450807142': {
                            variableCode: {
                                'value': '00010'
                            }
                        }
                    },
                    queryInfo: {
                        'current:P7D': {
                            notes: {
                                requestDT: new Date(1490936400000),
                                'filter:timeRange': {
                                    mode: 'PERIOD',
                                    periodDays: 7,
                                    modifiedSince: null
                                }
                            }
                        },
                        'current:P30D:00060': {
                            notes: {
                                requestDT: new Date(1490936400000),
                                'filter:timeRange': {
                                    mode: 'RANGE',
                                    interval: {
                                        start: new Date(1488348000000),
                                        end: new Date(149093640000)
                                    }
                                }
                            }
                        }
                    }
                },
                timeSeriesState: {
                    currentVariableID: '45807042',
                    currentDateRange: 'P7D'
                }
            };

            beforeEach(() => {
                mockGetTimeSeries = jasmine.createSpy('getTimeSeries').and.returnValue(
                    Promise.reject(Error('Bad data'))
                );
                mockDispatch = jasmine.createSpy('mockDispatch');
                mockGetState = jasmine.createSpy('mockGetState');

                mockGetState.and.returnValue(Object.assign({}, TEST_STATE, {
                    timeSeriesState : Object.assign({}, TEST_STATE.timeSeriesState, {
                        currentDateRange: 'P30D'
                    })
                }));

                spyOn(Actions, 'addTimeSeriesLoading');
                spyOn(Actions, 'removeTimeSeriesLoading');
            });

            it('Should add the series with an empty collection', (done) => {
                let p = Actions.retrieveExtendedTimeSeries(
                    '12345678', 'P30D', mockGetTimeSeries
                )(mockDispatch, mockGetState);

                expect(Actions.addTimeSeriesLoading).toHaveBeenCalledWith(['current:P30D:00060']);
                p.then(() => {
                    expect(mockDispatch.calls.count()).toBe(4);
                    let arg = mockDispatch.calls.argsFor(2)[0];
                    expect(arg.type).toBe('ADD_TIME_SERIES_COLLECTION');
                    expect(arg.key).toBe('current:P30D:00060');
                    expect(arg.data).toEqual({});
                    expect(Actions.removeTimeSeriesLoading).toHaveBeenCalledWith(['current:P30D:00060']);


                    done();
                });
            });

        });

        describe('retrieveFloodData with data', () => {
            let mockFetchFloodFeatures;
            let mockFetchFloodExtent;
            let mockDispatch;

            beforeEach(() => {
                mockFetchFloodFeatures = jasmine.createSpy('fetchFloodFeatures').and.returnValue(
                    Promise.resolve([{
                        attributes: {
                            USGSI: '03341500',
                            STAGE: 30
                        }
                    }, {
                        attributes: {
                            USGSID: '03341500',
                            STAGE: 29
                        }
                    }, {
                        attributes: {
                            USGSID: '03341500',
                            STAGE: 28
                        }
                    }])
                );
                mockFetchFloodExtent = jasmine.createSpy('fetchFloodExtent').and.returnValue(
                    Promise.resolve({
                        extent: {
                            xmin: -84.35321,
                            ymin: 34.01666,
                            xmax: 84.22346,
                            ymax: 34.1010
                        },
                        spatialReference: {
                            wkid: 4326,
                            latestWkid: 4326
                        }
                    })
                );
                mockDispatch = jasmine.createSpy('mockDispatch');
            });

            it('Make fetch call for both features and extent', () => {
                Actions.retrieveFloodData(
                    SITE_NO, mockFetchFloodFeatures, mockFetchFloodExtent
                )(mockDispatch);

                expect(mockFetchFloodFeatures).toHaveBeenCalledWith(SITE_NO);
                expect(mockFetchFloodExtent).toHaveBeenCalledWith(SITE_NO);
            });

            it('dispatches a setFloodFeatures action after promises are resolved', (done) => {
                spyOn(Actions, 'setFloodFeatures').and.callThrough();
                let p = Actions.retrieveFloodData(
                    SITE_NO, mockFetchFloodFeatures, mockFetchFloodExtent
                )(mockDispatch);

                p.then(() => {
                    expect(mockDispatch).toHaveBeenCalled();
                    expect(Actions.setFloodFeatures).toHaveBeenCalledWith([28, 29, 30], {
                        xmin: -84.35321,
                        ymin: 34.01666,
                        xmax: 84.22346,
                        ymax: 34.1010
                    });

                    done();
                });
            });
        });

        describe('retrieveFloodData with no data', () => {
            let mockFetchFloodFeatures;
            let mockFetchFloodExtent;
            let mockDispatch;

            const SITE_NO = '12345678';
            beforeEach(() => {
                mockFetchFloodFeatures = jasmine.createSpy('fetchFloodFeatures').and.returnValue(
                    Promise.resolve([])
                );
                mockFetchFloodExtent = jasmine.createSpy('fetchFloodExtent').and.returnValue(
                    Promise.resolve({
                        xmin: 'NaN',
                        ymin: 'NaN',
                        xmax: 'NaN',
                        ymax: 'NaN'
                    })
                );
                mockDispatch = jasmine.createSpy('mockDispatch');

            });

            it('dispatches a setFloodFeatures action after promises are resolved', (done) => {
                spyOn(Actions, 'setFloodFeatures').and.callThrough();
                let p = Actions.retrieveFloodData(
                    SITE_NO, mockFetchFloodFeatures, mockFetchFloodExtent
                )(mockDispatch);

                p.then(() => {
                    expect(mockDispatch).toHaveBeenCalled();
                    expect(Actions.setFloodFeatures).toHaveBeenCalledWith([], {});


                    done();
                });
            });
        });

        describe('startTimeSeriesPlay', () => {

            let mockDispatch, mockGetState;

            beforeEach(() => {
                mockDispatch = jasmine.createSpy('mockDispatch');
                mockGetState = jasmine.createSpy('mockGetState');

                jasmine.clock().install();
                spyOn(Actions, 'setCursorOffset');
                spyOn(Actions, 'timeSeriesPlayOn');
                spyOn(Actions, 'stopTimeSeriesPlay');
            });

            afterEach(() => {
                jasmine.clock().uninstall();
            });

            it('Does not reset the cursor offset when current offset is not null or greater than the max offset ', () => {
                mockGetState.and.returnValues({
                    timeSeriesState: {
                        cursorOffset: 0
                    }
                });
                Actions.startTimeSeriesPlay(2700000)(mockDispatch, mockGetState);

                expect(Actions.setCursorOffset).not.toHaveBeenCalled();
            });

            it('Call the action to start time series play', () => {
                mockGetState.and.returnValues({
                    timeSeriesState: {
                        cursorOffset: 0
                    }
                });
                Actions.startTimeSeriesPlay(2700000)(mockDispatch, mockGetState);

                expect(Actions.timeSeriesPlayOn).toHaveBeenCalled();
            });

            it('Expects the cursor to be updated after 10 milliseconds', () => {
                mockGetState.and.returnValues({
                    timeSeriesState: {
                        cursorOffset: 0
                    }
                }, {
                    timeSeriesState: {
                        cursorOffset: 0
                    }
                });
                Actions.startTimeSeriesPlay(2700000)(mockDispatch, mockGetState);
                jasmine.clock().tick(11);

                expect(Actions.setCursorOffset.calls.count()).toBe(1);
                expect(Actions.setCursorOffset.calls.argsFor(0)[0]).toBe(900000);
            });

            it('Expects the cursor to be reset if the cursor offset is greater than the maxCursorOffset', () => {
                mockGetState.and.returnValues({
                    timeSeriesState: {
                        cursorOffset: 2700000
                    }
                });

                Actions.startTimeSeriesPlay(2700000)(mockDispatch, mockGetState);

                expect(Actions.setCursorOffset).toHaveBeenCalledWith(0);
            });

            it('Expects the play to be stopped if the cursorOffset exceeds the maxCursorOffset', () => {
                mockGetState.and.returnValues({
                    timeSeriesState: {
                        cursorOffset: 2100000
                    }
                }, {
                    timeSeriesState: {
                        cursorOffset: 2100000
                    }
                });
                Actions.startTimeSeriesPlay(2700000)(mockDispatch, mockGetState);
                jasmine.clock().tick(11);

                expect(Actions.stopTimeSeriesPlay).toHaveBeenCalled();
            });
        });

        describe('stopTimeSeriesPlay', () => {
            let mockDispatch, mockGetState;

            beforeEach(() => {
                mockDispatch = jasmine.createSpy('mockDispatch');
                mockGetState = jasmine.createSpy('mockGetState');

                jasmine.clock().install();
                spyOn(Actions, 'timeSeriesPlayStop');
            });

            it('Expects that timeSeriesPlayStop is called', () => {
                mockGetState.and.returnValues({
                    timeSeriesState: {
                        audiblePlayId: 1
                    }
                });

                Actions.stopTimeSeriesPlay()(mockDispatch, mockGetState);
                expect(Actions.timeSeriesPlayStop).toHaveBeenCalled();
            });
        });
    });

    describe('synchronous actions', () => {
        it('should create an action to add the time series loading keys', () => {
            expect(Actions.addTimeSeriesLoading(['current', 'compare'])).toEqual({
                type: 'TIME_SERIES_LOADING_ADD',
                tsKeys: ['current', 'compare']
            });
        });
        it('should create an action to remove the time series loading keys', () => {
            expect(Actions.removeTimeSeriesLoading(['current', 'compare'])).toEqual({
                type: 'TIME_SERIES_LOADING_REMOVE',
                tsKeys: ['current', 'compare']
            });
        });
        it('should create an action to set flood features state', () => {
            expect(Actions.setFloodFeatures([9, 10, 11], {xmin: -87, ymin: 42, xmax: -86, ymax: 43})).toEqual({
                type: 'SET_FLOOD_FEATURES',
                stages: [9, 10, 11],
                extent: {xmin: -87, ymin: 42, xmax: -86, ymax: 43}
            });
        });

        it('should create an action to update the gage height state', () => {
            expect(Actions.setGageHeight(10)).toEqual({
                type: 'SET_GAGE_HEIGHT',
                gageHeight: 10
            });
        });

        it('if gageHeight index is in the stages array, dispatch the setGageHeight action', () => {
            let mockDispatch = jasmine.createSpy('mockDispatch');
            let mockGetState = jasmine.createSpy('mockGetState');
            mockGetState.and.returnValues({
                floodData: {
                    stages: [9, 10, 11]
                }
            });
            Actions.setGageHeightFromStageIndex(1)(mockDispatch, mockGetState);
            expect(mockDispatch.calls.count()).toBe(1);
            expect(mockDispatch.calls.argsFor({
                type: 'SET_GAGE_HEIGHT',
                gageHeight: 10
            }));
        });

        it('if gageHeight index is outside the boundes of stages array, do not dispatch the action', () => {
            let mockDispatch = jasmine.createSpy('mockDispatch');
            let mockGetState = jasmine.createSpy('mockGetState');
            mockGetState.and.returnValues({
                floodData: {
                    stages: [9, 10, 11]
                }
            });
            Actions.setGageHeightFromStageIndex(3)(mockDispatch, mockGetState);
            expect(mockDispatch).not.toHaveBeenCalled();
        });

        it('should create an action to toggle time series view state', () => {
            expect(Actions.toggleTimeSeries('current', true)).toEqual({
                type: 'TOGGLE_TIME_SERIES',
                key: 'current',
                show: true
            });
        });

        it('should create an action to add a time series collection', () => {
            expect(Actions.addSeriesCollection('current', 'collection')).toEqual({
                type: 'ADD_TIME_SERIES_COLLECTION',
                key: 'current',
                data: 'collection'
            });
        });

        it('should create an action to reset a time series', () => {
            expect(Actions.resetTimeSeries('current')).toEqual({
                type: 'RESET_TIME_SERIES',
                key: 'current'
            });
        });

        it('should create an actions to set the median stats', () => {
            expect(Actions.addMedianStats({
                '00010': 'some data'
            })).toEqual({
                type: 'MEDIAN_STATS_ADD',
                data: {
                    '00010': 'some data'
                }
            });
        });

        it('should create an action to resize plot', () => {
            expect(Actions.resizeUI(800, 100)).toEqual({
                type: 'RESIZE_UI',
                windowWidth: 800,
                width: 100
            });
        });

        it('should create an action to set the cursor offset', () => {
            expect(Actions.setCursorOffset(10)).toEqual({
                type: 'SET_CURSOR_OFFSET',
                cursorOffset: 10
            });
        });

        it('should create an action to set the playId', () => {
            expect(Actions.timeSeriesPlayOn(1)).toEqual({
                type: 'TIME_SERIES_PLAY_ON',
                playId: 1
            });
        });

        it('should create an action to unset the playId', () => {
            expect(Actions.timeSeriesPlayStop()).toEqual({
                type: 'TIME_SERIES_PLAY_STOP'
            });
        });

        it('should create an action to set the location IANA time zone', () => {
            expect(Actions.setLocationIanaTimeZone('America/Chicago')).toEqual({
                type: 'LOCATION_IANA_TIME_ZONE_SET',
                ianaTimeZone: 'America/Chicago'
            });
        });
    });
});


const MOCK_LAST_YEAR_DATA = `
{"name" : "ns1:timeSeriesResponseType",
"declaredType" : "org.cuahsi.waterml.TimeSeriesResponseType",
"scope" : "javax.xml.bind.JAXBElement$GlobalScope",
"value" : {
  "queryInfo" : {
    "queryURL" : "http://waterservices.usgs.gov/nwis/iv/sites=12345678&parameterCd=00060&period=P7D&indent=on&siteStatus=all&format=json",
    "criteria" : {
      "locationParam" : "[ALL:12345678]",
      "variableParam" : "[00060]",
      "parameter" : [ ]
    },
    "note" : [ {
      "value" : "[ALL:12345678]",
      "title" : "filter:sites"
    }, {
      "value" : "[mode=PERIOD, period=P7D, modifiedSince=null]",
      "title" : "filter:timeRange"
    }, {
      "value" : "methodIds=[ALL]",
      "title" : "filter:methodId"
    }, {
      "value" : "2017-01-09T20:46:07.542Z",
      "title" : "requestDT"
    }, {
      "value" : "1df59e50-f57e-11e7-8ba8-6cae8b663fb6",
      "title" : "requestId"
    }, {
      "value" : "Provisional data are subject to revision. Go to http://waterdata.usgs.gov/nwis/help/?provisional for more information.",
      "title" : "disclaimer"
    }, {
      "value" : "vaas01",
      "title" : "server"
    } ]
  },
  "timeSeries" : [ {
    "sourceInfo" : {
      "siteName" : "GRANT RIVER AT BURTON, WI",
      "siteCode" : [ {
        "value" : "12345678",
        "network" : "NWIS",
        "agencyCode" : "USGS"
      } ],
      "timeZoneInfo" : {
        "defaultTimeZone" : {
          "zoneOffset" : "-06:00",
          "zoneAbbreviation" : "CST"
        },
        "daylightSavingsTimeZone" : {
          "zoneOffset" : "-05:00",
          "zoneAbbreviation" : "CDT"
        },
        "siteUsesDaylightSavingsTime" : true
      },
      "geoLocation" : {
        "geogLocation" : {
          "srs" : "EPSG:4326",
          "latitude" : 42.72027778,
          "longitude" : -90.8191667
        },
        "localSiteXY" : [ ]
      },
      "note" : [ ],
      "siteType" : [ ],
      "siteProperty" : [ {
        "value" : "ST",
        "name" : "siteTypeCd"
      }, {
        "value" : "07060003",
        "name" : "hucCd"
      }, {
        "value" : "55",
        "name" : "stateCd"
      }, {
        "value" : "55043",
        "name" : "countyCd"
      } ]
    },
    "variable" : {
      "variableCode" : [ {
        "value" : "00060",
        "network" : "NWIS",
        "vocabulary" : "NWIS:UnitValues",
        "variableID" : 45807197,
        "default" : true
      } ],
      "variableName" : "Streamflow, ft&#179;/s",
      "variableDescription" : "Discharge, cubic feet per second",
      "valueType" : "Derived Value",
      "unit" : {
        "unitCode" : "ft3/s"
      },
      "options" : {
        "option" : [ {
          "name" : "Statistic",
          "optionCode" : "00000"
        } ]
      },
      "note" : [ ],
      "noDataValue" : -999999.0,
      "variableProperty" : [ ],
      "oid" : "45807197"
    },
    "values" : [ {
      "value" : [ {
        "value" : "302",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T15:00:00.000-06:00"
      }, {
        "value" : "301",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T15:15:00.000-06:00"
      }, {
        "value" : "302",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T15:30:00.000-06:00"
      }, {
        "value" : "301",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T15:45:00.000-06:00"
      }, {
        "value" : "300",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T16:00:00.000-06:00"
      }, {
        "value" : "302",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T16:15:00.000-06:00"
      }, {
        "value" : "300",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T16:30:00.000-06:00"
      }, {
        "value" : "300",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T16:45:00.000-06:00"
      }],
      "qualifier" : [ {
        "qualifierCode" : "P",
        "qualifierDescription" : "Provisional data subject to revision.",
        "qualifierID" : 0,
        "network" : "NWIS",
        "vocabulary" : "uv_rmk_cd"
      } ],
      "qualityControlLevel" : [ ],
      "method" : [ {
        "methodDescription" : "",
        "methodID" : 158049
      } ],
      "source" : [ ],
      "offset" : [ ],
      "sample" : [ ],
      "censorCode" : [ ]
    } ],
    "name" : "USGS:12345678:00060:00000"
  } ]
},
"nil" : false,
"globalScope" : true,
"typeSubstituted" : false
}`
;

const MOCK_GAGE_DATA = `
{"name" : "ns1:timeSeriesResponseType",
"declaredType" : "org.cuahsi.waterml.TimeSeriesResponseType",
"scope" : "javax.xml.bind.JAXBElement$GlobalScope",
"value" : {
  "queryInfo" : {
    "queryURL" : "http://waterservices.usgs.gov/nwis/iv/sites=12345678&parameterCd=00065&period=P7D&indent=on&siteStatus=all&format=json",
    "criteria" : {
      "locationParam" : "[ALL:12345678]",
      "variableParam" : "[00065]",
      "parameter" : [ ]
    },
    "note" : [ {
      "value" : "[ALL:12345678]",
      "title" : "filter:sites"
    }, {
      "value" : "[mode=PERIOD, period=P7D, modifiedSince=null]",
      "title" : "filter:timeRange"
    }, {
      "value" : "methodIds=[ALL]",
      "title" : "filter:methodId"
    }, {
      "value" : "2017-01-09T20:46:07.542Z",
      "title" : "requestDT"
    }, {
      "value" : "1df59e50-f57e-11e7-8ba8-6cae8b663fb6",
      "title" : "requestId"
    }, {
      "value" : "Provisional data are subject to revision. Go to http://waterdata.usgs.gov/nwis/help/?provisional for more information.",
      "title" : "disclaimer"
    }, {
      "value" : "vaas01",
      "title" : "server"
    } ]
  },
  "timeSeries" : [ {
    "sourceInfo" : {
      "siteName" : "GRANT RIVER AT BURTON, WI",
      "siteCode" : [ {
        "value" : "12345678",
        "network" : "NWIS",
        "agencyCode" : "USGS"
      } ],
      "timeZoneInfo" : {
        "defaultTimeZone" : {
          "zoneOffset" : "-06:00",
          "zoneAbbreviation" : "CST"
        },
        "daylightSavingsTimeZone" : {
          "zoneOffset" : "-05:00",
          "zoneAbbreviation" : "CDT"
        },
        "siteUsesDaylightSavingsTime" : true
      },
      "geoLocation" : {
        "geogLocation" : {
          "srs" : "EPSG:4326",
          "latitude" : 42.72027778,
          "longitude" : -90.8191667
        },
        "localSiteXY" : [ ]
      },
      "note" : [ ],
      "siteType" : [ ],
      "siteProperty" : [ {
        "value" : "ST",
        "name" : "siteTypeCd"
      }, {
        "value" : "07060003",
        "name" : "hucCd"
      }, {
        "value" : "55",
        "name" : "stateCd"
      }, {
        "value" : "55043",
        "name" : "countyCd"
      } ]
    },
    "variable" : {
      "variableCode" : [ {
        "value" : "00065",
        "network" : "NWIS",
        "vocabulary" : "NWIS:UnitValues",
        "variableID" : 45807197,
        "default" : true
      } ],
      "variableName" : "Gage Height",
      "variableDescription" : "Gage Height feet",
      "valueType" : "Derived Value",
      "unit" : {
        "unitCode" : "ft"
      },
      "options" : {
        "option" : [ {
          "name" : "Statistic",
          "optionCode" : "00000"
        } ]
      },
      "note" : [ ],
      "noDataValue" : -999999.0,
      "variableProperty" : [ ],
      "oid" : "45807197"
    },
    "values" : [ {
      "value" : [ {
        "value" : "10",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T15:00:00.000-06:00"
      }, {
        "value" : "12",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T15:15:00.000-06:00"
      }, {
        "value" : "32",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T15:30:00.000-06:00"
      }, {
        "value" : "30",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T15:45:00.000-06:00"
      }, {
        "value" : "26",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T16:00:00.000-06:00"
      }, {
        "value" : "27",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T16:15:00.000-06:00"
      }, {
        "value" : "19",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T16:30:00.000-06:00"
      }, {
        "value" : "20",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T16:45:00.000-06:00"
      }],
      "qualifier" : [ {
        "qualifierCode" : "P",
        "qualifierDescription" : "Provisional data subject to revision.",
        "qualifierID" : 0,
        "network" : "NWIS",
        "vocabulary" : "uv_rmk_cd"
      } ],
      "qualityControlLevel" : [ ],
      "method" : [ {
        "methodDescription" : "",
        "methodID" : 158049
      } ],
      "source" : [ ],
      "offset" : [ ],
      "sample" : [ ],
      "censorCode" : [ ]
    } ],
    "name" : "USGS:12345678:00060:00000"
  } ]
},
"nil" : false,
"globalScope" : true,
"typeSubstituted" : false
}`
;

const MOCK_DATA = `
{"name" : "ns1:timeSeriesResponseType",
"declaredType" : "org.cuahsi.waterml.TimeSeriesResponseType",
"scope" : "javax.xml.bind.JAXBElement$GlobalScope",
"value" : {
  "queryInfo" : {
    "queryURL" : "http://waterservices.usgs.gov/nwis/iv/sites=12345678&parameterCd=00060&period=P7D&indent=on&siteStatus=all&format=json",
    "criteria" : {
      "locationParam" : "[ALL:12345678]",
      "variableParam" : "[00060]",
      "parameter" : [ ]
    },
    "note" : [ {
      "value" : "[ALL:12345678]",
      "title" : "filter:sites"
    }, {
      "value" : "[mode=PERIOD, period=P7D, modifiedSince=null]",
      "title" : "filter:timeRange"
    }, {
      "value" : "methodIds=[ALL]",
      "title" : "filter:methodId"
    }, {
      "value" : "2018-01-09T20:46:07.542Z",
      "title" : "requestDT"
    }, {
      "value" : "1df59e50-f57e-11e7-8ba8-6cae8b663fb6",
      "title" : "requestId"
    }, {
      "value" : "Provisional data are subject to revision. Go to http://waterdata.usgs.gov/nwis/help/?provisional for more information.",
      "title" : "disclaimer"
    }, {
      "value" : "vaas01",
      "title" : "server"
    } ]
  },
  "timeSeries" : [ {
    "sourceInfo" : {
      "siteName" : "GRANT RIVER AT BURTON, WI",
      "siteCode" : [ {
        "value" : "12345678",
        "network" : "NWIS",
        "agencyCode" : "USGS"
      } ],
      "timeZoneInfo" : {
        "defaultTimeZone" : {
          "zoneOffset" : "-06:00",
          "zoneAbbreviation" : "CST"
        },
        "daylightSavingsTimeZone" : {
          "zoneOffset" : "-05:00",
          "zoneAbbreviation" : "CDT"
        },
        "siteUsesDaylightSavingsTime" : true
      },
      "geoLocation" : {
        "geogLocation" : {
          "srs" : "EPSG:4326",
          "latitude" : 42.72027778,
          "longitude" : -90.8191667
        },
        "localSiteXY" : [ ]
      },
      "note" : [ ],
      "siteType" : [ ],
      "siteProperty" : [ {
        "value" : "ST",
        "name" : "siteTypeCd"
      }, {
        "value" : "07060003",
        "name" : "hucCd"
      }, {
        "value" : "55",
        "name" : "stateCd"
      }, {
        "value" : "55043",
        "name" : "countyCd"
      } ]
    },
    "variable" : {
      "variableCode" : [ {
        "value" : "00060",
        "network" : "NWIS",
        "vocabulary" : "NWIS:UnitValues",
        "variableID" : 45807197,
        "default" : true
      } ],
      "variableName" : "Streamflow, ft&#179;/s",
      "variableDescription" : "Discharge, cubic feet per second",
      "valueType" : "Derived Value",
      "unit" : {
        "unitCode" : "ft3/s"
      },
      "options" : {
        "option" : [ {
          "name" : "Statistic",
          "optionCode" : "00000"
        } ]
      },
      "note" : [ ],
      "noDataValue" : -999999.0,
      "variableProperty" : [ ],
      "oid" : "45807197"
    },
    "values" : [ {
      "value" : [ {
        "value" : "302",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T15:00:00.000-06:00"
      }, {
        "value" : "301",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T15:15:00.000-06:00"
      }, {
        "value" : "302",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T15:30:00.000-06:00"
      }, {
        "value" : "301",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T15:45:00.000-06:00"
      }, {
        "value" : "300",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T16:00:00.000-06:00"
      }, {
        "value" : "302",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T16:15:00.000-06:00"
      }, {
        "value" : "300",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T16:30:00.000-06:00"
      }, {
        "value" : "300",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T16:45:00.000-06:00"
      }, {
        "value" : "299",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T17:00:00.000-06:00"
      }, {
        "value" : "300",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T17:15:00.000-06:00"
      }, {
        "value" : "299",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T17:30:00.000-06:00"
      }, {
        "value" : "297",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T17:45:00.000-06:00"
      }, {
        "value" : "297",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T18:00:00.000-06:00"
      }, {
        "value" : "296",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T18:15:00.000-06:00"
      }, {
        "value" : "295",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T18:30:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T18:45:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T19:00:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T19:15:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T19:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T19:45:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T20:00:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T20:15:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T20:30:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T20:45:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T21:00:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T21:15:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T21:30:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T21:45:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T22:00:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T22:15:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T22:30:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T22:45:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T23:00:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T23:15:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T23:30:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T23:45:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T00:00:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T00:15:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T00:30:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T00:45:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T01:00:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T01:15:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T01:30:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T01:45:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T02:00:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T02:15:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T02:30:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T02:45:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T03:00:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T03:15:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T03:30:00.000-06:00"
      }, {
        "value" : "284",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T03:45:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T04:00:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T04:15:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T04:30:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T04:45:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T05:00:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T05:15:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T05:30:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T05:45:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T06:00:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T06:15:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T06:30:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T06:45:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T07:00:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T07:15:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T07:30:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T07:45:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T08:00:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T08:15:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T08:30:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T08:45:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T09:00:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T09:15:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T09:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T09:45:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T10:00:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T10:15:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T10:30:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T10:45:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T11:00:00.000-06:00"
      }, {
        "value" : "295",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T11:15:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T11:30:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T11:45:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T12:00:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T12:15:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T12:30:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T12:45:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T13:00:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T13:15:00.000-06:00"
      }, {
        "value" : "295",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T13:30:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T13:45:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T14:00:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T14:15:00.000-06:00"
      }, {
        "value" : "296",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T14:30:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T14:45:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T15:00:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T15:15:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T15:30:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T15:45:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T16:00:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T16:15:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T16:30:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T16:45:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T17:00:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T17:15:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T17:30:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T17:45:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T18:00:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T18:15:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T18:30:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T18:45:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T19:00:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T19:15:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T19:30:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T19:45:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T20:00:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T20:15:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T20:30:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T20:45:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T21:00:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T21:15:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T21:30:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T21:45:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T22:00:00.000-06:00"
      }, {
        "value" : "284",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T22:15:00.000-06:00"
      }, {
        "value" : "284",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T22:30:00.000-06:00"
      }, {
        "value" : "283",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T22:45:00.000-06:00"
      }, {
        "value" : "283",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T23:00:00.000-06:00"
      }, {
        "value" : "284",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T23:15:00.000-06:00"
      }, {
        "value" : "283",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T23:30:00.000-06:00"
      }, {
        "value" : "283",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T23:45:00.000-06:00"
      }, {
        "value" : "283",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T00:00:00.000-06:00"
      }, {
        "value" : "284",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T00:15:00.000-06:00"
      }, {
        "value" : "283",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T00:30:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T00:45:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T01:00:00.000-06:00"
      }, {
        "value" : "283",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T01:15:00.000-06:00"
      }, {
        "value" : "283",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T01:30:00.000-06:00"
      }, {
        "value" : "283",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T01:45:00.000-06:00"
      }, {
        "value" : "281",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T02:00:00.000-06:00"
      }, {
        "value" : "281",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T02:15:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T02:30:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T02:45:00.000-06:00"
      }, {
        "value" : "281",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T03:00:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T03:15:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T03:30:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T03:45:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T04:00:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T04:15:00.000-06:00"
      }, {
        "value" : "281",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T04:30:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T04:45:00.000-06:00"
      }, {
        "value" : "280",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T05:00:00.000-06:00"
      }, {
        "value" : "280",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T05:15:00.000-06:00"
      }, {
        "value" : "281",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T05:30:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T05:45:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T06:00:00.000-06:00"
      }, {
        "value" : "278",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T06:15:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T06:30:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T06:45:00.000-06:00"
      }, {
        "value" : "278",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T07:00:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T07:15:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T07:30:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T07:45:00.000-06:00"
      }, {
        "value" : "276",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T08:00:00.000-06:00"
      }, {
        "value" : "276",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T08:15:00.000-06:00"
      }, {
        "value" : "275",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T08:30:00.000-06:00"
      }, {
        "value" : "275",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T08:45:00.000-06:00"
      }, {
        "value" : "275",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T09:00:00.000-06:00"
      }, {
        "value" : "274",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T09:15:00.000-06:00"
      }, {
        "value" : "274",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T09:30:00.000-06:00"
      }, {
        "value" : "274",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T09:45:00.000-06:00"
      }, {
        "value" : "274",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T10:00:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T10:15:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T10:30:00.000-06:00"
      }, {
        "value" : "274",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T10:45:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T11:00:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T11:15:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T11:30:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T11:45:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T12:00:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T12:15:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T12:30:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T12:45:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T13:00:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T13:15:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T13:30:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T13:45:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T14:00:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T14:15:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T14:30:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T14:45:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T15:00:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T15:15:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T15:30:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T15:45:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T16:00:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T16:15:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T16:30:00.000-06:00"
      }, {
        "value" : "269",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T16:45:00.000-06:00"
      }, {
        "value" : "269",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T17:00:00.000-06:00"
      }, {
        "value" : "267",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T17:15:00.000-06:00"
      }, {
        "value" : "268",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T17:30:00.000-06:00"
      }, {
        "value" : "266",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T17:45:00.000-06:00"
      }, {
        "value" : "267",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T18:00:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T18:15:00.000-06:00"
      }, {
        "value" : "266",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T18:30:00.000-06:00"
      }, {
        "value" : "266",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T18:45:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T19:00:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T19:15:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T19:30:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T19:45:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T20:00:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T20:15:00.000-06:00"
      }, {
        "value" : "262",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T20:30:00.000-06:00"
      }, {
        "value" : "263",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T20:45:00.000-06:00"
      }, {
        "value" : "263",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T21:00:00.000-06:00"
      }, {
        "value" : "262",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T21:15:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T21:30:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T21:45:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T22:00:00.000-06:00"
      }, {
        "value" : "259",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T22:15:00.000-06:00"
      }, {
        "value" : "260",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T22:30:00.000-06:00"
      }, {
        "value" : "259",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T22:45:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T23:00:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T23:15:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T23:30:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T23:45:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T00:00:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T00:15:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T00:30:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T00:45:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T01:00:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T01:15:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T01:30:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T01:45:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T02:00:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T02:15:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T02:30:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T02:45:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T03:00:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T03:15:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T03:30:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T03:45:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T04:00:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T04:15:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T04:30:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T04:45:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T05:00:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T05:15:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T05:30:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T05:45:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T06:00:00.000-06:00"
      }, {
        "value" : "259",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T06:15:00.000-06:00"
      }, {
        "value" : "260",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T06:30:00.000-06:00"
      }, {
        "value" : "262",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T06:45:00.000-06:00"
      }, {
        "value" : "262",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T07:00:00.000-06:00"
      }, {
        "value" : "262",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T07:15:00.000-06:00"
      }, {
        "value" : "263",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T07:30:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T07:45:00.000-06:00"
      }, {
        "value" : "263",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T08:00:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T08:15:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T08:30:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T08:45:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T09:00:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T09:15:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T09:30:00.000-06:00"
      }, {
        "value" : "267",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T09:45:00.000-06:00"
      }, {
        "value" : "266",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T10:00:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T10:15:00.000-06:00"
      }, {
        "value" : "266",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T10:30:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T10:45:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T11:00:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T11:15:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T11:30:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T11:45:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T12:00:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T12:15:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T12:30:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T12:45:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T13:00:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T13:15:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T13:30:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T13:45:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T14:00:00.000-06:00"
      }, {
        "value" : "263",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T14:15:00.000-06:00"
      }, {
        "value" : "263",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T14:30:00.000-06:00"
      }, {
        "value" : "263",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T14:45:00.000-06:00"
      }, {
        "value" : "262",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T15:00:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T15:15:00.000-06:00"
      }, {
        "value" : "260",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T15:30:00.000-06:00"
      }, {
        "value" : "260",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T15:45:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T16:00:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T16:15:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T16:30:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T16:45:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T17:00:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T17:15:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T17:30:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T17:45:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T18:00:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T18:15:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T18:30:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T18:45:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T19:00:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T19:15:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T19:30:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T19:45:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T20:00:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T20:15:00.000-06:00"
      }, {
        "value" : "253",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T20:30:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T20:45:00.000-06:00"
      }, {
        "value" : "252",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T21:00:00.000-06:00"
      }, {
        "value" : "252",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T21:15:00.000-06:00"
      }, {
        "value" : "252",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T21:30:00.000-06:00"
      }, {
        "value" : "250",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T21:45:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T22:00:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T22:15:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T22:30:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T22:45:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T23:00:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T23:15:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T23:30:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T23:45:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T00:00:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T00:15:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T00:30:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T00:45:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T01:00:00.000-06:00"
      }, {
        "value" : "246",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T01:15:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T01:30:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T01:45:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T02:00:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T02:15:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T02:30:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T02:45:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T03:00:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T03:15:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T03:30:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T03:45:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T04:00:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T04:15:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T04:30:00.000-06:00"
      }, {
        "value" : "250",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T04:45:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T05:00:00.000-06:00"
      }, {
        "value" : "251",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T05:15:00.000-06:00"
      }, {
        "value" : "251",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T05:30:00.000-06:00"
      }, {
        "value" : "252",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T05:45:00.000-06:00"
      }, {
        "value" : "253",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T06:00:00.000-06:00"
      }, {
        "value" : "253",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T06:15:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T06:30:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T06:45:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T07:00:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T07:15:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T07:30:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T07:45:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T08:00:00.000-06:00"
      }, {
        "value" : "259",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T08:15:00.000-06:00"
      }, {
        "value" : "260",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T08:30:00.000-06:00"
      }, {
        "value" : "260",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T08:45:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T09:00:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T09:15:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T09:30:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T09:45:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T10:00:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T10:15:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T10:30:00.000-06:00"
      }, {
        "value" : "262",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T10:45:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T11:00:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T11:15:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T11:30:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T11:45:00.000-06:00"
      }, {
        "value" : "260",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T12:00:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T12:15:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T12:30:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T12:45:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T13:00:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T13:15:00.000-06:00"
      }, {
        "value" : "262",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T13:30:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T13:45:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T14:00:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T14:15:00.000-06:00"
      }, {
        "value" : "260",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T14:30:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T14:45:00.000-06:00"
      }, {
        "value" : "259",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T15:00:00.000-06:00"
      }, {
        "value" : "260",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T15:15:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T15:30:00.000-06:00"
      }, {
        "value" : "259",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T15:45:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T16:00:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T16:15:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T16:30:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T16:45:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T17:00:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T17:15:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T17:30:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T17:45:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T18:00:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T18:15:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T18:30:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T18:45:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T19:00:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T19:15:00.000-06:00"
      }, {
        "value" : "253",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T19:30:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T19:45:00.000-06:00"
      }, {
        "value" : "253",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T20:00:00.000-06:00"
      }, {
        "value" : "252",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T20:15:00.000-06:00"
      }, {
        "value" : "251",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T20:30:00.000-06:00"
      }, {
        "value" : "252",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T20:45:00.000-06:00"
      }, {
        "value" : "253",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T21:00:00.000-06:00"
      }, {
        "value" : "251",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T21:15:00.000-06:00"
      }, {
        "value" : "251",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T21:30:00.000-06:00"
      }, {
        "value" : "251",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T21:45:00.000-06:00"
      }, {
        "value" : "251",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T22:00:00.000-06:00"
      }, {
        "value" : "250",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T22:15:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T22:30:00.000-06:00"
      }, {
        "value" : "250",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T22:45:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T23:00:00.000-06:00"
      }, {
        "value" : "250",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T23:15:00.000-06:00"
      }, {
        "value" : "250",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T23:30:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T23:45:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T00:00:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T00:15:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T00:30:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T00:45:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T01:00:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T01:15:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T01:30:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T01:45:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T02:00:00.000-06:00"
      }, {
        "value" : "246",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T02:15:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T02:30:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T02:45:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T03:00:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T03:15:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T03:30:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T03:45:00.000-06:00"
      }, {
        "value" : "250",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T04:00:00.000-06:00"
      }, {
        "value" : "250",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T04:15:00.000-06:00"
      }, {
        "value" : "250",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T04:30:00.000-06:00"
      }, {
        "value" : "252",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T04:45:00.000-06:00"
      }, {
        "value" : "252",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T05:00:00.000-06:00"
      }, {
        "value" : "253",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T05:15:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T05:30:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T05:45:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T06:00:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T06:15:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T06:30:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T06:45:00.000-06:00"
      }, {
        "value" : "260",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T07:00:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T07:15:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T07:30:00.000-06:00"
      }, {
        "value" : "262",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T07:45:00.000-06:00"
      }, {
        "value" : "263",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T08:00:00.000-06:00"
      }, {
        "value" : "263",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T08:15:00.000-06:00"
      }, {
        "value" : "263",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T08:30:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T08:45:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T09:00:00.000-06:00"
      }, {
        "value" : "266",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T09:15:00.000-06:00"
      }, {
        "value" : "267",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T09:30:00.000-06:00"
      }, {
        "value" : "267",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T09:45:00.000-06:00"
      }, {
        "value" : "267",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T10:00:00.000-06:00"
      }, {
        "value" : "268",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T10:15:00.000-06:00"
      }, {
        "value" : "267",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T10:30:00.000-06:00"
      }, {
        "value" : "268",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T10:45:00.000-06:00"
      }, {
        "value" : "268",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T11:00:00.000-06:00"
      }, {
        "value" : "269",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T11:15:00.000-06:00"
      }, {
        "value" : "268",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T11:30:00.000-06:00"
      }, {
        "value" : "269",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T11:45:00.000-06:00"
      }, {
        "value" : "269",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T12:00:00.000-06:00"
      }, {
        "value" : "269",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T12:15:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T12:30:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T12:45:00.000-06:00"
      }, {
        "value" : "269",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T13:00:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T13:15:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T13:30:00.000-06:00"
      }, {
        "value" : "269",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T13:45:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T14:00:00.000-06:00"
      }, {
        "value" : "269",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T14:15:00.000-06:00"
      }, {
        "value" : "269",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T14:30:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T14:45:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T15:00:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T15:15:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T15:30:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T15:45:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T16:00:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T16:15:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T16:30:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T16:45:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T17:00:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T17:15:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T17:30:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T17:45:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T18:00:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T18:15:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T18:30:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T18:45:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T19:00:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T19:15:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T19:30:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T19:45:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T20:00:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T20:15:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T20:30:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T20:45:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T21:00:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T21:15:00.000-06:00"
      }, {
        "value" : "274",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T21:30:00.000-06:00"
      }, {
        "value" : "274",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T21:45:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T22:00:00.000-06:00"
      }, {
        "value" : "275",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T22:15:00.000-06:00"
      }, {
        "value" : "275",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T22:30:00.000-06:00"
      }, {
        "value" : "275",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T22:45:00.000-06:00"
      }, {
        "value" : "276",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T23:00:00.000-06:00"
      }, {
        "value" : "275",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T23:15:00.000-06:00"
      }, {
        "value" : "276",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T23:30:00.000-06:00"
      }, {
        "value" : "276",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T23:45:00.000-06:00"
      }, {
        "value" : "276",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T00:00:00.000-06:00"
      }, {
        "value" : "276",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T00:15:00.000-06:00"
      }, {
        "value" : "276",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T00:30:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T00:45:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T01:00:00.000-06:00"
      }, {
        "value" : "276",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T01:15:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T01:30:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T01:45:00.000-06:00"
      }, {
        "value" : "276",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T02:00:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T02:15:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T02:30:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T02:45:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T03:00:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T03:15:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T03:30:00.000-06:00"
      }, {
        "value" : "278",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T03:45:00.000-06:00"
      }, {
        "value" : "278",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T04:00:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T04:15:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T04:30:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T04:45:00.000-06:00"
      }, {
        "value" : "278",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T05:00:00.000-06:00"
      }, {
        "value" : "278",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T05:15:00.000-06:00"
      }, {
        "value" : "278",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T05:30:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T05:45:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T06:00:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T06:15:00.000-06:00"
      }, {
        "value" : "278",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T06:30:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T06:45:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T07:00:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T07:15:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T07:30:00.000-06:00"
      }, {
        "value" : "278",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T07:45:00.000-06:00"
      }, {
        "value" : "278",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T08:00:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T08:15:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T08:30:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T08:45:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T09:00:00.000-06:00"
      }, {
        "value" : "280",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T09:15:00.000-06:00"
      }, {
        "value" : "280",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T09:30:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T09:45:00.000-06:00"
      }, {
        "value" : "280",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T10:00:00.000-06:00"
      }, {
        "value" : "280",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T10:15:00.000-06:00"
      }, {
        "value" : "280",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T10:30:00.000-06:00"
      }, {
        "value" : "281",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T10:45:00.000-06:00"
      }, {
        "value" : "281",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T11:00:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T11:15:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T11:30:00.000-06:00"
      }, {
        "value" : "281",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T11:45:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T12:00:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T12:15:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T12:30:00.000-06:00"
      }, {
        "value" : "284",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T12:45:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T13:00:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T13:15:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T13:30:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T13:45:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T14:00:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T14:15:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T14:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T14:45:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T15:00:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T15:15:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T15:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T15:45:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T16:00:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T16:15:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T16:30:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T16:45:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T17:00:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T17:15:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T17:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T17:45:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T18:00:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T18:15:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T18:30:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T18:45:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T19:00:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T19:15:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T19:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T19:45:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T20:00:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T20:15:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T20:30:00.000-06:00"
      }, {
        "value" : "295",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T20:45:00.000-06:00"
      }, {
        "value" : "295",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T21:00:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T21:15:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T21:30:00.000-06:00"
      }, {
        "value" : "295",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T21:45:00.000-06:00"
      }, {
        "value" : "295",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T22:00:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T22:15:00.000-06:00"
      }, {
        "value" : "295",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T22:30:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T22:45:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T23:00:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T23:15:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T23:30:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T23:45:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T00:00:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T00:15:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T00:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T00:45:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T01:00:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T01:15:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T01:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T01:45:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T02:00:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T02:15:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T02:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T02:45:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T03:00:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T03:15:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T03:30:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T03:45:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T04:00:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T04:15:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T04:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T04:45:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T05:00:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T05:15:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T05:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T05:45:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T06:00:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T06:15:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T06:30:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T06:45:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T07:00:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T07:15:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T07:30:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T07:45:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T08:00:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T08:15:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T08:30:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T08:45:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T09:00:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T09:15:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T09:30:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T09:45:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T10:00:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T10:15:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T10:30:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T10:45:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T11:00:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T11:15:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T11:30:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T11:45:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T12:00:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T12:15:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T12:30:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T12:45:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T13:00:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T13:15:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T13:30:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T13:45:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T14:00:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T14:15:00.000-06:00"
      } ],
      "qualifier" : [ {
        "qualifierCode" : "P",
        "qualifierDescription" : "Provisional data subject to revision.",
        "qualifierID" : 0,
        "network" : "NWIS",
        "vocabulary" : "uv_rmk_cd"
      } ],
      "qualityControlLevel" : [ ],
      "method" : [ {
        "methodDescription" : "",
        "methodID" : 158049
      } ],
      "source" : [ ],
      "offset" : [ ],
      "sample" : [ ],
      "censorCode" : [ ]
    } ],
    "name" : "USGS:12345678:00060:00000"
  } ]
},
"nil" : false,
"globalScope" : true,
"typeSubstituted" : false
}
`;
