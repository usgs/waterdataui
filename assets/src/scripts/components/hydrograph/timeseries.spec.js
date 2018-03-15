const { variablesSelector, currentVariableSelector, timeSeriesSelector, isVisibleSelector,
    currentVariableTimeSeriesSelector, allTimeSeriesSelector } = require('./timeseries');


const TEST_DATA = {
    series: {
        timeSeries: {
            '00060': {
                tsKey: 'current',
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
            '000010': {
                tsKey: 'compare',
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
                oid: 45807197
            }
        }
    },
    currentVariableID: '45807197'
};

fdescribe('Timeseries module', () => {

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
});
