export const INITIAL_STATE = {
    showCompareIVData: false,
    showMedianData : false,
    selectedDateRange: 'P7D',
    selectedCustomDateRange: null,
    selectedParameterCode: null,
    selectedIVMethodID: null,
    graphCursorOffset: null,
    graphBrushOffset: null,
};

/*
 * Synchronous action to set the visibility of the compare data
 * @param {Boolean} show
 * @return {Object} - Redux action
 */
export const setCompareDataVisibility = function(show) {
    return {
        type: 'SET_COMPARE_DATA_VISIBILITY',
        show
    };
};

/*
 * Synchronous action to set the visibility of the median data
 * @param {Boolean} show
 * @return {Object} - Redux action
 */
export const setMedianDataVisibility = function(show) {
    return {
        type: 'SET_MEDIAN_DATA_VISIBILITY',
        show
    };
};

/*
 * Synchronous action to set the selected parameter code for the hydrograph
 * @param {String} parameterCod
 * @return {Object} - Redux action
 */
export const setSelectedParameterCode = function(parameterCode) {
    return {
        type: 'SET_SELECTED_PARAMETER_CODE',
        parameterCode
    };
};

/*
 * Synchronous action to set the selected method ID (uniquely identifies the IV time series).
 * Some parameter codes have more than one IV time series. The method ID distinguishes these
 * @param {String} methodID
 * @return {Object} - Redux action
 */
export const setSelectedIVMethodID = function(methodID) {
    return {
        type: 'SET_SELECTED_IV_METHOD_ID',
        methodID
    };
};

/*
 * Synchronous action sets the date range kind of the hydrograph.
 * @param {String} dateRange - represents an ISO 8601 Duration or "custom"
 * @return {Object} - Redux action
 */
export const setSelectedDateRange = function(dateRange) {

    return {
        type: 'SET_SELECTED_DATE_RANGE',
        dateRange
    };
};

/*
 * Synchronous action sets the custom date range for the hydrograph
 * @param {String} startDate - ISO 8601 Date (yyyy-mm-dd)
 * @param {String} endDate - ISO 8601 Date (yyyy-mm-dd)
 * @return {Object} - Redux action
 */
export const setSelectedCustomDateRange = function(startDate, endDate) {
    return {
        type: 'SET_SELECTED_CUSTOM_DATE_RANGE',
        startDate,
        endDate
    };
};

/*
 * Synchronous action sets the hydrograph cursor offset - This is the difference
 * in cursor position and graph start time, in milliseconds
 * @param {Number} cursorOffset
 * @return {Object} - Redux action
 */
export const setGraphCursorOffset = function(cursorOffset) {
    return {
        type: 'SET_GRAPH_CURSOR_OFFSET',
        cursorOffset
    };
};

/*
 * Synchronous action sets the hydrograph graph brush offset - in milliseconds
 * @param {Number} startOffset - difference between brush start and the start time of the displayed time series
 * @param {Number} endOffset - difference between the end of the displayed time series and the brush end
 * @return {Object} - Redux action
 */
export const setGraphBrushOffset = function(startOffset, endOffset) {
    return {
        type: 'SET_GRAPH_BRUSH_OFFSET',
        startOffset,
        endOffset
    };
};

/*
 * Synchronous action to clear the hydrograph  brush offset
 * return {Object} - Redux action
 */
export const clearGraphBrushOffset = function() {
    return {
        type: 'CLEAR_GRAPH_BRUSH_OFFSET'
    };
};

export const hydrographStateReducer = function(hydrographState=INITIAL_STATE, action) {
    switch (action.type) {
        case 'SET_COMPARE_DATA_VISIBILITY': {
            return {
                ...hydrographState,
                showCompareIVData: action.show
            };
        }

        case 'SET_MEDIAN_DATA_VISIBILITY': {
            return {
                ...hydrographState,
                showMedianData: action.show
            };
        }

        case 'SET_SELECTED_PARAMETER_CODE':
            return {
                ...hydrographState,
                selectedParameterCode: action.parameterCode
            };

        case 'SET_SELECTED_IV_METHOD_ID':
            return {
                ...hydrographState,
                selectedIVMethodID: action.methodID
            };

        case 'SET_SELECTED_DATE_RANGE':
            return {
                ...hydrographState,
                selectedDateRange: action.dateRange
            };

        case 'SET_SELECTED_CUSTOM_DATE_RANGE':
            return {
                ...hydrographState,
                selectedCustomDateRange: {
                    start: action.startDate,
                    end: action.endDate
                }
            };

        case 'SET_GRAPH_CURSOR_OFFSET':
            return {
                ...hydrographState,
                graphCursorOffset: action.cursorOffset
            };

        case 'SET_GRAPH_BRUSH_OFFSET':
            return {
                ...hydrographState,
                graphBrushOffset: {
                    start: action.startOffset,
                    end: action.endOffset
                }
            };

        case 'CLEAR_GRAPH_BRUSH_OFFSET':
            return {
                ...hydrographState,
                graphBrushOffset: null
            };

        default: return hydrographState;
    }
};
