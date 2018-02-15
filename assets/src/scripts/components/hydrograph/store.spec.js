const { Actions, timeSeriesReducer } = require('./store');


describe('Redux store', () => {
    // TODO: Add tests for retrieveTimeseries and retrieveCompareTimeseries
    describe('asynchronous actions', () => {
    });

    describe('synchronous actions', () => {
        it('should create an action to toggle timeseries view state', () => {
            expect(Actions.toggleTimeseries('current', true)).toEqual({
                type: 'TOGGLE_TIMESERIES',
                key: 'current',
                show: true
            });
        });

        it('should create an action to add a timeseries', () => {
            expect(Actions.addTimeseries('current', 'data', false)).toEqual({
                type: 'ADD_TIMESERIES',
                key: 'current',
                data: 'data',
                show: false
            });
        });

        it('should create an action to reset a timeseries', () => {
            expect(Actions.resetTimeseries('current')).toEqual({
                type: 'RESET_TIMESERIES',
                key: 'current'
            });
        });

        it('should create an action to reset a timeseries', () => {
            expect(Actions.setMedianStatistics('statsData')).toEqual({
                type: 'SET_MEDIAN_STATISTICS',
                medianStatistics: 'statsData'
            });
        });

        it('should create an action to show the median stats label', () => {
            expect(Actions.showMedianStatsLabel(true)).toEqual({
                type: 'SHOW_MEDIAN_STATS_LABEL',
                show: true
            });

        });

        it('should create an action to resize plot', () => {
            expect(Actions.resizeTimeseriesPlot(100)).toEqual({
                type: 'RESIZE_TIMESERIES_PLOT',
                width: 100
            });
        });
    });

    describe('reducers', () => {
        it('should handle ADD_TIMESERIES', () => {
            expect(timeSeriesReducer({tsData: {}}, {
                type: 'ADD_TIMESERIES',
                key: 'current',
                data: {code: '00060'},
                show: true
            })).toEqual({
                tsData: {
                    current: {
                        '00060': {code: '00060'}
                    }
                },
                showSeries: {
                    current: true
                }
            });
        });

        it('should handle TOGGLE_TIMESERIES', () => {
            expect(timeSeriesReducer({}, {
                type: 'TOGGLE_TIMESERIES',
                key: 'current',
                show: true
            })).toEqual({
                showSeries: {
                    current: true
                }
            });
        });

        it('should handle RESET_TIMESERIES', () => {
            expect(timeSeriesReducer({}, {
                type: 'RESET_TIMESERIES',
                key: 'previous'
            })).toEqual({
                tsData: {
                    previous: {}
                },
                showSeries: {
                    previous: false
                }
            });
        });

        it('should handle SET_MEDIAN_STATISTICS', () => {
            expect(timeSeriesReducer({}, {
                type: 'SET_MEDIAN_STATISTICS',
                medianStatistics: {beginYear: '2000', endYear: '2010', values: ['a']}
            })).toEqual({
                tsData: {
                    medianStatistics: {
                        '00060': {
                            name: '00060:median',
                            values: ['a']
                        }
                    }
                },
                showSeries: {
                    medianStatistics: true
                },
                statisticalMetaData: {
                    beginYear: '2000',
                    endYear: '2010'
                }
            });
        });

        it('should handle SHOW_MEDIAN_STATS_LABEL', () => {
            expect(timeSeriesReducer({}, {
                type: 'SHOW_MEDIAN_STATS_LABEL',
                show: true
            })).toEqual({
                showMedianStatsLabel: true
            });
        });

        it('should handle RESIZE_TIMESERIES_PLOT', () => {
            expect(timeSeriesReducer({}, {
                type: 'RESIZE_TIMESERIES_PLOT',
                width: 100
            })).toEqual({
                width: 100
            });
        });
    });
});
