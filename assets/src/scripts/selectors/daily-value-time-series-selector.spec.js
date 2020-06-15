
import {
    getCurrentDVParameterCode,
    getCurrentDVTimeSeriesIds,
    getDVGraphCursorOffset,
    getDVGraphBrushOffset,
    getAvailableDVTimeSeries,
    getAllDVTimeSeries,
    getCurrentDVTimeSeries,
    getCurrentDVTimeSeriesUnitOfMeasure,
    getCurrentDVTimeSeriesTimeRange,
    getCurrentDVTimeSeriesValueRange
} from './daily-value-time-series-selector';

describe('daily-value-time-series-selector', () => {
    describe('getCurrentDVParameterCode', () => {
       it('should be null if no current parameter code set', () => {
           expect(getCurrentDVParameterCode({
               dailyValueTimeSeriesState: {}
           })).toBeNull();
       });

       it('should return the current parameter code', () => {
           expect(getCurrentDVParameterCode({
               dailyValueTimeSeriesState: {
                   currentDVParameterCode: '12345'
               }
           })).toEqual('12345');
       });
    });

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
                       median: 'aaaa9876',
                       max: 'eeee1234'
                   }
               }
           })).toEqual({
               min: 'ffff1234',
               median: 'aaaa9876',
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
                        median: 'ffff1234',
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
                        median: '33333',
                        max: null
                    }
                }
            })).toEqual({
                min: {
                    type: 'Feature',
                    id: '11111'
                },
                median: null,
                max: null
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
                        median: '12346',
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
                        median: null,
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
                        median: '12346',
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
                        median: null,
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
                        median: null,
                        max: '12346'
                    }
                }
            })).toEqual({
                min: 4.5,
                max: 14.0
            });
        });
    });
});