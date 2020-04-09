
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
} from './observations-selector';

describe('observations-selector', () => {
    describe('getCurrentDVTimeSeriesId', () => {
       it('should be false if no current time series id set', () => {
           expect(getCurrentDVTimeSeriesId({
               observationsState: {}
           })).toBeNull();
       });

       it('should be true if current time series id is set', () => {
           expect(getCurrentDVTimeSeriesId({
               observationsState: {
                   currentDVTimeSeriesId: '12345'
               }
           })).toEqual('12345');
       });
    });

    describe('getDVGraphCursorOffset', () => {
       it('Should be null if no cursorOffset set', () => {
           expect(getDVGraphCursorOffset({
               observationsState: {}
           })).toBeNull();
       });

       it('Should return the DV cursor offset if set in store', () => {
           expect(getDVGraphCursorOffset({
               observationsState: {
                   dvGraphCursorOffset: 1234567880
               }
           })).toEqual(1234567880);
       });
    });

    describe('getDVGraphBrushOffset', () => {
       it('Should be null if no cursorOffset set', () => {
           expect(getDVGraphBrushOffset({
               observationsState: {}
           })).toBeNull();
       });

       it('Should return the DV cursor offset if set in store', () => {
           expect(getDVGraphBrushOffset({
               observationsState: {
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
                observationsData: {}
            })).toBeNull();
        });

        it('should return the available dv time series', () => {
            expect(getAvailableDVTimeSeries({
                observationsData: {
                    availableDVTimeSeries: [{id: 1}, {id: 2}]
                }
            })).toEqual([{id: 1}, {id: 2}]);
        });
    });

    describe('getAllDVTimeSeries', () => {
        it('should be null if no time series are defined', () => {
            expect(getAllDVTimeSeries({
                observationsData: {}
            })).toBeNull();
        });

        it('should return time series when defined', () => {
            expect(getAllDVTimeSeries({
                observationsData: {
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
                observationsData: {},
                observationsState: {}
            })).toBe(false);
        });

        it('expect false if specific timeSeries is not defined', () => {
            expect(hasCurrentDVTimeSeries({
                observationsData : {
                    dvTimeSeries: {}
                },
                observationsState: {
                    currentDVTimeSeriesId: '12345'
                }
            })).toBe(false);
            expect(hasCurrentDVTimeSeries({
                observationsData: {
                    dvTimeSeries: {
                        '11111': {
                            type: 'Feature',
                            id: '11111'
                        }
                    }
                },
                observationsState: {
                    currentDVTimeSeriesId: '12345'
                }
            })).toBe(false);
        });

        it('expect true if specific timeSeries is defined', () => {
            expect(hasCurrentDVTimeSeries({
                observationsData : {
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
                observationsState: {
                    currentDVTimeSeriesId: '12345'
                }
            })).toBe(true);
        });
    });

    describe('getCurrentDVTimeSeries', () => {
        it('expect null if timeSeries is not defined', () => {
            expect(getCurrentDVTimeSeries({
                observationsData : {},
                observationsState: {}
            })).toBeNull();
            expect(getCurrentDVTimeSeries({
                observationsData: {
                    dvTimeSeries: {
                        '11111': {
                            type: 'Feature',
                            id: '11111'
                        }
                    }
                },
                observationsState: {}
            })).toBeNull();
            expect(getCurrentDVTimeSeries({
                observationsData: {
                    dvTimeSeries: {
                        '11111': {
                            type: 'Feature',
                            id: '11111'
                        }
                    }
                },
                observationsState: {
                    currentDVTimeSeriesId: '12345'
                }
            })).toBeNull();
        });

        it('expect object if timeSeries is defined', () => {
            expect(getCurrentDVTimeSeries({
                observationsData: {
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
                observationsState: {
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
                observationsData : {},
                observationsState: {}
            })).toEqual('');
        });

        it('Expect the unit of measure for current time series', () => {
            expect(getCurrentDVTimeSeriesUnitOfMeasure({
                observationsData: {
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
                observationsState: {
                    currentDVTimeSeriesId: '12345'
                }
            })).toEqual('ft');
        });
    });

    describe('getCurrentDVTimeSeriesTimeRange', () => {
        it('should be null if no current time series is set or available', () => {
            expect(getCurrentDVTimeSeriesTimeRange({
                observationsData: {},
                observationsState: {}
            })).toBeNull();
            expect(getCurrentDVTimeSeriesTimeRange({
                observationsData: {
                    dvTimeSeries: {}
                },
                observationsState: {
                    currentDVTimeSeriesId: '12345'
                }
            })).toBeNull();
        });

        it('should return startTime and endTime properties in universal time when time series is defined', () => {
            expect(getCurrentDVTimeSeriesTimeRange({
                observationsData: {
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
                observationsState: {
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
                observationsData: {},
                observationsState: {}
            })).toBeNull();
            expect(getCurrentDVTimeSeriesValueRange({
                observationsData: {
                    dvTimeSeries: {}
                },
                observationsState: {
                    currentDVTimeSeriesId: '12345'
                }
            })).toBeNull();
        });

        it('should return the extent of the current time series', () => {
            expect(getCurrentDVTimeSeriesValueRange({
                observationsData: {
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
                observationsState: {
                    currentDVTimeSeriesId: '12345'
                }
            })).toEqual({
                min: 4.5,
                max: 12.4
            });
        });
    });
});