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
});