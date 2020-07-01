
import {
    getCurrentDVTimeSeriesIds,
    getDVGraphCursorOffset,
    getDVGraphBrushOffset,
    getAvailableDVTimeSeries,
    getAllDVTimeSeries,
    getCurrentDVTimeSeries,
    getCurrentDVTimeSeriesData,
    getCurrentDVTimeSeriesUnitOfMeasure,
    getCurrentDVTimeSeriesTimeRange,
    getCurrentDVTimeSeriesValueRange,
    hasMultipleParameterCodes
} from './daily-value-time-series-selector';

describe('monitoring-location/selectors/daily-value-time-series-selector', () => {

    describe('getCurrentDVTimeSeriesIds', () => {
       it('should be null if no current time series ids are set', () => {
           expect(getCurrentDVTimeSeriesIds({
               dailyValueTimeSeriesState: {}
           })).toBeNull();
       });

       it('should return the current time series ids', () => {
           expect(getCurrentDVTimeSeriesIds({
               dailyValueTimeSeriesState: {
                   currentDVTimeSeriesId: {
                       min: 'ffff1234',
                       mean: 'aaaa9876',
                       max: 'eeee1234'
                   }
               }
           })).toEqual({
               min: 'ffff1234',
               mean: 'aaaa9876',
               max: 'eeee1234'
           });
       });
    });

    describe('getDVGraphCursorOffset', () => {
       it('Should be null if no cursorOffset set', () => {
           expect(getDVGraphCursorOffset({
               dailyValueTimeSeriesState: {}
           })).toBeNull();
       });

       it('Should return the DV cursor offset if set in store', () => {
           expect(getDVGraphCursorOffset({
               dailyValueTimeSeriesState: {
                   dvGraphCursorOffset: 1234567880
               }
           })).toEqual(1234567880);
       });
    });

    describe('getDVGraphBrushOffset', () => {
       it('Should be null if no cursorOffset set', () => {
           expect(getDVGraphBrushOffset({
               dailyValueTimeSeriesState: {}
           })).toBeNull();
       });

       it('Should return the DV cursor offset if set in store', () => {
           expect(getDVGraphBrushOffset({
               dailyValueTimeSeriesState: {
                   dvGraphBrushOffset: {
                       start: 1234567880,
                       end: 555566666
                   }
               }
           })).toEqual({
               start: 1234567880,
               end: 555566666
           });
       });
    });

    describe('getAvailableDVTimeSeries', () => {
        it('should be null if no available dv time series', () => {
            expect(getAvailableDVTimeSeries({
                dailyValueTimeSeriesData: {}
            })).toBeNull();
        });

        it('should return the available dv time series', () => {
            expect(getAvailableDVTimeSeries({
                dailyValueTimeSeriesData: {
                    availableDVTimeSeries: [{id: 1}, {id: 2}]
                }
            })).toEqual([{id: 1}, {id: 2}]);
        });
    });

    describe('getAllDVTimeSeries', () => {
        it('should be null if no time series are defined', () => {
            expect(getAllDVTimeSeries({
                dailyValueTimeSeriesData: {}
            })).toBeNull();
        });

        it('should return time series when defined', () => {
            expect(getAllDVTimeSeries({
                dailyValueTimeSeriesData: {
                    dvTimeSeries: {
                        '11111': {
                            type: 'Feature',
                            id: '11111'
                        },
                        '12345': {
                            type: 'Feature',
                            id: '12345'
                        }
                    }
                }
            })).toEqual({
                '11111': {
                    type: 'Feature',
                    id: '11111'
                },
                '12345': {
                    type: 'Feature',
                    id: '12345'
                }
            });
        });
    });

    describe('getCurrentDVTimeSeries', () => {
        it('expect null if timeSeries is not defined', () => {
            expect(getCurrentDVTimeSeries({
                dailyValueTimeSeriesData : {},
                dailyValueTimeSeriesState: {}
            })).toBeNull();
            expect(getCurrentDVTimeSeries({
                dailyValueTimeSeriesData: {
                    dvTimeSeries: {
                        '11111': {
                            type: 'Feature',
                            id: '11111'
                        }
                    }
                },
                dailyValueTimeSeriesState: {}
            })).toBeNull();
            expect(getCurrentDVTimeSeries({
                dailyValueTimeSeriesData: {},
                dailyValueTimeSeriesState: {
                    currentDVTimeSeriesId: {
                        min: 'eeee2345',
                        mean: 'ffff1234',
                        max: 'aaaa9876'
                    }
                }
            })).toBeNull();
        });

        it('expect object if timeSeries is defined', () => {
            expect(getCurrentDVTimeSeries({
                dailyValueTimeSeriesData: {
                    dvTimeSeries: {
                        '11111': {
                            type: 'Feature',
                            id: '11111'
                        },
                        '12345': {
                            type: 'Feature',
                            id: '12345'
                        }
                    }
                },
                dailyValueTimeSeriesState: {
                    currentDVTimeSeriesId: {
                        min: '11111',
                        mean: '33333',
                        max: null
                    }
                }
            })).toEqual({
                min: {
                    type: 'Feature',
                    id: '11111'
                },
                mean: null,
                max: null
            });
        });
    });

    describe('getCurrentTimeSeriesData', () => {
        it('should return an empty array if no current time series is defined', () => {
            expect(getCurrentDVTimeSeriesData({
                dailyValueTimeSeriesData: {},
                dailyValueTimeSeriesState: {}
            })).toEqual({
                min: [],
                mean: [],
                max: []
            });
        });

        it('should return an array of objects representing the time series for the min and max properties', () => {
            const TEST_STATE_WITH_RESULTS = {
                dailyValueTimeSeriesData: {
                    dvTimeSeries: {
                        '12345': {
                            type: 'Feature',
                            id: '12345',
                            properties: {
                                phenomenonTimeStart: '2018-01-02',
                                phenomenonTimeEnd: '2018-01-10',
                                timeStep: ['2018-01-05', '2018-01-03', '2018-01-02', '2018-01-04',
                                    '2018-01-06', '2018-01-07', '2018-01-08', '2018-01-09', '2018-01-10'],
                                result: [ '3.2', '4.0', '5.0', '6.1',
                                    '7.3', '8.1', '6.2', '2.9', '3.4'],
                                approvals: [['Approved'], ['Approved'], ['Approved'], ['Approved'],
                                    ['Approved'], ['Approved'], ['Approved'], ['Approved'], ['Working']],
                                nilReason: [null, 'AA', null, null, null, null, null, null, null],
                                qualifiers: [['ICE'], null, null, null,
                                    ['ICE', 'EQUIP'], ['ICE', 'EQUIP'], ['ESTIMATED'], ['ESTIMATED'], null],
                                grades: [['60'], ['50'], ['50'], ['60'], ['50'], ['50'], ['50'], ['50'], ['50']]
                            }
                        },
                        '12346': {
                            type: 'Feature',
                            id: '12346',
                            properties: {
                                phenomenonTimeStart: '2018-01-02',
                                phenomenonTimeEnd: '2018-01-10',
                                timeStep: ['2018-01-02', '2018-01-03', '2018-01-04', '2018-01-05',
                                    '2018-01-06', '2018-01-07', '2018-01-08', '2018-01-09', '2018-01-10'],
                                result: [ '5.2', '3.0', '6.0', '7.1',
                                    '8.3', '9.1', '7.2', '3.9', '4.4'],
                                approvals: [['Approved'], ['Approved'], ['Approved'], ['Approved'],
                                    ['Approved'], ['Approved'], ['Approved'], ['Approved'], ['Working']],
                                nilReason: [null, 'AA', null, null, null, null, null, null, null],
                                qualifiers: [null, null, null, ['ICE'],
                                    ['ICE', 'EQUIP'], ['ICE', 'EQUIP'], ['ESTIMATED'], ['ESTIMATED'], null],
                                grades: [['50'], ['50'], ['50'], ['60'], ['50'], ['50'], ['50'], ['50'], ['50']]
                            }
                        }
                    }
                },
                dailyValueTimeSeriesState: {
                    currentDVTimeSeriesId: {
                        min: '12345',
                        mean: null,
                        max: '12346'
                    }
                },
                ui: {
                    windowWidth: 1024,
                    width: 800
                }
            };
            const result = getCurrentDVTimeSeriesData(TEST_STATE_WITH_RESULTS);
            const minResult = result.min;
            const meanResult = result.mean;
            const maxResult = result.max;

            expect(minResult.length).toBe(9);
            expect(minResult[0]).toEqual({
                value: '5.0',
                dateTime: 1514851200000,
                approvals: ['Approved'],
                nilReason: null,
                qualifiers: null,
                grades: ['50']
            });
            expect(minResult[3]).toEqual({
                value: '3.2',
                dateTime: 1515110400000,
                approvals: ['Approved'],
                nilReason: null,
                qualifiers: ['ICE'],
                grades: ['60']
            });
            expect(minResult[8]).toEqual({
                value: '3.4',
                dateTime: 1515542400000,
                approvals: ['Working'],
                nilReason: null,
                qualifiers: null,
                grades: ['50']
            });

            expect(meanResult.length).toBe(0);

            expect(maxResult.length).toBe(9);
            expect(maxResult[0]).toEqual({
                value: '5.2',
                dateTime: 1514851200000,
                approvals: ['Approved'],
                nilReason: null,
                qualifiers: null,
                grades: ['50']
            });
            expect(maxResult[8]).toEqual({
                value: '4.4',
                dateTime: 1515542400000,
                approvals: ['Working'],
                nilReason: null,
                qualifiers: null,
                grades: ['50']
            });
        });
    });

    describe('getCurrentDVTimeSeriesUnitOfMeasure', () => {
        it('expect empty string if not time series defined', () => {
            expect(getCurrentDVTimeSeriesUnitOfMeasure({
                dailyValueTimeSeriesData : {},
                dailyValueTimeSeriesState: {}
            })).toEqual('');
        });

        it('Expect the unit of measure for current time series', () => {
            expect(getCurrentDVTimeSeriesUnitOfMeasure({
                dailyValueTimeSeriesData: {
                    dvTimeSeries: {
                        '12345': {
                            type: 'Feature',
                            id: '12345',
                            properties: {
                                unitOfMeasureName: 'ft'
                            }
                        },
                        '12346': {
                            type: 'Feature',
                            id: '12346',
                            properties: {
                                unitOfMeasureName: 'km'
                            }
                        }
                    }
                },
                dailyValueTimeSeriesState: {
                    currentDVTimeSeriesId: {
                        min: '33333',
                        mean: '12346',
                        max: null
                    }
                }
            })).toEqual('km');
        });
    });

    describe('getCurrentDVTimeSeriesTimeRange', () => {
        it('should be null if no current time series is set or available', () => {
            expect(getCurrentDVTimeSeriesTimeRange({
                dailyValueTimeSeriesData: {},
                dailyValueTimeSeriesState: {}
            })).toBeNull();
            expect(getCurrentDVTimeSeriesTimeRange({
                dailyValueTimeSeriesData: {
                    dvTimeSeries: {}
                },
                dailyValueTimeSeriesState: {
                    currentDVTimeSeriesId: {
                        min: '12345',
                        mean: null,
                        max: null
                    }
                }
            })).toEqual({
                startTime: null,
                endTime: null
            });
        });

        it('should return startTime and endTime properties in universal time when time series is defined', () => {
            expect(getCurrentDVTimeSeriesTimeRange({
                dailyValueTimeSeriesData: {
                    dvTimeSeries: {
                        '12345': {
                            type: 'Feature',
                            id: '12345',
                            properties: {
                                phenomenonTimeStart: '2010-02-01',
                                phenomenonTimeEnd: '2019-12-01'
                            }
                        },
                        '12346': {
                           type: 'Feature',
                            id: '12347',
                            properties: {
                                phenomenonTimeStart: '2010-01-01',
                                phenomenonTimeEnd: '2019-11-01'
                            }
                        },
                        '12347': {
                           type: 'Feature',
                            id: '12347',
                            properties: {
                                phenomenonTimeStart: '2010-01-01',
                                phenomenonTimeEnd: '2019-12-31'
                            }
                        }
                    }
                },
                dailyValueTimeSeriesState: {
                    currentDVTimeSeriesId: {
                        min: '12345',
                        mean: '12346',
                        max: '12347'
                    }
                }
            })).toEqual({
                startTime: 1262304000000,
                endTime: 1577750400000
            });
        });
    });

    describe('getCurrentDVTimeSeriesValueRange', () => {
        it('should be null if if no current time series is set or available', () => {
            expect(getCurrentDVTimeSeriesValueRange({
                dailyValueTimeSeriesData: {},
                dailyValueTimeSeriesState: {}
            })).toBeNull();
            expect(getCurrentDVTimeSeriesValueRange({
                dailyValueTimeSeriesData: {
                    dvTimeSeries: {}
                },
                dailyValueTimeSeriesState: {
                    currentDVTimeSeriesId: {
                        min: '12345',
                        mean: null,
                        max: null
                    }
                }
            })).toEqual({
                min: null,
                max: null
            });
        });

        it('should return the extent of the current time series', () => {
            expect(getCurrentDVTimeSeriesValueRange({
                dailyValueTimeSeriesData: {
                    dvTimeSeries: {
                        '12345': {
                            type: 'Feature',
                            id: '12345',
                            properties: {
                                result: [
                                    '12.3',
                                    '12.4',
                                    '4.5',
                                    '7.6'
                                ]
                            }
                        },
                        '12346': {
                            type: 'Feature',
                            id: '12346',
                            properties: {
                                result: [
                                    '13.3',
                                    '14.0',
                                    '12.3',
                                    '8.3'
                                ]
                            }
                        }
                    }
                },
                dailyValueTimeSeriesState: {
                    currentDVTimeSeriesId: {
                        min: '12345',
                        mean: null,
                        max: '12346'
                    }
                }
            })).toEqual({
                min: 4.5,
                max: 14.0
            });
        });

        it('Should return true if there are multiple parameter codes in available'), () => {
            expect(hasMultipleParameterCodes(
                {dailyValueTimeSeriesData:
                        {availableDVTimeSeries:
                            [{parameterCode: '1'}, {parameterCode: '2'}]
                        }})).toBeTruthy();
        }

         it('Should return true if there are multiple parameter codes in available'), () => {
            expect(hasMultipleParameterCodes(
                {dailyValueTimeSeriesData:
                        {availableDVTimeSeries:
                            [{parameterCode: '1'}, {parameterCode: '1'}]
                        }})).toBeFalsy();
        }
    });
});