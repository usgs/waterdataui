
import {timeSeriesStateReducer} from './time-series-state-reducer';

describe('time-series-state-reducer', () => {

    it('should handle TOGGLE_TIME_SERIES', () => {
            expect(timeSeriesStateReducer({
                showSeries: {
                    current: false,
                    compare: false
                }
            }, {
                type: 'TOGGLE_TIME_SERIES',
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

    it('should handle TIME_SERIES_PLAY_ON', () => {
        expect(timeSeriesStateReducer({
            audiblePlayId: null
        }, {
            type: 'TIME_SERIES_PLAY_ON',
            playId: 12345
        })).toEqual({
            audiblePlayId: 12345
        });
    });

    it('should handle TIME_SERIES_PLAY_STOP', () => {
        expect(timeSeriesStateReducer({
            audiblePlayId: 12345
        }, {
            type: 'TIME_SERIES_PLAY_STOP'
        })).toEqual({
            audiblePlayId: null
        });
    });

    it('should handle TIME_SERIES_LOADING_ADD', () => {
        expect(timeSeriesStateReducer({
            loadingTSKeys: ['1']
        }, {
            type: 'TIME_SERIES_LOADING_ADD',
            tsKeys: ['2', '3']
        })).toEqual({
            loadingTSKeys: ['1', '2', '3']
        });
    });

    it('should handle TIME_SERIES_LOADING_REMOVE', () => {
        expect(timeSeriesStateReducer({
            loadingTSKeys: ['1', '2', '3']
        }, {
            type: 'TIME_SERIES_LOADING_REMOVE',
            tsKeys: ['2', '3', '4']
        })).toEqual({
            loadingTSKeys: ['1']
        });
    });

    it('should handle SET_CUSTOM_DATE_RANGE', () => {
        expect(timeSeriesStateReducer({
            customTimeRange: null,
            currentDateRange: 'P7D'
        }, {
            type: 'SET_CUSTOM_DATE_RANGE',
            startTime: 1551420000000,
            endTime: 1552197600000
        })).toEqual({
            customTimeRange: {startDT: 1551420000000, endDT: 1552197600000},
            currentDateRange: 'custom'
        });
    });

    it('Handles SET_HYDROGRAPH_BRUSH_OFFSET', () => {
        expect(timeSeriesStateReducer({
            hydrographBrushOffset: undefined
        }, {
            type: 'SET_HYDROGRAPH_BRUSH_OFFSET',
            hydrographBrushOffset: [1000, 10000000]
        })).toEqual({
            hydrographBrushOffset: {
                start: 1000,
                end: 10000000
            }
        });
    });

    it('Handles CLEAR_HYDROGRAPH_BRUSH_OFFSET', () => {
        expect(timeSeriesStateReducer({
            hydrographBrushOffset: {
                start: 1000,
                end: 10000000
            }
        }, {
            type: 'CLEAR_HYDROGRAPH_BRUSH_OFFSET'
        })).toEqual({
            hydrographBrushOffset: undefined
        });
    });
});
