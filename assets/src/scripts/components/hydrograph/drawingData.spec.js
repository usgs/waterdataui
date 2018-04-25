
const { lineSegmentsSelector, pointsSelector, pointsTableDataSelector, allPointsSelector, pointsByTsKeySelector,
    classesForPoint, lineSegmentsByParmCdSelector, currentVariableLineSegmentsSelector,
    currentVariablePointsSelector, currentVariablePointsByTsIdSelector, visiblePointsSelector, MAX_LINE_POINT_GAP } = require('./drawingData');

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
                variable: '45807196',
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
            '00045': {
                tsKey: 'current',
                startTime: new Date('2017-03-06T15:45:00.000Z'),
                endTime: new Date('2017-03-13t13:45:00.000Z'),
                variable: '45807140',
                points: [{
                    value: 0,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }, {
                    value: 0.01,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }, {
                    value: 0.02,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }, {
                    value: 0.03,
                    qualifiers: ['P'],
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
                variableCode: {value: '00060'},
                variableName: 'Streamflow',
                variableDescription: 'Discharge, cubic feet per second',
                oid: '45807197'
            },
            '45807196': {
                variableCode: {value: '00010'},
                variableName: 'Gage Height',
                variableDescription: 'Gage Height in feet',
                oid: '45807196'
            },
            '45807140': {
                variableCode: {value: '00045'},
                variableName: 'Precipitation',
                variableDescription: 'Precipitation in inches'
            }
        }
    },
    timeseriesState: {
        currentVariableID: '45807197',
        currentDateRange: 'P7D'
    }
};

