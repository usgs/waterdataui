const { Actions, timeSeriesReducer } = require('./store');
const { lineMarker, circleMarker } = require('./markers');


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
                medianStatistics: 'test data'
            })).toEqual({
                tsData: {
                    medianStatistics: 'test data'
                },
                showSeries: {
                    medianStatistics: true
                }
            });
        });

        it('should be able to create line markers', () => {
            let action = {type: 'SET_LEGEND_MARKERS', key: 'current'};
            let result = timeSeriesReducer({}, action);
            expect(result.legendMarkers.current).toEqual({
                type: lineMarker,
                domId: 'ts-current',
                domClass: 'line',
                text: 'Current Year',
                groupId: 'current-line-marker'
            });
        });

        it('should be able to create circle markers', () => {
            let action = {type: 'SET_LEGEND_MARKERS', key: 'medianStatistics'};
            let result = timeSeriesReducer({}, action);
            expect(result.legendMarkers.medianStatistics).toEqual({
                type: circleMarker,
                r: 4,
                domId: null,
                domClass: 'median-data-series',
                groupId: 'median-circle-marker',
                text: 'Median Discharge'
            });
        });

        it('should have no markers if key does not make sense', () => {
            let action = {type: 'SET_LEGEND_MARKERS', key: 'blah'};
            expect(timeSeriesReducer({}, action).legendMarkers.blah).toBeNull();
        });

        it('selection of display markers works when there is nothing on the graph', () => {
            let action = {type: 'SELECT_DISPLAY_MARKERS', text: 'Select Display Markers'};
            let result = timeSeriesReducer({}, action);
            expect(result.displayMarkers).toEqual([]);
        });

        it('selection of display markers works when there are timeseries', () => {
            let action = {type: 'SELECT_DISPLAY_MARKERS', text: 'Select Display Markers'};
            let testState = {
                showSeries: {
                    compare: false,
                    current: true,
                    medianStatistics: true
                },
                legendMarkers: {
                    compare: 'compare-stand-in',
                    current: 'current-stand-in',
                    medianStatistics: 'median-stand-in'
                }
            };
            let result = timeSeriesReducer(testState, action);
            expect(result.displayMarkers).toEqual(['current-stand-in', 'median-stand-in']);
        });

        it('selection of display markers returns empty array if legendMarker keys do not match series keys', () => {
            let action = {type: 'SELECT_DISPLAY_MARKERS', text: 'Select Display Markers'};
            let testState = {
                showSeries: {
                    compare: false,
                    current: true,
                    medianStatistics: true
                },
                legendMarkers: {
                    compareX: 'compare-stand-in',
                    currentX: 'current-stand-in',
                    medianStatisticsX: 'median-stand-in'
                }
            };
            let result = timeSeriesReducer(testState, action);
            expect(result.displayMarkers).toEqual([]);
        });
    });
});
