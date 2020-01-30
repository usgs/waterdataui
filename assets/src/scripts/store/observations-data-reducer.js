
const INITIAL_STATE = {
    observationData: {
        timeSeries: {}
    }
};

/*
 * Case reducers
 */
const setObservationsTimeSeries = function(observationsData, action) {
    let newData = {};
    newData[action.timeSeriesId] = action.data;
    return Object.assign({}, observationsData, {
        timeSeries: Object.assign({}, observationsData.timeSeries, newData)
    });
};

/*
 * Slice reducer
 */
export const observationsDataReducer = function(observationsData=INITIAL_STATE, action) {
    switch (action.type) {
        case 'SET_OBSERVATIONS_TIME_SERIES': return setObservationsTimeSeries(observationsData, action);
        default: return observationsData;
    }
};