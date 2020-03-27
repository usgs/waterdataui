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

const setDVGraphBrushOffset= function(observationsState, action) {
    return {
        ...observationsState,
        dvGraphBrushOffset: {
            start: action.dvGraphBrushOffset[0],
            end: action.dvGraphBrushOffset[1]
        }
    };
};

const clearDVGraphBrushOffset = function(observationsState) {
    return {
        ...observationsState,
        dvGraphBrushOffset: undefined
    };
};

/*
 * Slice reducer
 */
export const observationsStateReducer = function(observationsState={}, action) {
    switch (action.type) {
        case 'SET_CURRENT_TIME_SERIES_ID':
            return setCurrentTimeSeriesId(observationsState, action);
        case 'SET_DAILY_VALUE_CURSOR_OFFSET':
            return setDailyValueCursorOffset(observationsState, action);
        case 'SET_DV_GRAPH_BRUSH_OFFSET':
            return setDVGraphBrushOffset(observationsState, action);
        case 'CLEAR_DV_GRAPH_BRUSH_OFFSET':
            return clearDVGraphBrushOffset(observationsState);
        default:
            return observationsState;
    }
};