/*
 * Case reducers
 */

const setCurrentTimeSeriesId = function(observationsState, action) {
    return {
        ...observationsState,
        currentTimeSeriesId: action.timeSeriesId
    };
};

/*
 * Slice reducer
 */
export const observationsStateReducer = function(observationsState={}, action) {
    switch (action.type) {
        case 'SET_CURRENT_TIME_SERIES_ID':
            return setCurrentTimeSeriesId(observationsState, action);
        default:
            return observationsState;
    }
};