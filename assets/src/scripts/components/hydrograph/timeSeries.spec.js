const { timeSeriesSelector, hasTimeSeriesWithPoints, isVisibleSelector, yLabelSelector,
    titleSelector, descriptionSelector, currentVariableTimeSeriesSelector,
    allTimeSeriesSelector, requestTimeRangeSelector, tsTimeZoneSelector} = require('./timeSeries');


const TEST_DATA = {
    series: {
        timeSeries: {
            '00060': {
                tsKey: 'current:P7D',
                startTime: 1520351100000,
                endTime: 1520948700000,
                variable: '45807197',
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
                variables: '45807196',
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
            '00060:P30D': {
                tsKey: 'current:P30D:00060',
                startTime: 1520351100000,
                endTime: 1520948700000,
                variable: '45807197',
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
                variableName: 'Gage Height',
                variableDescription: 'Gage Height in feet',
                oid: '45807196'
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

    describe('allTimesSeriesSelector', () => {

        it('should return all time series if they have data points', () => {
            expect(allTimeSeriesSelector({
                series: {
                    timeSeries: {
                        '00010': {
                            points: [1, 2, 3, 4]
                        },
                        '00095': {
                            points: [8, 9, 10, 11]
                        }
                    }
                }
            })).toEqual({
                '00010': {
                    points: [1, 2, 3, 4]
                },
                '00095': {
                    points: [8, 9, 10, 11]
                }
            });
        });

        it('should exclude time series if they do not have data points', () => {
            expect(allTimeSeriesSelector({
                series: {
                    timeSeries: {
                        '00010': {
                            points: [1, 2, 3, 4]
                        },
                        '00095': {
                            points: []
                        }
                    }
                }
            })).toEqual({
                '00010': {
                    points: [1, 2, 3, 4]
                }
            });
        });
    });

    describe('currentVariableTimeSeriesSelector', () => {
        it('works', () => {
            expect(currentVariableTimeSeriesSelector('current')({
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
                three: {item: 'three', points: [3, 4], tsKey: 'current:P7D', variable: 45807197},
                four: {item: 'four', points: [4, 5], tsKey: 'current:P7D', variable: 45807197}
            });
        });

        it('returns {} if there is no currentVariableId', () => {
            expect(currentVariableTimeSeriesSelector('current')({
                series: {},
                timeSeriesState: {
                    currentVariableID: null,
                    currentDateRange: 'P7D'
                }
            })).toEqual({});
        });
    });

    describe('timeSeriesSelector', () => {

        it('should return the selected time series', () => {
            expect(timeSeriesSelector('current')(TEST_DATA)).toEqual({
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
                    variable: '45807197'
                }
            });
            expect(timeSeriesSelector('current','P30D')(TEST_DATA)).toEqual({
                '00060:P30D': {
                    tsKey: 'current:P30D:00060',
                    startTime: 1520351100000,
                    endTime: 1520948700000,
                    variable: '45807197',
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
            expect(timeSeriesSelector('median')(TEST_DATA)).toEqual({});
        });
    });

    describe('hasTimeSeriesWithPoints', () => {
        it('Returns true if the time series for tsKey and period have non zero points', () => {
            expect(hasTimeSeriesWithPoints('current')(TEST_DATA)).toBe(true);
            expect(hasTimeSeriesWithPoints('current', 'P30D')(TEST_DATA)).toBe(true);
        });
        it('Returns false if the times series for tsKey and period have zero points', () => {
            const newTestData = {
                ...TEST_DATA,
                series: {
                    ...TEST_DATA.series,
                    timeSeries: {
                        ...TEST_DATA.series.timeSeries,
                        '00060': {
                            tsKey: 'current:P7D',
                            startTime: 1520351100000,
                            endTime: 1520948700000,
                            variable: '45807197',
                            points: []
                        },
                        '00060:P30D': {
                            tsKey: 'current:P30D:00060',
                            startTime: 1520351100000,
                            endTime: 1520948700000,
                            variable: '45807197',
                            points: []
                        }
                    }
                }
            };
            expect(hasTimeSeriesWithPoints('current')(newTestData)).toBe(false);
            expect(hasTimeSeriesWithPoints('current', 'P30D')(newTestData)).toBe(false);
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

    describe('titleSelector', () => {
        it('Returns the string to used for graph title', () => {
            expect(titleSelector(TEST_DATA)).toBe('Streamflow');
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

        it('Returns UTC if series is empty', () => {
            const result = tsTimeZoneSelector({
                series: {}
            });
            expect(result).toEqual('UTC');
        });

        it('Returns UTC if NWIS and IANA time zones do not agree', () => {
            const result = tsTimeZoneSelector({
                series: {
                    ianaTimeZone: 'America/Juneau',
                    timeZones: {
                        'CDT': {'zoneAbbreviation': 'CDT'},
                        'CST': {'zoneAbbreviation': 'CST'}
                    }
                }
            });
            expect(result).toEqual('UTC');
        });

        it('Returns the IANA timezone NWIS and IANA agree', () => {
            const result = tsTimeZoneSelector({
                series: {
                    ianaTimeZone: 'America/New_York',
                    timeZones: {
                        'EDT': {'zoneAbbreviation': 'EDT'},
                        'EST': {'zoneAbbreviation': 'EST'}
                    }
                }
            });
            expect(result).toEqual('America/New_York');
        })
    });
});
