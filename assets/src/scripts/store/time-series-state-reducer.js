
/*
 * Case reducers
 */

const toggleTimeSeries = function(timeSeriesState, action) {
    return {
        ...timeSeriesState,
        showSeries: {
            ...timeSeriesState.showSeries,
            ...{[action.key]: action.show}
        }
    };
};

const setCurrentVariable = function(timeSeriesState, action) {
    return {
        ...timeSeriesState,
        currentVariableID: action.variableID
    };
};

const setCurrentDateRange = function(timeSeriesState, action) {
    return {
        ...timeSeriesState,
        currentDateRange: action.period
    };
};

const setCursorOffset = function(timeSeriesState, action) {
    return {
        ...timeSeriesState,
        cursorOffset: action.cursorOffset
    };
};

const timeSeriesPlayOn = function(timeSeriesState, action) {
    return {
        ...timeSeriesState,
        audiblePlayId: action.playId
    };
};

const timeSeriesPlayStop = function(timeSeriesState) {
    return {
        ...timeSeriesState,
        audiblePlayId: null
    };
};

const addLoadingTimeSeries = function(timeSeriesState, action) {
    return {
        ...timeSeriesState,
        loadingTSKeys: timeSeriesState.loadingTSKeys.concat(action.tsKeys)
    };
};

const removeLoadingTimeSeries = function(timeSeriesState, action) {
    return {
        ...timeSeriesState,
        loadingTSKeys: timeSeriesState.loadingTSKeys.filter((tsKey) => !action.tsKeys.includes(tsKey))
    };
};

const requestedTimeRange = function(timeSeriesState, action) {
    return {
        ...timeSeriesState,
        requestedTimeRange: {startDT: action.startTime, endDT: action.endTime}
    };
};

/*
 * Slice reducer
 */
export const timeSeriesStateReducer = function(timeSeriesState={}, action) {
    switch (action.type) {
        case 'TOGGLE_TIME_SERIES' : return toggleTimeSeries(timeSeriesState, action);
        case 'SET_CURRENT_VARIABLE': return setCurrentVariable(timeSeriesState, action);
        case 'SET_CURRENT_DATE_RANGE': return setCurrentDateRange(timeSeriesState, action);
        case 'SET_CURSOR_OFFSET': return setCursorOffset(timeSeriesState, action);
        case 'TIME_SERIES_PLAY_ON': return timeSeriesPlayOn(timeSeriesState, action);
        case 'TIME_SERIES_PLAY_STOP': return timeSeriesPlayStop(timeSeriesState, action);
        case 'TIME_SERIES_LOADING_ADD': return addLoadingTimeSeries(timeSeriesState, action);
        case 'TIME_SERIES_LOADING_REMOVE': return removeLoadingTimeSeries(timeSeriesState, action);
        case 'SET_CUSTOM_DATE_RANGE': return requestedTimeRange(timeSeriesState, action);
        default: return timeSeriesState;
    }
};
