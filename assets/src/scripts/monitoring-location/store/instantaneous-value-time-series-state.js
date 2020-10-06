/* eslint no-use-before-define: 0 */


/*
 * Actions for the ivTimeSeriesStateReducer
 */

/*
 * Synchronous action to toggle the visibility of specific time series (i.e. current, compare, median)
 * @param {String} key
 * @param {Boolean} show
 * @return {Object} - Redux action
 */
const setIVTimeSeriesVisibility = function(key, show) {
    return {
     type: 'SET_IV_TIME_SERIES_VISIBILITY',
     key,
     show
    };
};
/*
 * Synchronous action to set the selected variable ID for the IV graph
 * @param {String} variableID
 * @return {Object} - Redux action
 */
const setCurrentIVVariable = function(variableID) {
    return {
        type: 'SET_CURRENT_IV_VARIABLE',
        variableID
    };
};

/*
 * Synchronous action to set the selected method ID (uniquely identifies the IV time series).
 * Some variables have more than one IV time series. The method ID distinguishes these
 * @param {String} methodID
 * @return {Object} - Redux action
 */
const setCurrentIVMethodID = function(methodID) {
    return {
        type: 'SET_CURRENT_IV_METHOD_ID',
        methodID
    };
};

/*
 * Synchronous action sets the date range kind of the IV data.
 * @param {String} dateRange - represents an ISO 8601 Duration or "custom"
 * @return {Object} - Redux action
 */
const setCurrentIVDateRange = function(dateRange) {
    return {
        type: 'SET_CURRENT_IV_DATE_RANGE',
        dateRange
    };
};

/*
 * Synchronous action sets the custom date range for the IV graph
 * @param {Number} startTime - epoch in milliseconds
 * @param {Number} endTime - epoch in milliseconds
 * @return {Object} - Redux action
 */
const setCustomIVTimeRange = function(startTime, endTime) {
    return {
        type: 'SET_CUSTOM_IV_TIME_RANGE',
        startTime,
        endTime
    };
};

/*
 * Synchronous action sets value indicating which of the main time range selection (the
 * buttons for '7 days', '30 days', etc.) for the IV graph the is checked.
 * @param {String} userInputTimeRangeSelectionButton - the value of the user selected button
 * such as 'P7D, P1Y, or custom'
 * @return {Object} - Redux action
 */
const setUserInputTimeRangeSelectionButton = function(userInputTimeRangeSelectionButton) {
    return {
        type: 'SET_USER_INPUT_TIME_RANGE_SELECTION_BUTTON',
        userInputTimeRangeSelectionButton
    };
};

/*
 * Synchronous action sets value indicating which of the 'custom' subselection buttons of
 * the main time range selection (the buttons for 'days before today' or 'calender days')
 * for the IV graph is checked.
 * @param {String} userInputCustomTimeRangeSelectionButton - the value of the user selected button
 * such as 'days-input' or 'calender-input'
 * @return {Object} - Redux action
 */
const setUserInputCustomTimeRangeSelectionButton = function(userInputCustomTimeRangeSelectionButton) {
    return {
        type: 'SET_USER_INPUT_CUSTOM_TIME_RANGE_SELECTION_BUTTON',
        userInputCustomTimeRangeSelectionButton
    };
};

/*
 * Synchronous action sets number of days from today that is entered in the form field for
 * 'days before today' on the custom date range menu.
 * @param {Number} userInputNumberOfDays - the number of days
 * @return {Object} - Redux action
 */
const setUserInputNumberOfDays = function(userInputNumberOfDays) {
    return {
        type: 'SET_USER_INPUT_NUMBER_OF_DAYS',
        userInputNumberOfDays
    };
};


const setTimespanUserInputs = function(key, value) {
    return {
        type: 'SET_TIMESPAN_USER_INPUTS',
        key,
        value
    };
};


/*
 * Synchronous action sets the IV graph cursor offset - This is the difference
 * in cursor position and graph start time, in milliseconds
 * @param {Number} cursorOffset
 * @return {Object} - Redux action
 */
