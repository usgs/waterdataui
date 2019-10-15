import { getVariables, getCurrentVariableID, getCurrentDateRange, getCurrentVariable, getQueryInfo, getRequests, getCurrentParmCd, hasTimeSeries, getTsRequestKey, getTsQueryInfo, getRequestTimeRange, isLoadingTS, getTSRequest, getTimeSeriesCollectionIds, getIanaTimeZone, getNwisTimeZone } from './time-series-selector';

describe('timeSeriesSelector', () => {
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
            expect(getRequests({
                series: {
                    requests : {
                        'current:P7D': {
                            timeSeriesCollections: ['1', '2']
                        },
                        'compare:P30D:00010': {
                            timeSeriesCollections: ['3']
                        },
                        'current:P30D:00060': {
                            timeSeriesCollections: ['4']
                        }
                    }
                }
            })).toEqual({
                'current:P7D': {
                    timeSeriesCollections: ['1', '2']
                },
                'compare:P30D:00010': {
                    timeSeriesCollections: ['3']
                },
                'current:P30D:00060': {
                    timeSeriesCollections: ['4']
                }
            });
        });
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
        });

        it('Return the expected request key if parmCd is not specified', () => {
            expect(getTsRequestKey('current', 'P30D')(TEST_STATE)).toBe('current:P30D:00060');
            expect(getTsRequestKey('compare', 'P30D')(TEST_STATE)).toBe('compare:P30D:00060');
        });

        it('Return the expected request key if all parameters are specified', () => {
            expect(getTsRequestKey('current', 'P30D', '00010')(TEST_STATE)).toBe('current:P30D:00010');
            expect(getTsRequestKey('compare', 'P30D', '00010')(TEST_STATE)).toBe('compare:P30D:00010');
        });
    });

    describe('getTsQueryInfo', () => {
        const TEST_DATA = {
            series: {
                queryInfo: {
                    'current:P7D': {
                        notes: {
                            requestDT: 1490936400000,
                            'filter:timeRange': {
                                mode: 'PERIOD',
                                periodDays: 7,
                                modifiedSince: null
                            }
                        }
                    },
                    'current:P30D:00060': {
                        notes: {
                            requestDT: 1490936400000,
                            'filter:timeRange': {
                                mode: 'RANGE',
                                interval: {
                                    start: 1488348000000,
                                    end: 1490763600000
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
                ianaTimeZone: 'America/Chicago',
                queryInfo: {
                    'current:P7D': {
                        notes: {
                            requestDT: 1490936400000,
                            'filter:timeRange': {
                                mode: 'PERIOD',
                                periodDays: 7,
                                modifiedSince: null
                            }
                        }
                    },
                    'current:P30D:00060': {
                        notes: {
                            requestDT: 1490936400000,
                            'filter:timeRange': {
                                mode: 'RANGE',
                                interval: {
                                    start: 1488348000000,
                                    end: 1490763600000
                                }
                            }
                        }
                    },
                    'current:custom:00095': {
                        notes: {
                            requestDT: 1568729153803,
                            'filter:timeRange': {
                                mode: 'RANGE',
                                interval: {
                                    start: 1454738400000,
                                    end: 1557896400000
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
                start: 1490331600000,
                end: 1490936400000
            });
        });

        it('should use the interval for request with mode RANGE', () => {
            expect(getRequestTimeRange('current', 'P30D', '00060')(TEST_DATA)).toEqual({
                start: 1488348000000,
                end: 1490763600000
            });
        });

        it('should use the interval for a request with a custom RANGE', () => {
            expect(getRequestTimeRange('current', 'custom', '00095')(TEST_DATA)).toEqual({
                start: 1454738400000,
                end: 1557896400000
            });
        });
    });

    describe('getIanaTimeZone', () => {

        it('returns null if series is empty', () => {
            expect(getIanaTimeZone({
                series: {}
            })).toBeNull();
        });

        it('returns the time zone when present', () => {
            expect(getIanaTimeZone({
                series: {
                    ianaTimeZone: 'America/Los_Angeles'
                }
            })).toEqual('America/Los_Angeles');
        });
    });

    describe('getNwisTimeZone', () => {

        it('returns an empty object if series is empty', () => {
            expect(getNwisTimeZone({
                series: {}
            })).toEqual({});
        });

        it('returns the NWIS provide timezones when present', () => {
            expect(getNwisTimeZone({
                series: {
                    timeZones: {
                        CDT: {
                            content: 'x'
                        },
                        CST: {
                            content: 'y'
                        }
                    }
                }
            })).toEqual({
                CDT: {
                    content: 'x'
                },
                CST: {
                    content: 'y'
                }
            });
        });
    });

    describe('isLoadingTS', () => {
        const TEST_DATA = {
            series: {
                variables: TEST_VARS
            },
            timeSeriesState: {
                currentDateRange: 'P30D',
                currentVariableID: '45807042',
                loadingTSKeys: ['compare:P7D', 'current:P30D:00060']
            }
        };

        it('true for ts requests that are loading', () => {
            expect(isLoadingTS('current')(TEST_DATA)).toBe(true);
            expect(isLoadingTS('compare', 'P7D')(TEST_DATA)).toBe(true);
        });

        it('false for ts requests that are not loading', () => {
            expect(isLoadingTS('compare')(TEST_DATA)).toBe(false);
            expect(isLoadingTS('current', 'P30D', '00010')(TEST_DATA)).toBe(false);
            expect(isLoadingTS('current', 'P7D')(TEST_DATA)).toBe(false);
        });
    });

    describe('getTSRequest', () => {
        const TEST_DATA = {
            series: {
                requests: {
                    'current:P7D': {
                        timeSeriesCollections: ['1', '2']
                    },
                    'compare:P30D:00010': {
                        timeSeriesCollections: []
                    },
                    'current:P30D:00060': {
                        timeSeriesCollections: ['4']
                    }
                },
                variables: TEST_VARS
            },
            timeSeriesState: {
                currentDateRange: 'P30D',
                currentVariableID: '45807042'
            }
        };

        it('Expects to retrieve requested requests', () => {
            expect(getTSRequest('current', 'P7D')(TEST_DATA)).toEqual({
                timeSeriesCollections: ['1', '2']
            });
            expect(getTSRequest('current')(TEST_DATA)).toEqual({
                timeSeriesCollections: ['4']
            });
            expect(getTSRequest('compare', 'P30D', '00010')(TEST_DATA)).toEqual({
                timeSeriesCollections: []
            });
        });

        it('Return the empty object if the request does not contain the request key', () => {
            expect(getTSRequest('compare')(TEST_DATA)).toEqual({});
            expect(getTSRequest('compare', 'P7D')(TEST_DATA)).toEqual({});
            expect(getTSRequest('current', 'P1Y', '00010')(TEST_DATA)).toEqual({});
        });
    });

    describe('getTimeSeriesCollectionIds', () => {
        const TEST_DATA = {
            series: {
                requests: {
                    'current:P7D': {
                        timeSeriesCollections: ['1', '2']
                    },
                    'compare:P30D:00010': {
                        timeSeriesCollections: []
                    },
                    'current:P30D:00060': {
                        timeSeriesCollections: ['4']
                    }
                },
                variables: TEST_VARS
            },
            timeSeriesState: {
                currentDateRange: 'P30D',
                currentVariableID: '45807042'
            }
        };

        it('Expects to retrieve requested timeSeriesCollections', () => {
            expect(getTimeSeriesCollectionIds('current', 'P7D')(TEST_DATA)).toEqual(['1', '2']);
            expect(getTimeSeriesCollectionIds('current')(TEST_DATA)).toEqual(['4']);
            expect(getTimeSeriesCollectionIds('compare', 'P30D', '00010')(TEST_DATA)).toEqual([]);
        });

        it('Return null if the request does not contain the request key', () => {
            expect(getTimeSeriesCollectionIds('compare')(TEST_DATA)).toBeNull();
            expect(getTimeSeriesCollectionIds('compare', 'P7D')(TEST_DATA)).toBeNull();
            expect(getTimeSeriesCollectionIds('current', 'P1Y', '00010')(TEST_DATA)).toBeNull({});
        });
    });
});
