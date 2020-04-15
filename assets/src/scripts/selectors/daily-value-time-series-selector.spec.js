
import {
    getCurrentDVTimeSeriesId,
    getDVGraphCursorOffset,
    getDVGraphBrushOffset,
    getAvailableDVTimeSeries,
    getAllDVTimeSeries,
    hasCurrentDVTimeSeries,
    getCurrentDVTimeSeries,
    getCurrentDVTimeSeriesUnitOfMeasure,
    getCurrentDVTimeSeriesTimeRange,
    getCurrentDVTimeSeriesValueRange
} from './daily-value-time-series-selector';

describe('daily-value-time-series-selector', () => {
    describe('getCurrentDVTimeSeriesId', () => {
       it('should be false if no current time series id set', () => {
           expect(getCurrentDVTimeSeriesId({
               dailyValueTimeSeriesState: {}
           })).toBeNull();
       });

       it('should be true if current time series id is set', () => {
           expect(getCurrentDVTimeSeriesId({
               dailyValueTimeSeriesState: {
                   currentDVTimeSeriesId: '12345'
               }
           })).toEqual('12345');
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

    describe('hasCurrentDVTimeSeries', () => {
        it('expect false if no timeSeries defined', () => {
            expect(hasCurrentDVTimeSeries({
                dailyValueTimeSeriesData: {},
                dailyValueTimeSeriesState: {}
            })).toBe(false);
        });

        it('expect false if specific timeSeries is not defined', () => {
            expect(hasCurrentDVTimeSeries({
                dailyValueTimeSeriesData : {
                    dvTimeSeries: {}
                },
                dailyValueTimeSeriesState: {
                    currentDVTimeSeriesId: '12345'
                }
            })).toBe(false);
            expect(hasCurrentDVTimeSeries({
                dailyValueTimeSeriesData: {
                    dvTimeSeries: {
                        '11111': {
                            type: 'Feature',
                            id: '11111'
                        }
                    }
                },
                dailyValueTimeSeriesState: {
                    currentDVTimeSeriesId: '12345'
                }
            })).toBe(false);
        });

        it('expect true if specific timeSeries is defined', () => {
            expect(hasCurrentDVTimeSeries({
                dailyValueTimeSeriesData : {
                    dvTimeSeries: {
                        '11111': {
                            type: 'Feature',
                            id: '11111'
                        },
                        '12345' : {
                            type: 'Feature',
                            id: '12345'
                        }
                    }
                },
                dailyValueTimeSeriesState: {
                    currentDVTimeSeriesId: '12345'
                }
            })).toBe(true);
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
                dailyValueTimeSeriesData: {
                    dvTimeSeries: {
                        '11111': {
                            type: 'Feature',
                            id: '11111'
                        }
                    }
                },
                dailyValueTimeSeriesState: {
                    currentDVTimeSeriesId: '12345'
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
                    currentDVTimeSeriesId: '12345'
                }
            })).toEqual({
                type: 'Feature',
                id: '12345'
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
                            id: '12345',
                            properties: {
                                unitOfMeasureName: 'km'
                            }
                        }
                    }
                },
                dailyValueTimeSeriesState: {
                    currentDVTimeSeriesId: '12345'
                }
            })).toEqual('ft');
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
                    currentDVTimeSeriesId: '12345'
                }
            })).toBeNull();
        });

        it('should return startTime and endTime properties in universal time when time series is defined', () => {
            expect(getCurrentDVTimeSeriesTimeRange({
                dailyValueTimeSeriesData: {
                    dvTimeSeries: {
                        '12345': {
                            type: 'Feature',
                            id: '12345',
                            properties: {
                                phenomenonTimeStart: '2010-01-01',
                                phenomenonTimeEnd: '2019-12-01'
                            }
                        }
                    }
                },
                dailyValueTimeSeriesState: {
                    currentDVTimeSeriesId: '12345'
                }
            })).toEqual({
                startTime: 1262304000000,
                endTime: 1575158400000
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
                    currentDVTimeSeriesId: '12345'
                }
            })).toBeNull();
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
                        }
                    }
                },
                dailyValueTimeSeriesState: {
                    currentDVTimeSeriesId: '12345'
                }
            })).toEqual({
                min: 4.5,
                max: 12.4
            });
        });
    });
});