const setIVGraphCursorOffset = function(cursorOffset) {
    return {
        type: 'SET_IV_GRAPH_CURSOR_OFFSET',
        cursorOffset
    };
};

/*
 * Synchronous action sets the IV graph brush offset - in milliseconds
 * @param {Number} startOffset - difference between brush start and the start time of the displayed time series
 * @param {Number} endOffset - difference between the end of the displayed time series and the brush end
 * @return {Object} - Redux action
 */
const setIVGraphBrushOffset = function(startOffset, endOffset) {
    return {
        type: 'SET_IV_GRAPH_BRUSH_OFFSET',
        startOffset,
        endOffset
    };
};

/*
 * Synchronous action to clear the IV graph brush offset
 * return {Object} - Redux action
 */
const clearIVGraphBrushOffset = function() {
    return {
        type: 'CLEAR_IV_GRAPH_BRUSH_OFFSET'
    };
};

/*
 * Synchronous action add the tsRequestKeys to  iv time series loading
 * @param {Array of String} tsRequestKeys
 * @return {Object} - Redux actions
 */
const addIVTimeSeriesToLoadingKeys = function(tsRequestKeys) {
    return {
        type: 'ADD_IV_TIME_SERIES_TO_LOADING_KEYS',
        tsRequestKeys
    };
};

/*
 * Synchronous action to remove the tsRequestKeys from iv time series loading
 * @param {Array of String} tsRequestKeys
 * @return {Object} - Redux action
 */
const removeIVTimeSeriesFromLoadingKeys = function(tsRequestKeys) {
    return {
        type: 'REMOVE_IV_TIME_SERIES_FROM_LOADING_KEYS',
        tsRequestKeys
    };
};

/*
 * Synchronous action to set audible play ID
 * @param {Number} audiblePlayId - id of the timer
 * @return {Object} - Redux actions
 */
const ivTimeSeriesPlayOn = function(audiblePlayId) {
    return {
        type: 'IV_TIME_SERIES_PLAY_ON',
        audiblePlayId
    };
};

/*
 * Synchronous action to remove the audible play ID
 * @return {Object} - Redux actions
 */
const ivTimeSeriesPlayStop = function() {
    return {
        type: 'IV_TIME_SERIES_PLAY_STOP'
    };
};

/*
 * Asynchronous Redux action which starts audio play. If the play reaches the end
 * of the time series it is set back to the beginning
 * @param {Number} maxCursorOffset - epoch in milliseconds
 * @return {Function}
 */
const startTimeSeriesPlay = function(maxCursorOffset) {
    return function (dispatch, getState) {
        let state = getState().ivTimeSeriesState;
        if (state.ivGraphCursorOffset == null || state.ivGraphCursorOffset >= maxCursorOffset) {
            dispatch(Actions.setIVGraphCursorOffset(0));
        }
        if (!state.audiblePlayId) {
            let play = function () {
                let newOffset = getState().ivTimeSeriesState.ivGraphCursorOffset + 15 * 60 * 1000;
                if (newOffset > maxCursorOffset) {
                    dispatch(Actions.ivTimeSeriesPlayStop());
                } else {
                    dispatch(Actions.setIVGraphCursorOffset(newOffset));
                }
            };
            let playId = window.setInterval(play, 10);
            dispatch(Actions.ivTimeSeriesPlayOn(playId));
        }
    };
};

/*
* Asynchronous Redux action which stops the audible play
* @return {Function}
 */
const stopTimeSeriesPlay = function() {
    return function(dispatch, getState) {
        window.clearInterval(getState().ivTimeSeriesState.audiblePlayId);
        dispatch(Actions.ivTimeSeriesPlayStop());
    };
};

