import {fetchAvailableDVTimeSeries, fetchDVTimeSeries} from '../web-services/observations';

const INITIAL_OBSERVATIONS_DATA_STATE = {
    availableDVTimeSeries: [],
    dvTimeSeries: {}
};

/*
 * Synchronous Redux action to set the available dv time series
 * @param {Object} availableDVTimeSeries
 */
const setAvailableDVTimeSeries = function (availableTimeSeries) {
    return {
        type: 'SET_AVAILABLE_DV_TIME_SERIES',
        availableTimeSeries
    };
};

/*
 * Synchronous Redux action to add the dv time series
 * @param {String} timeSeriesId
 * #param {Object} data
 */
const addDVTimeSeries = function(timeSeriesId, data) {
    return {
        type: 'ADD_DV_TIME_SERIES',
        timeSeriesId,
        data
    };
};

/*
 * Synchronous Redux Action to update the current time series id to be viewed
 * @param {String} timeSeriesId
 */
const setCurrentDVTimeSeriesId = function(timeSeriesId) {
    return {
        type: 'SET_CURRENT_DV_TIME_SERIES_ID',
        timeSeriesId
    };
};

/*
 * Synchronous Redux action to update the graph's cursor offset
 * @param {Number} cursorOffset - difference in epoch time from the cursor position to graph start time
 */
const setDVGraphCursorOffset = function(cursorOffset) {
    return {
        type: 'SET_DV_GRAPH_CURSOR_OFFSET',
        cursorOffset
    };
};


/*
 * Redux asynchronous action to fetch the available time series and
 * update the store. The dispatched action returns a Promise.
 * @param {String} monitoringLocationId
 */
const retrieveAvailableDVTimeSeries = function(monitoringLocationId) {
    return function(dispatch) {
        return fetchAvailableDVTimeSeries(monitoringLocationId)
            .then(
                (data) => {
                    dispatch(setAvailableDVTimeSeries(data.timeSeries || []));
                },
                () => {
                    console.log(`Unable to fetch available dv time series for ${monitoringLocationId}`);
                });
    };
};

/*
 * Redux asynchronous action to retrieve the statistical time series with id timeSeriesId and monitoringLocationId.
 * The dispatched action returns a Promise that resolves when the data has been fetched.
 */
const retrieveDVTimeSeries = function(monitoringLocationId, timeSeriesId) {
    return function(dispatch, getState) {
        const state = getState();
        if (state.observationsData.dvTimeSeries && timeSeriesId in state.observationsData.dvTimeSeries) {
            dispatch(setCurrentDVTimeSeriesId(timeSeriesId));
            return Promise.resolve();
        }
        return fetchDVTimeSeries(monitoringLocationId, timeSeriesId)
            .then(
                (data) => {
                    dispatch(addDVTimeSeries(timeSeriesId, data));
                    dispatch(setCurrentDVTimeSeriesId(timeSeriesId));
                },
                () => {
                    console.log(`Unable to fetch observations time series for ${timeSeriesId}`);
                });
    };
};

/*
 * Slice reducer for observations data
 */
export const observationsDataReducer = function(observationsData=INITIAL_OBSERVATIONS_DATA_STATE, action) {
    switch (action.type) {
        case 'SET_AVAILABLE_DV_TIME_SERIES': {
            return {
                ...observationsData,
                availableDVTimeSeries: action.availableTimeSeries
            };
        }
        case 'ADD_DV_TIME_SERIES': {
            let newData = {};
            newData[action.timeSeriesId] = action.data;
            return Object.assign({}, observationsData, {
                dvTimeSeries: Object.assign({}, observationsData.dvTimeSeries, newData)
            });
        }
        default: return observationsData;
    }
};



/*
 * Synchronous Redux action to update the graph's brush offset
 * @param {Number} startBrushOffset - difference in epoch time from brush start to the displayed time series start time
 * @param {Number} endBrushOffset - difference in epoch time from displayed time series end to the end of the brush
 */
const setDVGraphBrushOffset = function(startBrushOffset, endBrushOffset) {
    return {
        type: 'SET_DV_GRAPH_BRUSH_OFFSET',
        startBrushOffset,
        endBrushOffset
    };
};

/*
 * Synchronous Redux action to clear the graph's brush offset
 */
const clearDVGraphBrushOffset = function() {
    return {
        type: 'CLEAR_DV_GRAPH_BRUSH_OFFSET'
    };
};

/*
 * Slice reducer for observationsState
 */
export const observationsStateReducer = function(observationsState={}, action) {
    switch (action.type) {
        case 'SET_CURRENT_DV_TIME_SERIES_ID':
            return {
                ...observationsState,
                currentDVTimeSeriesId: action.timeSeriesId
            };
        case 'SET_DV_GRAPH_CURSOR_OFFSET':
            return {
                ...observationsState,
                dvGraphCursorOffset: action.cursorOffset
            };
        case 'SET_DV_GRAPH_BRUSH_OFFSET':
            return {
                ...observationsState,
                dvGraphBrushOffset: {
                    start: action.startBrushOffset,
                    end: action.endBrushOffset
                }
            };
        case 'CLEAR_DV_GRAPH_BRUSH_OFFSET':
            return {
                ...observationsState,
                dvGraphBrushOffset: undefined
            };
        default:
            return observationsState;
    }
};

export const Actions = {
    setAvailableDVTimeSeries,
    addDVTimeSeries,
    setCurrentDVTimeSeriesId,
    setDVGraphCursorOffset,
    retrieveAvailableDVTimeSeries,
    retrieveDVTimeSeries,
    setDVGraphBrushOffset,
    clearDVGraphBrushOffset
};