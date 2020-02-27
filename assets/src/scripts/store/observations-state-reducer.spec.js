import {observationsStateReducer} from './observations-state-reducer';

describe('observationsStateReducer', () => {
    it('should handle SET_CURRENT_TIME_SERIES_ID', () => {
        expect(observationsStateReducer({
            currentTimeSeriesId: '12345'
        }, {
            type: 'SET_CURRENT_TIME_SERIES_ID',
            timeSeriesId: '11111'
        })).toEqual({
            currentTimeSeriesId: '11111'
        });
    });

    it('should handle SET_DAILY_VALUE_CURSOR_OFFSET', () => {
        expect(observationsStateReducer({
            cursorOffset: '12345'
        }, {
            type: 'SET_DAILY_VALUE_CURSOR_OFFSET',
            cursorOffset: '55555'
        })).toEqual({
            cursorOffset: '55555'
        });
    });
});