/*
 * Case reducers
 */

const setCurrentTimeSeriesId = function(observationsState, action) {
    return {
        ...observationsState,
        currentTimeSeriesId: action.timeSeriesId
    };
};

const setDailyValueCursorOffset = function(observationsState, action) {
    return {
        ...observationsState,
        cursorOffset: action.cursorOffset

    };
};

/*
 * Slice reducer
 */
export const observationsStateReducer = function(observationsState={}, action) {
    switch (action.type) {
        case 'SET_CURRENT_TIME_SERIES_ID':
            return setCurrentTimeSeriesId(observationsState, action);
        case 'SET_DAILY_VALUE_CURSOR_EPOCH_TIME':
            return setDailyValueCursorOffset(observationsState, action);
        default:
            return observationsState;
    }
};