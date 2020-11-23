
import {DateTime} from 'luxon';

import {
    getLineSegments,
    getAllPoints,
    getPointsByTsKey,
    classesForPoint,
    getLineSegmentsByParmCd,
    getCurrentVariableLineSegments,
    getCurrentVariablePoints,
    getCurrentVariablePointsByTsId,
    getVisiblePoints,
    getCurrentVariableMedianStatPoints,
    MAX_LINE_POINT_GAP,
    getCurrentPointData
} from './drawing-data';


const TEST_DATA = {
    ivTimeSeriesData: {
        queryInfo: {
            'current:P7D': {
                notes: {
                    requestDT: new Date('2017-03-01 11:15').getTime(),
                    'filter:timeRange': {
                        mode: 'PERIOD',
                        periodDays: 7,
                        modifiedSince: null
                    }
                }
            }
        },
        methods: {
            69928: {
                methodDescription: '',
                methodID: 69928
            },
            69929: {
                methodDescription: '',
                methodID: 69929
            }
        },
        timeSeries: {
            '69928:00060': {
                tsKey: 'current:P7D',
                startTime: new Date('2018-03-06T15:45:00.000Z'),
                endTime: new Date('2018-03-13t13:45:00.000Z'),
                variable: '45807197',
                method: 69928,
                points: [{
                    value: 10,
                    qualifiers: ['A'],
                    dateTime: 1520351100000
                }, {
                    value: null,
                    qualifiers: ['E', 'ICE'],
                    dateTime: 1520352000000
                }, {
                    value: null,
                    qualifiers: ['P', 'FLD'],
                    dateTime: 1520352900000
                }]
            },
            '69929:00010': {
                tsKey: 'compare:P7D',
                variable: '45807196',
                method: 69929,
                points: [{
                    value: 1,
                    qualifiers: ['P'],
                    dateTime: 1488815100000
                }, {
                    value: 2,
                    qualifiers: ['P'],
                    dateTime: 1488816000000
                }, {
                    value: 3,
                    qualifiers: ['P'],
                    dateTime: 1488816900000
                }]
            },
            '69930:00045': {
                tsKey: 'current:P7D',

                variable: '45807140',
                method: 69930,
                points: [{
                    value: 0,
                    qualifiers: ['P'],
                    dateTime: 1520351100000
                }, {
                    value: 0.01,
                    qualifiers: ['P'],
                    dateTime: 1520352000000
                }, {
                    value: 0.02,
                    qualifiers: ['P'],
                    dateTime: 1520352900000
                }, {
                    value: 0.03,
                    qualifiers: ['P'],
                    dateTime: 1520353800000
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
            'compare:P7D': {}
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
    statisticsData : {
        median: {
            '00060': {
                '1234': [
                    {
                        month_nu: '2',
                        day_nu: '20',
                        p50_va: '40'
                    }, {
                        month_nu: '2',
                        day_nu: '21',
                        p50_va: '41'
                    }, {
                        month_nu: '2',
                        day_nu: '22',
                        p50_va: '42'
                    }, {
                        month_nu: '2',
                        day_nu: '23',
                        p50_va: '43'
                    }, {
                        month_nu: '2',
                        day_nu: '24',
                        p50_va: '44'
                    }, {
                        month_nu: '2',
                        day_nu: '25',
                        p50_va: '43'
                    }, {
                        month_nu: '2',
                        day_nu: '26',
                        p50_va: '42'
                    }, {
                        month_nu: '2',
                        day_nu: '27',
                        p50_va: '41'
                    }, {
                        month_nu: '2',
                        day_nu: '28',
                        p50_va: '40'
                    }, {
                        month_nu: '2',
                        day_nu: '29',
                        p50_va: '40'
                    }, {
                        month_nu: '3',
                        day_nu: '1',
                        p50_va: '39'
                    }, {
                        month_nu: '3',
                        day_nu: '2',
                        p50_va: '38'
                    }
                ]
            }
        }
    },
    ianaTimeZone: 'America/Chicago',
    ivTimeSeriesState: {
        currentIVVariableID: '45807197',
        currentIVDateRange: 'P7D',
        currentIVMethodID: 69928
    }
};

describe('monitoring-location/components/hydrograph/drawingData module', () => {

    describe('getAllPoints', () => {

        const result = getAllPoints(TEST_DATA);
        it('Return three time series', () => {
            expect(Object.keys(result).length).toBe(3);
            expect(result['69928:00060']).toBeDefined();
            expect(result['69929:00010']).toBeDefined();
            expect(result['69930:00045']).toBeDefined();
        });

        it('Return the points array for time series with parameter code 00060 without modification', () => {
            expect(result['69928:00060']).toEqual(TEST_DATA.ivTimeSeriesData.timeSeries['69928:00060'].points);
        });

        it('Return the points array accumulated for the time series with  parameter code 00045', () => {
            expect(result['69930:00045'].map((point) => point.value)).toEqual([0, 0.01, 0.03, 0.06]);
        });

        it('Return the empty object if there are no time series', () =>  {
            expect(getAllPoints({ivTimeSeriesData: {}})).toEqual({});
        });

        it('Resets the accumulator for precip if null value is encountered', () => {
            const newTestData = {
                ...TEST_DATA,
                ivTimeSeriesData: {
                    ...TEST_DATA.ivTimeSeriesData,
                    timeSeries: {
                        ...TEST_DATA.ivTimeSeriesData.timeSeries,
                        '69930:00045': {
                            tsKey: 'current:P7D',
                            startTime: new Date('2017-03-06T15:45:00.000Z'),
                            endTime: new Date('2017-03-13t13:45:00.000Z'),
                            variable: '45807140',
                            method: '69930',
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

            expect(getAllPoints(newTestData)['69930:00045'].map((point) => point.value)).toEqual([0.01, 0.03, null, 0.04]);
        });
    });

    describe('getPointsByTsKey', () => {
        it('Return the points array for the ts Key selector', () => {
            const result = getPointsByTsKey('current')(TEST_DATA);

            expect(Object.keys(result).length).toBe(2);
            expect(result['69928:00060']).toBeDefined();
            expect(result['69930:00045']).toBeDefined();
        });

        it('return the empty object if no time series for series', () => {
            expect(getPointsByTsKey('current:P30D:00010')(TEST_DATA)).toEqual({});
        });
    });

    describe('getCurrentVariablePointsByTsId', () => {
       it('Return the current variable for the tsKey', () => {
           const result = getCurrentVariablePointsByTsId('current')(TEST_DATA);

           expect(result['69928:00060']).toBeDefined();
           expect(result['69928:00060']).toEqual(TEST_DATA.ivTimeSeriesData.timeSeries['69928:00060'].points);
       });

       it('Return an empty array if the tsKey has no time series with the current variable', () => {
           expect(getCurrentVariablePointsByTsId('compare')(TEST_DATA)).toEqual({});
       });
    });

    describe('getCurrentVariablePoints', () => {
       it('Return the current variable for the tsKey', () => {
           const result = getCurrentVariablePoints('current')(TEST_DATA);

           expect(result.length).toBe(1);
           expect(result[0]).toEqual(TEST_DATA.ivTimeSeriesData.timeSeries['69928:00060'].points);
       });

       it('Return an empty array if the tsKey has no time series with the current variable', () => {
           expect(getCurrentVariablePoints('compare')(TEST_DATA)).toEqual([]);
       });
    });

    describe('getCurrentPointData', () => {
       it('Returns an empty array if no data exists', () => {
           const NEW_TEST_DATA = {
               ...TEST_DATA,
               ivTimeSeriesState: {
                   ...TEST_DATA.ivTimeSeriesData,
                   currentIVVariableID: '45807196'
               }
           };
           expect(getCurrentPointData(NEW_TEST_DATA)).toEqual([]);
       });

       it('Returns the expected data', () => {
           const result = getCurrentPointData(TEST_DATA);

           expect(result.length).toBe(3);
           expect(result[0]).toEqual({
               parameterName: 'Streamflow',
               dateTime: '2018-03-06T09:45-06:00',
               result: '10',
               approvals: 'Approved',
               masks: ''
           });
           expect(result[1]).toEqual({
               parameterName: 'Streamflow',
               dateTime: '2018-03-06T10:00-06:00',
               result: '',
               approvals: 'Estimated',
               masks: 'Ice Affected'
           });
           expect(result[2]).toEqual({
               parameterName: 'Streamflow',
               dateTime: '2018-03-06T10:15-06:00',
               result: '',
               approvals: 'Provisional',
               masks: 'Flood'
           });
       });
    });

    describe('line segment selector', () => {
        it('should separate on approved', () => {
            expect(getLineSegments('current')({
                ...TEST_DATA,
                ivTimeSeriesData: {
                    ...TEST_DATA.ivTimeSeriesData,
                    timeSeries: {
                        ...TEST_DATA.ivTimeSeriesData.timeSeries,
                        '69928:00060': {
                            ...TEST_DATA.ivTimeSeriesData.timeSeries['69928:00060'],
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
                            tsKey: 'current:P7D'
                        },
                        '69930:00045': {
                            ...TEST_DATA.ivTimeSeriesData.timeSeries['69930:00045'],
                            tsKey: 'compare:P7D'
                        }
                    }
                }
            })).toEqual({
                '69928:00060': [
                    {
                        'classes': {
                            'approved': false,
                            'estimated': false,
                            'currentMethod': true,
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
                            'currentMethod': true,
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
            expect(getLineSegments('current')({
                ...TEST_DATA,
                ivTimeSeriesData: {
                    ...TEST_DATA.ivTimeSeriesData,
                    timeSeries: {
                        ...TEST_DATA.ivTimeSeriesData.timeSeries,
                        '69928:00060': {
                            ...TEST_DATA.ivTimeSeriesData.timeSeries['69928:00060'],
                            variable: '45807197',
                            points: [{
                                value: 10,
                                qualifiers: ['P']
                            }, {
                                value: 10,
                                qualifiers: ['P', 'e']
                            }, {
                                value: 10,
                                qualifiers: ['P', 'E']
                            }],
                            tsKey: 'current:P7D'
                        },
                        '69930:00045': {
                            ...TEST_DATA.ivTimeSeriesData.timeSeries['69930:00045'],
                            tsKey: 'compare:P7D'
                        }
                    }
                }
            })).toEqual({
                '69928:00060': [
                    {
                        'classes': {
                            'approved': false,
                            'estimated': false,
                            'currentMethod': true,
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
                            'dataMask': null,
                            'currentMethod': true
                        },
                        'points': [
                            {
                                'value': 10,
                                'qualifiers': [
                                    'P',
                                    'e'
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
            expect(getLineSegments('current')({
                ...TEST_DATA,
                ivTimeSeriesData: {
                    ...TEST_DATA.ivTimeSeriesData,
                    timeSeries: {
                        ...TEST_DATA.ivTimeSeriesData.timeSeries,
                        '69928:00060': {
                            ...TEST_DATA.ivTimeSeriesData.timeSeries['69928:00060'],
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
                            tsKey: 'current:P7D'
                        },
                        '69930:00045': {
                            ...TEST_DATA.ivTimeSeriesData.timeSeries['69930:00045'],
                            tsKey: 'compare:P7D'
                        }
                    }
                }
            })).toEqual({
                '69928:00060': [
                    {
                        'classes': {
                            'approved': false,
                            'estimated': false,
                            'currentMethod': true,
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
                            'currentMethod': true,
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
                            'currentMethod': true,
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
            expect(getLineSegments('current')({
                ...TEST_DATA,
                ivTimeSeriesData: {
                    ...TEST_DATA.ivTimeSeriesData,
                    timeSeries: {
                        ...TEST_DATA.ivTimeSeriesData.timeSeries,
                        '69928:00060': {
                            ...TEST_DATA.ivTimeSeriesData.timeSeries['69928:00060'],
                            points: dates.map(d => {
                                return {
                                    value: 10,
                                    dateTime: d,
                                    qualifiers: ['P']
                                };
                            }),
                            tsKey: 'current:P7D'
                        },
                        '69930:00045': {
                            ...TEST_DATA.ivTimeSeriesData.timeSeries['69930:00045'],
                            tsKey: 'compare:P7D'
                        }
                    }
                }
            })).toEqual({
                '69928:00060': [{
                    'classes': {
                        'approved': false,
                        'estimated': false,
                        'currentMethod': true,
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
                        'currentMethod': true,
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
            expect(getLineSegments('current')({
                ...TEST_DATA,
                ivTimeSeriesData: {
                    ...TEST_DATA.ivTimeSeriesData,
                    timeSeries: {
                        ...TEST_DATA.ivTimeSeriesData.timeSeries,
                        '69928:00060': {
                            ...TEST_DATA.ivTimeSeriesData.timeSeries['69928:00060'],
                            points: dates.map(d => {
                                return {
                                    value: null,
                                    dateTime: d,
                                    qualifiers: ['Ice']
                                };
                            }),
                            tsKey: 'current:P7D'
                        },
                        '69930:00045': {
                            ...TEST_DATA.ivTimeSeriesData.timeSeries['69930:00045'],
                            tsKey: 'compare:P7D'
                        }
                    }
                }
            })).toEqual({
                '69928:00060': [{
                    'classes': {
                        'approved': false,
                        'estimated': false,
                        'currentMethod': true,
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

        it('Should not set currentMethod to true if method is selected', () => {
            expect(getLineSegments('current')({
                ...TEST_DATA,
                ivTimeSeriesState : {
                    ...TEST_DATA.ivTimeSeriesState,
                    currentIVMethodID: 69929
                }
            })).toEqual({
                '69928:00060': [
                    {
                        'classes': {
                            'approved': true,
                            'estimated': false,
                            'currentMethod': false,
                            'dataMask': null
                        },
                        'points': [{
                            'value': 10,
                            'qualifiers': ['A'],
                            'dateTime': 1520351100000
                        }]
                    },
                    {
                        'classes': {
                            'approved': false,
                            'estimated': true,
                            'currentMethod': false,
                            'dataMask': 'ice'
                        },
                        'points': [{
                            'value': null,
                            'qualifiers': ['E', 'ICE'],
                            'dateTime': 1520352000000
                        }]
                    },
                    {
                        'classes': {
                            'approved': false,
                            'estimated': false,
                            'currentMethod': false,
                            'dataMask': 'fld'
                        },
                        'points': [{
                            'value': null,
                            'qualifiers': ['P', 'FLD'],
                            'dateTime': 1520352900000
                        }]
                    }
                ],
                '69930:00045': [
                    {
                        'classes': {
                            'approved': false,
                            'estimated': false,
                            'currentMethod': false,
                            'dataMask': null
                        },
                        'points': [
                            {
                                'value': 0,
                                'qualifiers': ['P'],
                                'dateTime': 1520351100000
                            }, {
                                'value': 0.01,
                                'qualifiers': ['P'],
                                'dateTime': 1520352000000
                            }, {
                                'value': 0.03,
                                'qualifiers': ['P'],
                                'dateTime': 1520352900000
                            }, {
                                'value': 0.06,
                                'qualifiers': ['P'],
                                'dateTime': 1520353800000
                            }
                        ]
                    }
                ]});
        });
    });

    describe('getLineSegmentsByParmCd', () => {
        it('Should return two mappings for current time series', () => {
            const result = getLineSegmentsByParmCd('current')(TEST_DATA);

            expect(Object.keys(result).length).toBe(2);
            expect(result['00060']).toBeDefined();
            expect(result['00045']).toBeDefined();
        });
    });

    describe('getCurrentVariableLineSegments', () => {
        it('Should return a single time series for current', () => {
            const result = getCurrentVariableLineSegments('current')(TEST_DATA);

            expect(Object.keys(result).length).toBe(1);
            expect(result['69928:00060']).toBeDefined();
        });

        it('Should return an empty object for the compare time series', () => {
            expect(getCurrentVariableLineSegments('compare')(TEST_DATA)).toEqual({});
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
            expect(classesForPoint({qualifiers: ['e','G']})).toEqual({
                approved: false,
                estimated: true
            });
        });
    });

    describe('getVisiblePoints', () => {
        const testData = {
            ...TEST_DATA,
            ivTimeSeriesState: {
                ...TEST_DATA.ivTimeSeriesState,
                showIVTimeSeries: {
                    'current': true,
                    'compare': true,
                    'median': true
                }
            }
        };

        it('Return two arrays', () => {
           expect(getVisiblePoints(testData).length).toBe(2);
        });

        it('Expects one array if only median is not visible', () => {
            const newTestData = {
                ...testData,
                ivTimeSeriesState: {
                    ...testData.ivTimeSeriesState,
                    showIVTimeSeries: {
                        'current': true,
                        'compare': true,
                        'median': false
                    }
                }
            };

            expect(getVisiblePoints(newTestData).length).toBe(1);
        });

        it('Expects an empty array if no visible series has the current variable', () => {
            const newTestData = {
                ...testData,
                ivTimeSeriesState: {
                    ...testData.ivTimeSeriesState,
                    currentIVVariableID: '11111111'
                }
            };

            expect(getVisiblePoints(newTestData).length).toBe(0);
        });
    });

    describe('getCurrentVariableMedianStatPoints', () => {
        const TEST_VARS = {
            '45807042': {
                variableCode: {
                    'value': '00060'
                }
            },
            '45807142': {
                variableCode: {
                    'value': '00010'
                }
            }
        };

        const TEST_STATE = {
            ivTimeSeriesData: {
                queryInfo: {
                    'current:P7D': {
                        notes: {
                            requestDT: 1488388500000,
                            'filter:timeRange': {
                                mode: 'PERIOD',
                                periodDays: '7',
                                modifiedSince: null
                            }
                        }
                    }
                },
                variables: TEST_VARS
            },
            ianaTimeZone: 'America/Chicago',
            statisticsData : {
                median: {
                    '00010': {
                        '1234': [{
                            month_nu: '2',
                            day_nu: '20',
                            p50_va: '40'
                        }, {
                            month_nu: '2',
                            day_nu: '21',
                            p50_va: '41'
                        }, {
                            month_nu: '2',
                            day_nu: '22',
                            p50_va: '42'
                        }, {
                            month_nu: '2',
                            day_nu: '23',
                            p50_va: '43'
                        }, {
                            month_nu: '2',
                            day_nu: '24',
                            p50_va: '44'
                        }, {
                            month_nu: '2',
                            day_nu: '25',
                            p50_va: '43'
                        }, {
                            month_nu: '2',
                            day_nu: '26',
                            p50_va: '42'
                        }, {
                            month_nu: '2',
                            day_nu: '27',
                            p50_va: '41'
                        }, {
                            month_nu: '2',
                            day_nu: '28',
                            p50_va: '40'
                        }, {
                            month_nu: '2',
                            day_nu: '29',
                            p50_va: '41'
                        }, {
                            month_nu: '3',
                            day_nu: '1',
                            p50_va: '39'
                        }, {
                            month_nu: '3',
                            day_nu: '2',
                            p50_va: '38'
                        }
                    ]}
                }
            },
            ivTimeSeriesState: {
                currentIVVariableID: '45807142',
                currentIVDateRange: 'P7D'
            }
        };

        it('Return the expected data points', () =>  {
            let result = getCurrentVariableMedianStatPoints(TEST_STATE);
            expect(result.length).toBe(1);
            expect(result[0].length).toBe(9);
            expect(result[0][0]).toEqual({
                value: 42,
                date: DateTime.fromObject({
                    year: 2017,
                    month: 2,
                    day: 22,
                    hour: 11,
                    minute: 15,
                    second: 0,
                    zone: 'America/Chicago'
                }).valueOf()
            });
            expect(result[0][8]).toEqual({
                value: 39,
                date: DateTime.fromObject({
                    year: 2017,
                    month: 3,
                    day: 1,
                    hour: 11,
                    minute: 15,
                    second: 0,
                    zone: 'America/Chicago'
                }).valueOf()
            });
        });

        it('Return empty array of no median data for the selected current variable exists', () => {
            const newTestState = {
                ...TEST_STATE,
                ivTimeSeriesState: {
                    ...TEST_STATE.ivTimeSeriesState,
                    currentIVVariableID: '45807042'
                }
            };
            expect(getCurrentVariableMedianStatPoints(newTestState)).toEqual([]);
        });
    });
});
