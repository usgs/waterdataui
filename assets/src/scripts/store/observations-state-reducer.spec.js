import {observationsDataReducer} from './observations-data-reducer';

fdescribe('observationsDataReducer', () => {
    it('should handle SET_CURRENT_TIME_SERIES_ID', () => {
        expect(observationsDataReducer({
            currentTimeSeriesId: '12345'
        }, {
            type: 'SET_CURRENT_TIME_SERIES_ID',
            timeSeriesId: '11111'
        })).toEqual({
            currentTimeSeriesId: '11111'
        });
    });
});