const { getVariables, getCurrentVariableID, getCurrentDateRange, getCurrentVariable, getQueryInfo, getRequests,
    getCurrentParmCd, hasTimeSeries, getTsRequestKey, getTsQueryInfo, getRequestTimeRange, isLoadingTs, getTsRequest,
    getTimeSeriesCollection } = require('./timeSeriesSelector');

fdescribe('timeSeriesSelector', () => {
    const TEST_VARS = {
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
    };

    describe('getVariables', () => {
        it('Return null if series is empty', () => {
            expect(getVariables({
                series: {}
            })).toBeNull();
        });

        it('Return the variables if in series', () => {
            expect(getVariables({
                series: {
                    variables: TEST_VARS
                }
            })).toEqual(TEST_VARS);
        });
    });

    describe('getQueryInfo', () => {
        it('Return empty object if series is empty', () => {
            expect(getQueryInfo({
                series: {}
            })).toEqual({});
        });

        it('Return queryinfo is state', () => {
            expect(getQueryInfo({
                series: {
                    queryInfo: {
                        'current:P7D': {
                            queryURL: 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&period=P7D'
                        }
                    }
                }
            })).toEqual({
                'current:P7D': {
                    queryURL: 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&period=P7D'
                }
            });
        });
    });

    describe('getRequests', () => {
        it('Empty object if series is empty', () => {
            expect(getRequests({
                series: {}
            })).toEqual({});
        });

        it('Requests object if in state', () => {

        })
    });

    describe('getCurrentVariableID', () => {
        it('Return the current variable ID', () => {
            expect(getCurrentVariableID({
                timeSeriesState: {
                    currentVariableID: '00060'
                }
            })).toEqual('00060');
        });
    });

    describe('getCurrentDateRange', () => {
       it('Return the current date range', () => {
           expect(getCurrentDateRange({
               timeSeriesState: {
                   currentDateRange: 'P30D'
               }
           })).toEqual('P30D');
       });
    });

    describe('getCurrentVariable', () => {
        const TEST_STATE = {
            series: {
                variables: TEST_VARS
            },
            timeSeriesState: {
                currentVariableID: '45807042'
            }
        };

        it('Return null if no variable is selected', () => {
            expect(getCurrentVariable({
                ...TEST_STATE,
                timeSeriesState: {
                    currentVariableID: null
                }
            })).toBeNull();
        });

        it('Return null if no variables are in series', () => {
           expect(getCurrentVariable({
               ...TEST_STATE,
               series: {
                   variables: {}
               }
           })).toBeNull();
           expect(getCurrentVariable({
               ...TEST_STATE,
               series: {}
           })).toBeNull();
        });

        it('Return selected variable', () => {
            expect(getCurrentVariable(TEST_STATE)).toEqual(TEST_VARS['45807042']);
        });
    });

    describe('getCurrentParmCd', () => {
        const TEST_STATE = {
            series: {
                variables: TEST_VARS
            },
            timeSeriesState: {
                currentVariableID: '45807042'
            }
        };

        it('Return null if no variable is selected', () => {
            expect(getCurrentParmCd({
                ...TEST_STATE,
                timeSeriesState: {
                    currentVariableID: null
                }
            })).toBeNull();
        });

        it('Return null if no variables are in series', () => {
           expect(getCurrentParmCd({
               ...TEST_STATE,
               series: {
                   variables: {}
               }
           })).toBeNull();
           expect(getCurrentParmCd({
               ...TEST_STATE,
               series: {}
           })).toBeNull();
        });

        it('Return selected parm code', () => {
            expect(getCurrentParmCd(TEST_STATE)).toEqual('00060');
        });
    });

    describe('hasTimeSeries', () => {
        const TEST_STATE = {
            series: {
                variables: TEST_VARS,
                requests : {
                    'current:P7D': {},
                    'median' : {},
                    'current:P30D:00060': {}
                }
            },
            timeSeriesState: {
                currentDateRange: 'P7D',
                currentVariableID: '45807042'
            }
        };

        it('Return false if no requests in series', () => {
            expect(hasTimeSeries('current', 'P7D', '00060')({
                series: {},
                timeSeriesState: {
                    currentDateRange: 'P7D',
                    currentVariableID: '45807042'
                }
            })).toBe(false);
        });

        it('Return false if request is not in state', () => {
            expect(hasTimeSeries('current', 'P30D', '00010')(TEST_STATE)).toBe(false);
            expect(hasTimeSeries('current', 'P1Y')(TEST_STATE)).toBe(false);
        });

        it('Return true if request is in state', () => {
            expect(hasTimeSeries('current')(TEST_STATE)).toBe(true);
            expect(hasTimeSeries('median')(TEST_STATE)).toBe(true);
            expect(hasTimeSeries('current', 'P30D', '00060')(TEST_STATE)).toBe(true);
        });
    });

    describe('getTsRequestKey', () => {
        const TEST_STATE = {
            series: {
                variables: TEST_VARS
            },
            timeSeriesState: {
                currentDateRange: 'P7D',
                currentVariableID: '45807042'
            }
        };
        it('Return the expected request key if period and parmCd are not specified', () => {
            expect(getTsRequestKey('current')(TEST_STATE)).toBe('current:P7D');
            expect(getTsRequestKey('compare')(TEST_STATE)).toBe('compare:P7D');
            expect(getTsRequestKey('median')(TEST_STATE)).toBe('median');
        });

        it('Return the expected request key if parmCd is not specified', () => {
            expect(getTsRequestKey('current', 'P30D')(TEST_STATE)).toBe('current:P30D:00060');
            expect(getTsRequestKey('compare', 'P30D')(TEST_STATE)).toBe('compare:P30D:00060');
            expect(getTsRequestKey('median', 'P7D')(TEST_STATE)).toBe('median');
        });

        it('Return the expected request key if all parameters are specified', () => {
            expect(getTsRequestKey('current', 'P30D', '00010')(TEST_STATE)).toBe('current:P30D:00010');
            expect(getTsRequestKey('compare', 'P30D', '00010')(TEST_STATE)).toBe('compare:P30D:00010');
            expect(getTsRequestKey('median', 'P30D', '00010')(TEST_STATE)).toBe('median');
        });
    });

    describe('getTsQueryInfo', () => {
        const TEST_DATA = {
            series: {
                queryInfo: {
                    'current:P7D': {
                        notes: {
                            requestDT: new Date('2017-03-31'),
                            'filter:timeRange': {
                                mode: 'PERIOD',
                                periodDays: 7,
                                modifiedSince: null
                            }
                        }
                    },
                    'current:P30D:00060': {
                        notes: {
                            requestDT: new Date('2017-03-31'),
                            'filter:timeRange': {
                                mode: 'RANGE',
                                interval: {
                                    start: new Date('2017-03-01'),
                                    end: new Date('2017-03-29')
                                }
                            }
                        }
                    }
                },
                variables: TEST_VARS
            },
            timeSeriesState: {
                currentDateRange: 'P7D',
                currentVariableID: '45807042'
            }
        };

        it('Return the query info requested by tsKey using current date range', () => {
            expect(getTsQueryInfo('current')(TEST_DATA)).toEqual(TEST_DATA.series.queryInfo['current:P7D']);
            expect(getTsQueryInfo('compare')(TEST_DATA)).toEqual({});
        });

        it('Return the query info request by tsKey and period and parmCd', () => {
            expect(getTsQueryInfo('current', 'P1Y')(TEST_DATA)).toEqual({});
            expect(getTsQueryInfo('current', 'P30D')(TEST_DATA)).toEqual(TEST_DATA.series.queryInfo['current:P30D:00060']);
            expect(getTsQueryInfo('current', 'P30D', '00010')(TEST_DATA)).toEqual({});
        });
    });


    describe('getRequestTimeRange', () => {
        const TEST_DATA = {
            series: {
                queryInfo: {
                    'current:P7D': {
                        notes: {
                            requestDT: new Date('2017-03-31'),
                            'filter:timeRange': {
                                mode: 'PERIOD',
                                periodDays: 7,
                                modifiedSince: null
                            }
                        }
                    },
                    'current:P30D:00060': {
                        notes: {
                            requestDT: new Date('2017-03-31'),
                            'filter:timeRange': {
                                mode: 'RANGE',
                                interval: {
                                    start: new Date('2017-03-01'),
                                    end: new Date('2017-03-29')
                                }
                            }
                        }
                    }
                },
                variables: TEST_VARS
            },
            timeSeriesState: {
                currentDateRange: 'P7D',
                currentVariableID: '45807042'
            }
        };

        it('should return null if there is no series data', () => {
            const newTestData = {
                ...TEST_DATA,
                series: {}
            };
            expect(getRequestTimeRange('current')(newTestData)).toBeNull();
        });

        it('should return null if the data has not been requests', () => {
            expect(getRequestTimeRange('compare')(TEST_DATA)).toBeNull();
            expect(getRequestTimeRange('current', 'P30D', '00010')(TEST_DATA)).toBeNull();
        });

        it('should use the requestDT for requests with mode PERIOD', () => {
            expect(getRequestTimeRange('current')(TEST_DATA)).toEqual({
                start: new Date('2017-03-24'),
                end: new Date('2017-03-31')
            });
        });

        it('should use the interval for request with mode RANGE', () => {
            expect(getRequestTimeRange('current', 'P30D', '00060')(TEST_DATA)).toEqual({
                start: new Date('2017-03-01'),
                end: new Date('2017-03-29')
            });
        });
    });
});
