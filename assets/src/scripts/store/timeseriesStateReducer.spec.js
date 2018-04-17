
const { timeseriesStateReducer } = require('./timeseriesStateReducer');

describe('timeseriesStateReducer', () => {

    it('should handle TOGGLE_TIMESERIES', () => {
            expect(timeseriesStateReducer({
                showSeries: {
                    current: false,
                    compare: false
                }
            }, {
                type: 'TOGGLE_TIMESERIES',
                key: 'current',
                show: true
            })).toEqual({
                showSeries: {
                    current: true,
                    compare: false
                }
            });
        });

    it('should handle SET_CURRENT_VARIABLE', () => {
        expect(timeseriesStateReducer({
            currentVariableID: '2'
        }, {
            type: 'SET_CURRENT_VARIABLE',
            variableID: '10'
        })).toEqual({
            currentVariableID: '10'
        });
    });

    it('should handle SHOW_MEDIAN_STATS_LABEL', () => {
        expect(timeseriesStateReducer({
            showMedianStatsLabel: true
        }, {
            type: 'SHOW_MEDIAN_STATS_LABEL',
            show: false
        })).toEqual({
            showMedianStatsLabel: false
        });
    });

    it('should handle SET_CURSOR_OFFSET', () => {
        expect(timeseriesStateReducer({
            cursorOffset: '12345'
        }, {
            type: 'SET_CURSOR_OFFSET',
            cursorOffset: '54321'
        })).toEqual({
            cursorOffset: '54321'
        });
    });

    it('should handle TIMESERIES_PLAY_ON', () => {
        expect(timeseriesStateReducer({
            audiblePlayId: null
        }, {
            type: 'TIMESERIES_PLAY_ON',
            playId: 12345
        })).toEqual({
            audiblePlayId: 12345
        });
    });

    it('should handle TIMESERIES_PLAY_STOP', () => {
        expect(timeseriesStateReducer({
            audiblePlayId: 12345
        }, {
            type: 'TIMESERIES_PLAY_STOP'
        })).toEqual({
            audiblePlayId: null
        });
    });
});