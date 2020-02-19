import {
    getTimeSeriesForTsKey, hasTimeSeriesWithPoints, isVisibleSelector, yLabelSelector, titleSelector,
    descriptionSelector, getCurrentVariableTimeSeries, tsTimeZoneSelector,
    getAllMethodsForCurrentVariable, secondaryYLabelSelector} from './time-series';


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

describe('TimeSeries module', () => {

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

    describe('hasTimeSeriesWithPoints', () => {
        it('Returns true if the time series for tsKey and period have non zero points', () => {
            expect(hasTimeSeriesWithPoints('current')(TEST_DATA)).toBe(true);
            expect(hasTimeSeriesWithPoints('current', 'P30D')(TEST_DATA)).toBe(true);
        });
        it('Returns false if the times series for tsKey and period have zero time series', () => {
            expect(hasTimeSeriesWithPoints('compare', 'P30D')(TEST_DATA)).toBe(false);
        });
    });

    describe('isVisibleSelector', () => {
        it('Returns whether the time series is visible', () => {
            const store = {
                timeSeriesState: {
                    showSeries: {
                        'current': true,
                        'compare': false,
                        'median': true
                    }
                }
            };

            expect(isVisibleSelector('current')(store)).toBe(true);
            expect(isVisibleSelector('compare')(store)).toBe(false);
            expect(isVisibleSelector('median')(store)).toBe(true);
        });
    });

    describe('yLabelSelector', () => {
        it('Returns string to be used for labeling the y axis', () => {
            expect(yLabelSelector(TEST_DATA)).toBe('Discharge, cubic feet per second');
        });

        it('Returns empty string if no variable selected', () => {
            expect(yLabelSelector({
                ...TEST_DATA,
                timeSeriesState: {
                    ...TEST_DATA.timeSeriesState,
                    currentVariableID: null
                }
            })).toBe('');
        });
    });

    describe('secondaryYLabelSelector', () => {
        it('returns a secondary label when a celsius parameter is selected', () => {
             expect(secondaryYLabelSelector({
                 ...TEST_DATA,
                 timeSeriesState: {
                     ...TEST_DATA.timeSeriesState,
                     currentVariableID: '45807196'
                 }
             })).toEqual('degrees Fahrenheit');
        });

        it('returns a secondary label when a fahrenheit parameter is selected', () => {
             expect(secondaryYLabelSelector({
                 ...TEST_DATA,
                 timeSeriesState: {
                     ...TEST_DATA.timeSeriesState,
                     currentVariableID: '45807195'
                 }
             })).toEqual('degrees Celsius');
        });

        it('does not return a secondary when a parameter when a non-temperature parameter is selected', () => {
             expect(secondaryYLabelSelector(TEST_DATA)).toBeNull();
        });
    });

    describe('titleSelector', () => {
        it('Returns the string to used for graph title', () => {
            expect(titleSelector(TEST_DATA)).toBe('Streamflow');
        });
        it('Returns the title string with the method description appended', () => {
            expect(titleSelector({
                ...TEST_DATA,
                timeSeriesState: {
                    ...TEST_DATA.timeSeriesState,
                    currentMethodID: 69330
                }
            })).toBe('Streamflow' + ', ' + '4.1 ft from riverbed (middle)');
        });
        it('Returns empty string if no variable selected', () => {
            expect(titleSelector({
                ...TEST_DATA,
                timeSeriesState: {
                    ...TEST_DATA.timeSeriesState,
                    currentVariableID: null
                }
            })).toBe('');
        });
    });

    describe('descriptionSelector', () => {
        it('Returns a description with the date for the current times series', () => {
            const result = descriptionSelector(TEST_DATA);

            expect(result).toContain('Discharge, cubic feet per second');
            expect(result).toContain('1/2/2017');
            expect(result).toContain('1/9/2017');
        });
    });

    describe('tsTimeZoneSelector', () => {

        it('Returns local if series is empty', () => {
            const result = tsTimeZoneSelector({
                series: {}
            });
            expect(result).toEqual('local');
        });

        it('Returns local if timezone is null', () => {
            const result = tsTimeZoneSelector({
                series: {
                    ianaTimeZone: null
                }
            });
            expect(result).toEqual('local');
        });

        it('Returns the IANA timezone NWIS and IANA agree', () => {
            const result = tsTimeZoneSelector({
                series: {
                    ianaTimeZone: 'America/New_York'
                }
            });
            expect(result).toEqual('America/New_York');
        });
    });
});