describe('drawingData module', () => {

    describe('allPointsSelector', () => {

        const result = allPointsSelector(TEST_DATA);
        it('Return three timeseries', () => {
            expect(Object.keys(result).length).toBe(3);
            expect(result['00060']).toBeDefined();
            expect(result['00010']).toBeDefined();
            expect(result['00045']).toBeDefined();
        });

        it('Return the points array for time series with parameter code 00060 without modification', () => {
            expect(result['00060']).toEqual(TEST_DATA.series.timeSeries['00060'].points);
        });

        it('Return the points array accumulated for the time series with  parameter code 00045', () => {
            expect(result['00045'].map((point) => point.value)).toEqual([0, 0.01, 0.03, 0.06]);
        });

        it('Return the empty object if there are no timeseries', () =>  {
            expect(allPointsSelector({series: {}})).toEqual({});
        });

        it('Resets the accumulator for precip if null value is encountered', () => {
            const newTestData = {
                ...TEST_DATA,
                series: {
                    ...TEST_DATA.series,
                    timeSeries: {
                        ...TEST_DATA.series.timeSeries,
                        '00045': {
                            tsKey: 'current',
                            startTime: new Date('2017-03-06T15:45:00.000Z'),
                            endTime: new Date('2017-03-13t13:45:00.000Z'),
                            variable: '45807140',
                            points: [{
                                value: 0.01,
                                qualifiers: ['P'],
                                approved: false,
                                estimated: false
                            }, {
                                value: 0.02,
                                qualifiers: ['P'],
                                approved: false,
                                estimated: false
                            }, {
                                value: null,
                                qualifiers: ['P'],
                                approved: false,
                                estimated: false
                            }, {
                                value: 0.04,
                                qualifiers: ['P'],
                                approved: false,
                                estimated: false
                            }]
                        }
                    }
                }
            };

            expect(allPointsSelector(newTestData)['00045'].map((point) => point.value)).toEqual([0.01, 0.03, null, 0.04]);
        });
    });

    describe('pointsByTsKeySelector', () => {
        it('Return the points array for the ts Key selector', () => {
            const result = pointsByTsKeySelector('current')()(TEST_DATA);

            expect(Object.keys(result).length).toBe(2);
            expect(result['00060']).toBeDefined();
            expect(result['00045']).toBeDefined();
        });

        it('return the empty object if no time series for series', () => {
            expect(pointsByTsKeySelector('median')()(TEST_DATA)).toEqual({});
        });
    });

    describe('currentVariablePointsByTsIdSelector', () => {
       it('Return the current variable for the tsKey', () => {
           const result = currentVariablePointsByTsIdSelector('current')(TEST_DATA);

           expect(result['00060']).toBeDefined();
           expect(result['00060']).toEqual(TEST_DATA.series.timeSeries['00060'].points);
       });

       it('Return an empty array if the tsKey has no time series with the current variable', () => {
           expect(currentVariablePointsByTsIdSelector('compare')(TEST_DATA)).toEqual({});
       });
    });

    describe('currentVariablePointsSelector', () => {
       it('Return the current variable for the tsKey', () => {
           const result = currentVariablePointsSelector('current')(TEST_DATA);

           expect(result.length).toBe(1);
           expect(result[0]).toEqual(TEST_DATA.series.timeSeries['00060'].points);
       });

       it('Return an empty array if the tsKey has no time series with the current variable', () => {
           expect(currentVariablePointsSelector('compare')(TEST_DATA)).toEqual([]);
       });
    });

    describe('line segment selector', () => {
        it('should separate on approved', () => {
            expect(lineSegmentsSelector('current')()({
                ...TEST_DATA,
                series: {
                    ...TEST_DATA.series,
                    timeSeries: {
                        ...TEST_DATA.series.timeSeries,
                        '00060': {
                            ...TEST_DATA.series.timeSeries['00060'],
                            points: [{
                                value: 10,
                                qualifiers: []
                            }, {
                                value: 10,
                                qualifiers: ['A']
                            }, {
                                value: 10,
                                qualifiers: ['A']
                            }],
                            tsKey: 'current'
                        },
                        '00045': {
                            ...TEST_DATA.series.timeSeries['00045'],
                            tsKey: 'compare'
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
            expect(lineSegmentsSelector('current')()({
                ...TEST_DATA,
                series: {
                    ...TEST_DATA.series,
                    timeSeries: {
                        ...TEST_DATA.series.timeSeries,
                        '00060': {
                            ...TEST_DATA.series.timeSeries['00060'],
                            points: [{
                                value: 10,
                                qualifiers: ['P']
                            }, {
                                value: 10,
                                qualifiers: ['P', 'E']
                            }, {
                                value: 10,
                                qualifiers: ['P', 'E']
                            }],
                            tsKey: 'current'
                        },
                        '00045': {
                            ...TEST_DATA.series.timeSeries['00045'],
                            tsKey: 'compare'
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
            expect(lineSegmentsSelector('current')()({
                ...TEST_DATA,
                series: {
                    ...TEST_DATA.series,
                    timeSeries: {
                        ...TEST_DATA.series.timeSeries,
                        '00060': {
                            ...TEST_DATA.series.timeSeries['00060'],
                            points: [{
                                value: 10,
                                qualifiers: ['P']
                            }, {
                                value: null,
                                qualifiers: ['P', 'ICE']
                            }, {
                                value: null,
                                qualifiers: ['P', 'FLD']
                            }],
                            tsKey: 'current'
                        },
                        '00045': {
                            ...TEST_DATA.series.timeSeries['00045'],
                            tsKey: 'compare'
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

        it('should separate on gaps greater than MAX_LINE_POINT_GAP', () => {
            const dates = [
                new Date(0),
                new Date(MAX_LINE_POINT_GAP - 1),
                new Date(MAX_LINE_POINT_GAP),
                new Date(2 * MAX_LINE_POINT_GAP),
                new Date(3 * MAX_LINE_POINT_GAP + 1),
                new Date(3 * MAX_LINE_POINT_GAP + 2)
            ];
            expect(lineSegmentsSelector('current')()({
                ...TEST_DATA,
                series: {
                    ...TEST_DATA.series,
                    timeSeries: {
                        ...TEST_DATA.series.timeSeries,
                        '00060': {
                            ...TEST_DATA.series.timeSeries['00060'],
                            points: dates.map(d => {
                                return {
                                    value: 10,
                                    dateTime: d,
                                    qualifiers: ['P']
                                };
                            }),
                            tsKey: 'current'
                        },
                        '00045': {
                            ...TEST_DATA.series.timeSeries['00045'],
                            tsKey: 'compare'
                        }
                    }
                }
            })).toEqual({
                '00060': [{
                    'classes': {
                        'approved': false,
                        'estimated': false,
                        'dataMask': null
                    },
                    'points': [{
                            'value': 10,
                            'dateTime': dates[0],
                            'qualifiers': ['P']
                        }, {
                            'value': 10,
                            'dateTime': dates[1],
                            'qualifiers': ['P']
                        }, {
                            'value': 10,
                            'dateTime': dates[2],
                            'qualifiers': ['P']
                        }, {
                            'value': 10,
                            'dateTime': dates[3],
                            'qualifiers': ['P']
                        }
                    ]
                }, {
                    'classes': {
                        'approved': false,
                        'estimated': false,
                        'dataMask': null
                    },
                    'points': [{
                        'value': 10,
                        'dateTime': dates[4],
                        'qualifiers': ['P']
                    }, {
                        'value': 10,
                        'dateTime': dates[5],
                        'qualifiers': ['P']
                    }]
                }]
            });
        });

        it('should not separate on gaps greater than MAX_LINE_POINT_GAP if points masked', () => {
            const dates = [
                new Date(0),
                new Date(MAX_LINE_POINT_GAP - 1),
                new Date(MAX_LINE_POINT_GAP),
                new Date(2 * MAX_LINE_POINT_GAP),
                new Date(3 * MAX_LINE_POINT_GAP + 1),
                new Date(3 * MAX_LINE_POINT_GAP + 2)
            ];
            expect(lineSegmentsSelector('current')()({
                ...TEST_DATA,
                series: {
                    ...TEST_DATA.series,
                    timeSeries: {
                        ...TEST_DATA.series.timeSeries,
                        '00060': {
                            ...TEST_DATA.series.timeSeries['00060'],
                            points: dates.map(d => {
                                return {
                                    value: null,
                                    dateTime: d,
                                    qualifiers: ['Ice']
                                };
                            }),
                            tsKey: 'current'
                        },
                        '00045': {
                            ...TEST_DATA.series.timeSeries['00045'],
                            tsKey: 'compare'
                        }
                    }
                }
            })).toEqual({
                '00060': [{
                    'classes': {
                        'approved': false,
                        'estimated': false,
                        'dataMask': 'ice'
                    },
                    'points': [{
                        'value': null,
                        'dateTime': dates[0],
                        'qualifiers': ['Ice']
                    }, {
                        'value': null,
                        'dateTime': dates[1],
                        'qualifiers': ['Ice']
                    }, {
                        'value': null,
                        'dateTime': dates[2],
                        'qualifiers': ['Ice']
                    }, {
                        'value': null,
                        'dateTime': dates[3],
                        'qualifiers': ['Ice']
                    }, {
                        'value': null,
                        'dateTime': dates[4],
                        'qualifiers': ['Ice']
                    }, {
                        'value': null,
                        'dateTime': dates[5],
                        'qualifiers': ['Ice']
                    }]
                }]
            });
        });
    });

    describe('lineSegmentsByParmCdSelector', () => {
        it('Should return two mappings for current time series', () => {
            const result = lineSegmentsByParmCdSelector('current')()(TEST_DATA);

            expect(Object.keys(result).length).toBe(2);
            expect(result['00060']).toBeDefined();
            expect(result['00045']).toBeDefined();
        });
    });

    describe('currentVariableLineSegmentsSelector', () => {
        it('Should return a single time series for current', () => {
            const result = currentVariableLineSegmentsSelector('current')(TEST_DATA);

            expect(Object.keys(result).length).toBe(1);
            expect(result['00060']).toBeDefined();
        });

        it('Should return an empty object for the compare time series', () => {
            expect(currentVariableLineSegmentsSelector('compare')(TEST_DATA)).toEqual({});
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
                            points: ['ptOne', 'ptTwo', 'ptThree'],
                            tsKey: 'current',
                            variable: 45807197
                        },
                        two: {
                            points: ['ptOne2', 'ptTwo2', 'ptThree2'],
                            tsKey: 'current',
                            variable: 45807197
                        }
                    },
                    variables: {
                        '45807197': {
                            variableCode: {
                                value: '00060'
                            },
                            oid: 45807197
                        }
                    }
                },
                timeseriesState: {
                    currentVariableID: '45807197',
                    currentDateRange: 'P7D'
                }
            })).toEqual([['ptOne', 'ptTwo', 'ptThree'], ['ptOne2', 'ptTwo2', 'ptThree2']]);
        });
    });

    describe('classesforPoint', () => {
        it('Return expected classes', () => {
            expect(classesForPoint({qualifiers: ['F', 'G']})).toEqual({
                approved: false,
                estimated: false
            });
            expect(classesForPoint({qualifiers: ['A', 'G']})).toEqual({
                approved: true,
                estimated: false
            });
            expect(classesForPoint({qualifiers: ['E','G']})).toEqual({
                approved: false,
                estimated: true
            });
        });
    });

    describe('visiblePointsSelector', () => {
        const testData = {
            ...TEST_DATA,
            series: {
                ...TEST_DATA.series,
                timeSeries: {
                    ...TEST_DATA.series.timeSeries,
                    '00060:median': {
                        tsKey: 'median',
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
                    }
                }
            },
            timeseriesState: {
                ...TEST_DATA.timeseriesState,
                showSeries: {
                    'current': true,
                    'compare': true,
                    'median': true
                }
            }
        };

        it('Return two arrays', () => {
           expect(visiblePointsSelector(testData).length).toBe(2);
        });

        it('Expects one array if only median is not visible', () => {
            const newTestData = {
                ...testData,
                timeseriesState: {
                    ...testData.timeseriesState,
                    showSeries: {
                        'current': true,
                        'compare': true,
                        'median': false
                    }
                }
            };

            expect(visiblePointsSelector(newTestData).length).toBe(1);
        });

        it('Expects an empty array if no visible series has the current variable', () => {
            const newTestData = {
                ...testData,
                timeseriesState: {
                    ...testData.timeseriesState,
                    currentVariableID: '11111111'
                }
            };

            expect(visiblePointsSelector(newTestData).length).toBe(0);
        });
    });

    describe('pointsTableDataSelect', () => {
        it('Return an array of arrays if series is visible', () => {
            const result = pointsTableDataSelector('current')({
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
                            }],
                            variable: '45807197'
                        }
                    },
                    variables: {
                        '45807197': {
                            variableCode: {value: '00060'},
                            oid: 45807197
                        }
                    }
                },
                timeseriesState: {
                    currentVariableID: '45807197',
                    currentDateRange: 'P7D',
                    showSeries: {
                        current: true
                    }
                }
            });
            expect(result).toEqual({
                one: [
                    ['', '2018-01-01', 'P'],
                    [15, '', ''],
                    [10, '2018-01-03', 'P, Ice']
                ]
            });
        });
    });
});