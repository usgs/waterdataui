const { lineSegmentsSelector, pointsSelector, currentVariableTimeSeriesSelector,
    pointsTableDataSelector, allTimeSeriesSelector } = require('./timeseries');


const TEST_DATA = {
    series: {
        timeSeries: {
            '00060': {
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

    describe('all time series selector', () => {

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

    describe('line segment selector', () => {
        it('should separate on approved', () => {
            expect(lineSegmentsSelector('current')({
                ...TEST_DATA,
                series: {
                    ...TEST_DATA.series,
                    timeSeries: {
                        ...TEST_DATA.series.timeSeries,
                        '00060': {
                            points: [{
                                value: 10,
                                qualifiers: []
                            }, {
                                value: 10,
                                qualifiers: ['A']
                            }, {
                                value: 10,
                                qualifiers: ['A']
                            }]
                        }
                    }
                }
            })).toEqual({
                '00060': [
                    {
                        'classes': {
                            'approved': false,
                            'estimated': false,
                            'dataMask': null
                        },
                        'points': [
                            {
                                'value': 10,
                                'qualifiers': []
                            }
                        ]
                    },
                    {
                        'classes': {
                            'approved': true,
                            'estimated': false,
                            'dataMask': null
                        },
                        'points': [
                            {
                                'value': 10,
                                'qualifiers': [
                                    'A'
                                ]
                            },
                            {
                                'value': 10,
                                'qualifiers': [
                                    'A'
                                ]
                            }
                        ]
                    }
                ]
            });
        });

        it('should separate on estimated', () => {
            expect(lineSegmentsSelector('current')({
                ...TEST_DATA,
                series: {
                    ...TEST_DATA.series,
                    timeSeries: {
                        ...TEST_DATA.series.timeSeries,
                        '00060': {
                            points: [{
                                value: 10,
                                qualifiers: ['P']
                            }, {
                                value: 10,
                                qualifiers: ['P', 'E']
                            }, {
                                value: 10,
                                qualifiers: ['P', 'E']
                            }]
                        }
                    }
                }
            })).toEqual({
                '00060': [
                    {
                        'classes': {
                            'approved': false,
                            'estimated': false,
                            'dataMask': null
                        },
                        'points': [
                            {
                                'value': 10,
                                'qualifiers': [
                                    'P'
                                ]
                            }
                        ]
                    },
                    {
                        'classes': {
                            'approved': false,
                            'estimated': true,
                            'dataMask': null
                        },
                        'points': [
                            {
                                'value': 10,
                                'qualifiers': [
                                    'P',
                                    'E'
                                ]
                            },
                            {
                                'value': 10,
                                'qualifiers': [
                                    'P',
                                    'E'
                                ]
                            }
                        ]
                    }
                ]
            });
        });

        it('should separate out masked values', () => {
            expect(lineSegmentsSelector('current')({
                ...TEST_DATA,
                series: {
                    ...TEST_DATA.series,
                    timeSeries: {
                        ...TEST_DATA.series.timeSeries,
                        '00060': {
                            points: [{
                                value: 10,
                                qualifiers: ['P']
                            }, {
                                value: null,
                                qualifiers: ['P', 'ICE']
                            }, {
                                value: null,
                                qualifiers: ['P', 'FLD']
                            }]
                        }
                    }
                }
            })).toEqual({
                '00060': [
                    {
                        'classes': {
                            'approved': false,
                            'estimated': false,
                            'dataMask': null
                        },
                        'points': [
                            {
                                'value': 10,
                                'qualifiers': [
                                    'P'
                                ]
                            }
                        ]
                    },
                    {
                        'classes': {
                            'approved': false,
                            'estimated': false,
                            'dataMask': 'ice'
                        },
                        'points': [
                            {
                                'value': null,
                                'qualifiers': [
                                    'P',
                                    'ICE'
                                ]
                            }
                        ]
                    },
                    {
                        'classes': {
                            'approved': false,
                            'estimated': false,
                            'dataMask': 'fld'
                        },
                        'points': [
                            {
                                'value': null,
                                'qualifiers': [
                                    'P',
                                    'FLD'
                                ]
                            }
                        ]
                    }
                ]});
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
    });

    describe('pointsSelector', () => {
        it('works with a single collection and two time series', () => {
            expect(pointsSelector('current')({
                series: {
                    requests: {
                        current: {
                            timeSeriesCollections: ['coll1']
                        }
                    },
                    timeSeriesCollections: {
                        'coll1': {
                            variable: 45807197,
                            timeSeries: ['one', 'two']
                        }
                    },
                    timeSeries: {
                        one: {
                            points: ['ptOne', 'ptTwo', 'ptThree']
                        },
                        two: {
                            points: ['ptOne2', 'ptTwo2', 'ptThree2']
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
            })).toEqual([['ptOne', 'ptTwo', 'ptThree'], ['ptOne2', 'ptTwo2', 'ptThree2']]);
        });
    });

    describe('pointsTableDataSelect', () => {
        it('Return an array of arrays if series is visible', () => {
            expect(pointsTableDataSelector('current')({
                series: {
                    requests: {
                        current: {
                            timeSeriesCollections: ['coll1']
                        }
                    },
                    timeSeriesCollections: {
                        'coll1': {
                            variable: 45807197,
                            timeSeries: ['one']
                        }
                    },
                    timeSeries: {
                        one: {
                            tsKey: 'current',
                            points: [{
                                dateTime: '2018-01-01',
                                qualifiers: ['P'],
                                approved: false,
                                estimated: false
                            }, {
                                value: 15,
                                approved: false,
                                estimated: true
                            }, {
                                value: 10,
                                dateTime: '2018-01-03',
                                qualifiers: ['P', 'Ice'],
                                approved: false,
                                estimated: true
                            }]
                        }
                    },
                    variables: {
                        '45807197': {
                            variableCode: '00060',
                            oid: 45807197
                        }
                    }
                },
                currentVariableID: '45807197',
                showSeries: {
                    current: true
                }
            })).toEqual({
                one: [
                    ['', '2018-01-01', 'P'],
                    [15, '', ''],
                    [10, '2018-01-03', 'P, Ice']
                ]
            });
        });
    });
});
