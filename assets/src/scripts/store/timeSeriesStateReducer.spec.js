
const { timeSeriesStateReducer } = require('./timeSeriesStateReducer');

describe('timeSeriesStateReducer', () => {

    it('should handle TOGGLE_TIMESERIES', () => {
            expect(timeSeriesStateReducer({
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
        expect(timeSeriesStateReducer({
            currentVariableID: '2'
        }, {
            type: 'SET_CURRENT_VARIABLE',
            variableID: '10'
        })).toEqual({
            currentVariableID: '10'
        });
    });

    it('should handle SET_CURSOR_OFFSET', () => {
        expect(timeSeriesStateReducer({
            cursorOffset: '12345'
        }, {
            type: 'SET_CURSOR_OFFSET',
            cursorOffset: '54321'
        })).toEqual({
            cursorOffset: '54321'
        });
    });

    it('should handle TIMESERIES_PLAY_ON', () => {
        expect(timeSeriesStateReducer({
            audiblePlayId: null
        }, {
            type: 'TIMESERIES_PLAY_ON',
            playId: 12345
        })).toEqual({
            audiblePlayId: 12345
        });
    });

    it('should handle TIMESERIES_PLAY_STOP', () => {
        expect(timeSeriesStateReducer({
            audiblePlayId: 12345
        }, {
            type: 'TIMESERIES_PLAY_STOP'
        })).toEqual({
            audiblePlayId: null
        });
    });
});
