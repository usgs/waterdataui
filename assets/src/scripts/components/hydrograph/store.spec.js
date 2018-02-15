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
            expect(Actions.addTimeseries('current', 1234, 'data', false)).toEqual({
                type: 'ADD_TIMESERIES',
                key: 'current',
                siteno: 1234,
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

        it('show create an action to set the tooltip time', () => {
            expect(Actions.setTooltipTime(new Date('2018-01-03'), new Date('2017-01-03'))).toEqual({
                type: 'SET_TOOLTIP_TIME',
                currentTime: new Date('2018-01-03'),
                compareTime: new Date('2017-01-03')
            });
        });
    });

    describe('reducers', () => {
        it('should handle ADD_TIMESERIES', () => {
            expect(timeSeriesReducer({}, {
                type: 'ADD_TIMESERIES',
                key: 'current',
                data: {
                    values: [{
                        value: 'test'
                    }],
                    variableName: 'var name',
                    variableDescription: 'var description',
                    seriesStartDate: new Date('2017-01-01T15:00:00.000-06:00'),
                    seriesEndDate: new Date('2017-01-10T15:00:00.000-06:00')
                },
                show: true
            })).toEqual(jasmine.objectContaining({
                tsData: {
                    current: [{
                        value: 'test'
                    }]
                },
                showSeries: {
                    current: true
                },
                title: 'var name'
            }));
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
                    previous: []
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
                    medianStatistics: ['a']
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

        it('should handle SET_TOOLTIP_TIME', () => {
            expect(timeSeriesReducer({}, {
                type: 'SET_TOOLTIP_TIME',
                currentTime: new Date('2018-01-03'),
                compareTime: new Date('2017-01-03')
            })).toEqual({
                tooltipFocusTime: {
                    current: new Date('2018-01-03'),
                    compare: new Date('2017-01-03')
                }
            });
        });
    });
});
