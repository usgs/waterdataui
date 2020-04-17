import {
    getVariables,
    getSourceInfo,
    getSiteCodes,
    getCurrentVariableID,
    getCurrentDateRange,
    getTimeSeries,
    hasAnyTimeSeries,
    getMonitoringLocationName,
    getAgencyCode,
    getCurrentVariable,
    getQueryInfo,
    getRequests,
    getCurrentParmCd,
    hasTimeSeries,
    getTsRequestKey,
    getTsQueryInfo,
    getRequestTimeRange,
    isLoadingTS,
    getTSRequest,
    getTimeSeriesCollectionIds,
    getNwisTimeZone,
    getAllMethodsForCurrentVariable,
    getCurrentVariableTimeSeries,
    getTimeSeriesForTsKey
} from './time-series-selector';

const TEST_DATA = {
    series: {
        timeSeries: {
            '00060': {
                tsKey: 'current:P7D',
                startTime: 1520351100000,
                endTime: 1520948700000,
                variable: '45807197',
                method: 69929,
                points: [{
                    value: 10,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }, {
                    value: null,
                    qualifiers: ['P', 'ICE'],
                    approved: false,
                    estimated: false
                }, {
                    value: null,
                    qualifiers: ['P', 'FLD'],
                    approved: false,
                    estimated: false
                }]
            },
            '00010': {
                tsKey: 'compare:P7D',
                startTime: 1520351100000,
                endTime: 1520948700000,
                variable: '45807196',
                method: 69931,
                points: [{
                    value: 1,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }, {
                    value: 2,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }, {
                    value: 3,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }]
            },
            '00010:2': {
                tsKey: 'current:P7D',
                startTime: 1520351100000,
                endTime: 1520948700000,
                variable: '45807196',
                method: 69930,
                points: [{
                    value: 1,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }, {
                    value: 2,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }, {
                    value: 3,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }]
            },
            '00011': {
                tsKey: 'compare:P7D',
                startTime: 1520351100000,
                endTime: 1520948700000,
                variable: '45807195',
                method: 69929,
                points: [{
                    value: 68,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }, {
                    value: 70,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }, {
                    value: 77,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }]
            },
            '00060:P30D': {
                tsKey: 'current:P30D:00060',
                startTime: 1520351100000,
                endTime: 1520948700000,
                variable: '45807197',
                method: 69929,
                points: [{
                    value: 10,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }, {
                    value: null,
                    qualifiers: ['P', 'ICE'],
                    approved: false,
                    estimated: false
                }, {
                    value: null,
                    qualifiers: ['P', 'FLD'],
                    approved: false,
                    estimated: false
                }]
            }
        },
        timeSeriesCollections: {
            'coll1': {
                variable: 45807197,
                timeSeries: ['00060']
            }
        },
        requests: {
            'current:P7D': {
                timeSeriesCollections: ['coll1']
            },
            'current:P30D:00060': {}
        },
        variables: {
            '45807197': {
                variableCode: {
                    value: '00060'
                },
                variableName: 'Streamflow',
                variableDescription: 'Discharge, cubic feet per second',
                oid: '45807197'
            },
            '45807196': {
                variableCode: {
                    value: '00010'
                },
                variableName: 'Temperature, water, degrees Celsius',
                variableDescription: 'Water Temperature in Celsius',
                oid: '45807196'
            },
            '45807195': {
                variableCode: {
                    value: '00011'
                },
                variableName: 'Temperature, water, degrees Fahrenheit',
                variableDescription: 'Water Temperature in Fahrenheit',
                oid: '45807195'
            },
            '55807196' : {
                variableCode: {
                    value: '11111'
                },
                variableName: 'My variable',
                variableDescription: 'My awesome variable',
                oid: '55807196'
            }
        },
        methods: {
            69329: {
                methodDescription: '',
                methodID: 69928
            },
            69330: {
                methodDescription: '4.1 ft from riverbed (middle)',
                methodID: 69930
            },
            69331: {
                methodDescription: '1.0 ft from riverbed (bottom)',
                methodID: 69931
            }
        },
        queryInfo: {
            'current:P7D': {
                notes: {
                    requestDT: 1483994767572,
                    'filter:timeRange': {
                        mode: 'PERIOD',
                        periodDays: 7,
                        modifiedSince: null
                    }
                }
            },
            'current:P30D:00060': {
                notes: {
                    requestDT: 1483994767572,
                    'filter:timeRange': {
                        mode: 'RANGE',
                        interval: {
                            start: 1483941600000,
                            end: 1486533600000
                        },
                        modifiedSince: null
                    }
                }
            }
        }
    },
    timeSeriesState: {
        currentVariableID: '45807197',
        currentDateRange: 'P7D'
    }
};

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

    describe('getTimeSeries', () => {
        it('Return empty object if series is empty', () => {
            expect(getTimeSeries({
                series: {}
            })).toEqual({});
        });

        it('Return the timeSeries if in series', () => {
            expect(getTimeSeries({
                series: {
                    timeSeries: {
                        '00010': {
                            prop1: 'value1'
                        }
                    }
                }
            })).toEqual({
                '00010': {
                    prop1: 'value1'
                }
            });
        });
    });

    describe('hasAnyTimeSeries', () => {
        it('Return false if series is empty', () => {
            expect(hasAnyTimeSeries({
               series: {}
            })).toBe(false);
        });

        it('Return true if series is not empty', () => {
            expect(hasAnyTimeSeries({
                series: {
                    timeSeries: {
                        '00010': {
                            prop1: 'value1'
                        }
                    }
                }
            })).toBe(true);
        });
    });

    describe('getSourceInfo', () => {
        it('Return an empty object if series is empty', () => {
            expect(getSourceInfo({
                series: {}
            })).toEqual({});
        });

        it('Return the sourceInfo if in series', () => {
            expect(getSourceInfo({
                series: {
                    sourceInfo: {
                        '0537000': {
                            siteName: 'Site Name'
                        }
                    }
                }
            })).toEqual({
                '0537000': {
                    siteName: 'Site Name'
                }
            });
        });
    });

    describe('getSiteCodes', () => {
        it('Return an empty object if series is empty', () => {
            expect(getSiteCodes({
                series: {}
            })).toEqual({});
        });

        it('Return the siteCodes if in series', () => {
            expect(getSiteCodes({
                series: {
                    siteCodes: {
                        '0537000': {
                            agencyCode: 'USGS'
                        }
                    }
                }
            })).toEqual({
                '0537000': {
                    agencyCode: 'USGS'
                }
            });
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

    describe('getMonitoringLocationName', () => {
        const TEST_INFO = {
            series: {
                sourceInfo: {
                    '01010101': {
                        'siteName': 'My Site Name'
                    }
                }
            }
        };
        it('Returns empty string if state has no sourceInfo', () => {
           expect(getMonitoringLocationName('12345678')({
               series: {}
           })).toBe('');
        });

        it('Returns empty string if siteNo is not in sourceInfo', () => {
            expect(getMonitoringLocationName('12345678')(TEST_INFO)).toBe('');
        });

        it('Returns the monitoring location name for the site', () => {
            expect(getMonitoringLocationName('01010101')(TEST_INFO)).toBe('My Site Name');
        });
    });

    describe('getAgencyCode', () => {
        const TEST_SITE_CODES = {
            series: {
                siteCodes: {
                    '01010101': {
                        'agencyCode': 'USGS'
                    }
                }
            }
        };
        it('Returns empty string if state has no siteCodes ', () => {
           expect(getAgencyCode('12345678')({
               series: {}
           })).toBe('');
        });

        it('Returns empty string if siteNo is not in siteCodes', () => {
            expect(getAgencyCode('12345678')(TEST_SITE_CODES)).toBe('');
        });

        it('Returns the agency code  for the site', () => {
            expect(getAgencyCode('01010101')(TEST_SITE_CODES)).toBe('USGS');
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
            ianaTimeZone: 'America/Chicago',
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

    describe('getCurrentVariableTimeSeries', () => {
        it('works', () => {
            expect(getCurrentVariableTimeSeries('current', 'P7D')({
                series: {
                    requests: {
                        'current:P7D': {
                            timeSeriesCollections: ['coll1', 'coll2']
                        }
                    },
                    timeSeriesCollections: {
                        'coll1': {
                            timeSeries: ['one', 'two'],
                            variable: 45807197
                        },
                        'coll2': {
                            timeSeries: ['three', 'four'],
                            variable: 45807197
                        },
                        'coll3': {
                            timeSeries: ['five', 'six'],
                            variable: 'do not match'
                        }
                    },
                    timeSeries: {
                        one: {
                            item: 'one',
                            points: [1, 2],
                            tsKey: 'current:P7D',
                            variable: 45807197
                        },
                        two: {
                            item: 'two',
                            points: [],
                            tsKey: 'current:P7D',
                            variable: 45807197
                        },
                        three: {
                            item: 'three',
                            points: [3, 4],
                            tsKey: 'current:P7D',
                            variable: 45807197
                        },
                        four: {
                            item: 'four',
                            points: [4, 5],
                            tsKey: 'current:P7D',
                            variable: 45807197
                        },
                        five: {
                            item: 'five',
                            points: [5, 6],
                            tsKey: 'compare:P7D',
                            variable: 45807190
                        },
                        six: {
                            item: 'six',
                            points: [6, 7],
                            tsKey: 'compare:P7D',
                            variable: 45807190
                        }
                    },
                    variables: {
                        '45807197': {
                            oid: 45807197,
                            variableCode: {
                                value: '00060',
                                variableID: 45807197
                            }
                        }
                    }
                },
                timeSeriesState: {
                    currentVariableID: '45807197',
                    currentDateRange: 'P7D'
                }
            })).toEqual({
                one: {item: 'one', points: [1, 2], tsKey: 'current:P7D', variable: 45807197},
                two: {item: 'two', points: [], tsKey: 'current:P7D', variable: 45807197},
                three: {item: 'three', points: [3, 4], tsKey: 'current:P7D', variable: 45807197},
                four: {item: 'four', points: [4, 5], tsKey: 'current:P7D', variable: 45807197}
            });
        });

        it('returns {} if there is no currentVariableId', () => {
            expect(getCurrentVariableTimeSeries('current', 'P7D')({
                series: {},
                timeSeriesState: {
                    currentVariableID: null,
                    currentDateRange: 'P7D'
                }
            })).toEqual({});
        });
    });

    describe('getAllMethodsForCurrentVariable', () => {
        it('Expect empty array if current variable has no time series', () => {
            const newTestData = {
                ...TEST_DATA,
                timeSeriesState: {
                    ...TEST_DATA.timeSeriesState,
                    currentVariableID: '55807196'
                }
            };
            expect(getAllMethodsForCurrentVariable(newTestData)).toEqual([]);
        });

        it('Expect method ids for current variable', () => {
            const newTestData = {
                ...TEST_DATA,
                series: {
                    ...TEST_DATA.series,
                    timeSeries: {
                        ...TEST_DATA.series.timeSeries,
                        '00010:current:P7D': {
                            tsKey: 'current:P7D',
                            startTime: 1520351100000,
                            endTime: 1520948700000,
                            variable: '45807196',
                            method: 69931,
                            points: [{
                                value: 1,
                                qualifiers: ['P'],
                                approved: false,
                                estimated: false
                            }, {
                                value: 2,
                                qualifiers: ['P'],
                                approved: false,
                                estimated: false
                            }, {
                                value: 3,
                                qualifiers: ['P'],
                                approved: false,
                                estimated: false
                            }]
                        }
                    }
                },
                timeSeriesState: {
                    ...TEST_DATA.timeSeriesState,
                    currentVariableID: '45807196'
                }
            };
            const result = getAllMethodsForCurrentVariable(newTestData);
            expect(result.length).toEqual(2);
            expect(result).toContain({
                methodDescription: '4.1 ft from riverbed (middle)',
                methodID: 69930
            });
            expect(result).toContain({
                methodDescription: '1.0 ft from riverbed (bottom)',
                methodID: 69931
            });
        });
    });

    describe('getTimeSeriesForTsKey', () => {

        it('should return the selected time series', () => {
            expect(getTimeSeriesForTsKey('current')(TEST_DATA)).toEqual({
                '00060': {
                    tsKey: 'current:P7D',
                    startTime: 1520351100000,
                    endTime: 1520948700000,
                    points: [{
                        value: 10,
                        qualifiers: ['P'],
                        approved: false,
                        estimated: false
                    }, {
                        value: null,
                        qualifiers: ['P', 'ICE'],
                        approved: false,
                        estimated: false
                    }, {
                        value: null,
                        qualifiers: ['P', 'FLD'],
                        approved: false,
                        estimated: false
                    }],
                    variable: '45807197',
                    method: 69929
                },
                '00010:2': {
                    tsKey: 'current:P7D',
                    startTime: 1520351100000,
                    endTime: 1520948700000,
                    variable: '45807196',
                    method: 69930,
                    points: [{
                        value: 1,
                        qualifiers: ['P'],
                        approved: false,
                        estimated: false
                    }, {
                        value: 2,
                        qualifiers: ['P'],
                        approved: false,
                        estimated: false
                    }, {
                        value: 3,
                        qualifiers: ['P'],
                        approved: false,
                        estimated: false
                    }]
                }
            });
            expect(getTimeSeriesForTsKey('current','P30D')(TEST_DATA)).toEqual({
                '00060:P30D': {
                    tsKey: 'current:P30D:00060',
                    startTime: 1520351100000,
                    endTime: 1520948700000,
                    variable: '45807197',
                    method: 69929,
                    points: [{
                        value: 10,
                        qualifiers: ['P'],
                        approved: false,
                        estimated: false
                    }, {
                        value: null,
                        qualifiers: ['P', 'ICE'],
                        approved: false,
                        estimated: false
                    }, {
                        value: null,
                        qualifiers: ['P', 'FLD'],
                        approved: false,
                        estimated: false
                    }]
                }
            });
        });

        it('should return null the empty set if no time series for the selected key exist', () => {
            expect(getTimeSeriesForTsKey('compare:P7D')(TEST_DATA)).toEqual({});
        });
    });
});