export const ivTimeSeriesStateReducer = function(ivTimeSeriesState={}, action) {
    switch (action.type) {
        case 'SET_IV_TIME_SERIES_VISIBILITY': {
            let newVisibility = {};
            newVisibility[action.key] = action.show;
            return Object.assign({}, ivTimeSeriesState, {
                showIVTimeSeries: Object.assign({}, ivTimeSeriesState.showIVTimeSeries, newVisibility)
            });
        }

        case 'SET_CURRENT_IV_VARIABLE':
            return {
                ...ivTimeSeriesState,
                currentIVVariableID: action.variableID
            };

        case 'SET_CURRENT_IV_METHOD_ID':
            return {
                ...ivTimeSeriesState,
                currentIVMethodID: action.methodID
            };

        case 'SET_CURRENT_IV_DATE_RANGE':
            return {
                ...ivTimeSeriesState,
                currentIVDateRange: action.dateRange
            };

        case 'SET_CUSTOM_IV_TIME_RANGE':
            return {
                ...ivTimeSeriesState,
                customIVTimeRange: {
                    start: action.startTime,
                    end: action.endTime
                }
            };

        case 'SET_USER_INPUT_TIME_RANGE_SELECTION_BUTTON':
            return {
                ...ivTimeSeriesState,
                userInputTimeRangeSelectionButton: action.userInputTimeRangeSelectionButton
            };

        case 'SET_USER_INPUT_CUSTOM_TIME_RANGE_SELECTION_BUTTON':
            return {
                ...ivTimeSeriesState,
                userInputCustomTimeRangeSelectionButton: action.userInputCustomTimeRangeSelectionButton
            };

        case 'SET_USER_INPUT_NUMBER_OF_DAYS':
            return {
                ...ivTimeSeriesState,
                userInputNumberOfDays: action.userInputNumberOfDays
            };

        case 'SET_TIMESPAN_USER_INPUTS': {
            const timespanInputSettings = {};
            timespanInputSettings[action.key] = action.value;
            return Object.assign({}, ivTimeSeriesState, {
                timespanUserInputs: Object.assign({}, ivTimeSeriesState.timespanUserInputs, timespanInputSettings)
            });
        }

        case 'SET_IV_GRAPH_CURSOR_OFFSET':
            return {
                ...ivTimeSeriesState,
                ivGraphCursorOffset: action.cursorOffset
            };

        case 'SET_IV_GRAPH_BRUSH_OFFSET':
            return {
                ...ivTimeSeriesState,
                ivGraphBrushOffset: {
                    start: action.startOffset,
                    end: action.endOffset
                }
            };

        case 'CLEAR_IV_GRAPH_BRUSH_OFFSET':
            return {
                ...ivTimeSeriesState,
                ivGraphBrushOffset: undefined
            };

        case 'ADD_IV_TIME_SERIES_TO_LOADING_KEYS':
            return {
                ...ivTimeSeriesState,
                loadingIVTSKeys: ivTimeSeriesState.loadingIVTSKeys.concat(action.tsRequestKeys)
            };

        case 'REMOVE_IV_TIME_SERIES_FROM_LOADING_KEYS':
            return {
                ...ivTimeSeriesState,
                loadingIVTSKeys: ivTimeSeriesState.loadingIVTSKeys.filter((tsRequestKey) => !action.tsRequestKeys.includes(tsRequestKey))
            };

        case 'IV_TIME_SERIES_PLAY_ON':
            return {
                ...ivTimeSeriesState,
                audiblePlayId: action.audiblePlayId

            };

        case 'IV_TIME_SERIES_PLAY_STOP':
            return {
                ...ivTimeSeriesState,
                audiblePlayId: null
            };

        default: return ivTimeSeriesState;
    }
};

export const Actions = {
    setIVTimeSeriesVisibility,
    setCurrentIVVariable,
    setCurrentIVMethodID,
    setCurrentIVDateRange,
    setCustomIVTimeRange,
    setUserInputTimeRangeSelectionButton,
    setUserInputCustomTimeRangeSelectionButton,
    setUserInputNumberOfDays,
    setTimespanUserInputs,
    setIVGraphCursorOffset,
    setIVGraphBrushOffset,
    clearIVGraphBrushOffset,
    addIVTimeSeriesToLoadingKeys,
    removeIVTimeSeriesFromLoadingKeys,
    ivTimeSeriesPlayOn,
    ivTimeSeriesPlayStop,
    startTimeSeriesPlay,
    stopTimeSeriesPlay
};
