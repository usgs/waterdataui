const { variablesSelector, currentVariableSelector, timeSeriesSelector, isVisibleSelector, yLabelSelector,
    titleSelector, descriptionSelector, currentVariableTimeSeriesSelector, allTimeSeriesSelector,
    requestTimeRangeSelector} = require('./timeseries');


const TEST_DATA = {
    series: {
        timeSeries: {
            '00060': {
                tsKey: 'current',
                startTime: new Date('2018-03-06T15:45:00.000Z'),
                endTime: new Date('2018-03-13t13:45:00.000Z'),
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
                tsKey: 'compare',
                startTime: new Date('2017-03-06T15:45:00.000Z'),
                endTime: new Date('2017-03-13t13:45:00.000Z'),
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
                }]}
        },
        timeSeriesCollections: {
            'coll1': {
                variable: 45807197,
                timeSeries: ['00060']
            }
        },
        requests: {
            current: {
                timeSeriesCollections: ['coll1']
            }
        },
        variables: {
            '45807197': {
                variableCode: '00060',
                variableName: 'Streamflow',
                variableDescription: 'Discharge, cubic feet per second',
                oid: '45807197'
            },
            '45807196': {
                variableCode: '00010',
                variableName: 'Gage Height',
                variableDescription: 'Gage Height in feet',
                oid: '45807196'
            }
        },
        queryInfo: {
            current: {
                notes: {
                    requestDT: new Date('2017-01-09T20:46:07.542Z'),
                    'filter:timeRange': {
                        mode: 'PERIOD',
                        periodDays: 7,
                        modifiedSince: null
                    }
                }
            }
        }
    },
    currentVariableID: '45807197'
};

describe('Timeseries module', () => {

    const TEST_VARIABLES = {
            '45807042': {
                'variableCode': {
                    value: '00010'
                },
                'variableName': 'Temperature'
            },
            '45807197': {
                'variableCode': {
                    value: '00060'
                },
                'variableName': 'Streamflow'
            }
        };

    describe('variablesSelector', () => {

        it('should return the variables object', () => {
            expect(variablesSelector({
                series: {
                    variables: TEST_VARIABLES
                }
            })).toEqual(TEST_VARIABLES);
        });

        it('Should return null if no variables are in the state', () => {
            expect(variablesSelector({
                series: {}
            })).toBeNull();
        });
    });

    describe('currentVariableSelector', () => {

        it('should return the selected variable information', () => {
            expect(currentVariableSelector({
                series: {
                    variables: TEST_VARIABLES
                },
                currentVariableID: '45807197'
            })).toEqual({
                'variableCode': {
                    value: '00060'
                },
                'variableName': 'Streamflow'
            });
        });

        it('should return null if no currentVariableID set', () => {
            expect(currentVariableSelector({
                series: {
                    variables: TEST_VARIABLES
                },
                currentVariableID: null
            })).toBeNull();
        });
    });

    describe('allTimesSeriesSelector', () => {

        it('should return all timeseries if they have data points', () => {
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

        it('should exclude timeseries if they do not have data points', () => {
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
                        current: {
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
                            tsKey: 'current',
                            variable: 45807197
                        },
                        two: {
                            item: 'two',
                            points: [],
                            tsKey: 'current',
                            variable: 45807197
                        },
                        three: {
                            item: 'three',
                            points: [3, 4],
                            tsKey: 'current',
                            variable: 45807197
                        },
                        four: {
                            item: 'four',
                            points: [4, 5],
                            tsKey: 'current',
                            variable: 45807197
                        },
                        five: {
                            item: 'five',
                            points: [5, 6],
                            tsKey: 'compare',
                            variable: 45807190
                        },
                        six: {
                            item: 'six',
                            points: [6, 7],
                            tsKey: 'compare',
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
                currentVariableID: '45807197'
            })).toEqual({
                one: {item: 'one', points: [1, 2], tsKey: 'current', variable: 45807197},
                three: {item: 'three', points: [3, 4], tsKey: 'current', variable: 45807197},
                four: {item: 'four', points: [4, 5], tsKey: 'current', variable: 45807197}
            });
        });

        it('returns {} if there is no currentVariableId', () => {
            expect(currentVariableTimeSeriesSelector('current')({
                series: {},
                currentVariableID: null
            })).toEqual({});
        });
    });

    describe('timeSeriesSelector', () => {

        it('should return the selected time series', () => {
            expect(timeSeriesSelector('current')(TEST_DATA)).toEqual({
                '00060': {
                    tsKey: 'current',
                    startTime: new Date('2018-03-06T15:45:00.000Z'),
                    endTime: new Date('2018-03-13t13:45:00.000Z'),
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
        });

        it('should return null the empty set if no time series for the selected key exist', () => {
            expect(timeSeriesSelector('median')(TEST_DATA)).toEqual({});
        });
    });

    describe('isVisibleSelector', () => {
        it('Returns whether the time series is visible', () => {
            const store = {
                showSeries: {
                    'current': true,
                    'compare': false,
                    'median': true
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
                currentVariableID: null
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
                currentVariableID: null
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

    describe('requestTimeRangeSelector', () => {
        it('should use queryInfo requestDT for period queries', () => {
            expect(requestTimeRangeSelector({
                series: {
                    queryInfo: {
                        current: {
                            notes: {
                                requestDT: new Date('2017-01-09T20:46:07.542Z'),
                                'filter:timeRange': {
                                    mode: 'PERIOD',
                                    periodDays: 7,
                                    modifiedSince: null
                                }
                            }
                        }
                    }
                }
            })).toEqual({
                current: {
                    start: new Date('2017-01-02T20:46:07.542Z'),
                    end: new Date('2017-01-09T20:46:07.542Z')
                }
            });
        });
    });

    describe('requestTimeRangeSelector', () => {
        it('should use filter:timeRange values for range queries', () => {
            expect(requestTimeRangeSelector({
                series: {
                    queryInfo: {
                        compare: {
                            notes: {
                                requestDT: new Date('2017-01-09T20:46:07.542Z'),
                                'filter:timeRange': {
                                    mode: 'RANGE',
                                    modifiedSince: null,
                                    interval: {
                                        start: new Date(2017, 10, 10),
                                        end: new Date(2017, 10, 20)
                                    }
                                }
                            }
                        }
                    }
                }
            })).toEqual({
                compare: {
                    start: new Date(2017, 10, 10),
                    end: new Date(2017, 10, 20)
                }
            });
        });
    });
});
