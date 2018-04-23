
/*
 * Case reducers
 */

const toggleTimeseries = function(timeseriesState, action) {
    return {
        ...timeseriesState,
        showSeries: {
            ...timeseriesState.showSeries,
            [action.key]: action.show
        }
    };
};

const setCurrentVariable = function(timeseriesState, action) {
    return {
        ...timeseriesState,
        currentVariableID: action.variableID
    };
};

const setCurrentDateRange = function(timeseriesState, action) {
    return {
        ...timeseriesState,
        currentDateRange: action.period
    };
}

const showMedianStatsLabel = function(timeseriesState, action) {
    return {
        ...timeseriesState,
        showMedianStatsLabel: action.show
    };
};

const setCursorOffset = function(timeseriesState, action) {
    return {
        ...timeseriesState,
        cursorOffset: action.cursorOffset
    };
};

const timeseriesPlayOn = function(timeseriesState, action) {
    return {
        ...timeseriesState,
        audiblePlayId: action.playId
    };
};

const timeseriesPlayStop = function(timeseriesState) {
    return {
        ...timeseriesState,
        audiblePlayId: null
    };
};

/*
 * Slice reducer
 */
export const timeseriesStateReducer = function(timeseriesState={}, action) {
    switch (action.type) {
        case 'TOGGLE_TIMESERIES' : return toggleTimeseries(timeseriesState, action);
        case 'SET_CURRENT_VARIABLE': return setCurrentVariable(timeseriesState, action);
        case 'SET_CURRENT_DATE_RANGE': return setCurrentDateRange(timeseriesState, action);
        case 'SHOW_MEDIAN_STATS_LABEL': return showMedianStatsLabel(timeseriesState, action);
        case 'SET_CURSOR_OFFSET': return setCursorOffset(timeseriesState, action);
        case 'TIMESERIES_PLAY_ON': return timeseriesPlayOn(timeseriesState, action);
        case 'TIMESERIES_PLAY_STOP': return timeseriesPlayStop(timeseriesState, action);
        default: return timeseriesState;
    }
};
