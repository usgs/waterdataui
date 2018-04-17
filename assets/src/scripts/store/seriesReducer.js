const merge = require('lodash/merge');
const omitBy = require('lodash/omitBy');

/*
 * Case reducers
 */

const addTimeseriesCollection = function(series, action) {
    return merge({}, series, action.data);
};

const resetTimeseries = function(series, action) {
    return {
        ...series,
        timeSeries: omitBy(series.timeSeries, (tsValue) => tsValue.tsKey === action.key),
        requests: {
            ...(series || {}).requests,
            [action.key]: {}
        }
    };
};

/*
 * Slice reducer
 */

export const seriesReducer = function(series={}, action) {
    switch (action.type) {
        case 'ADD_TIMESERIES_COLLECTION': return addTimeseriesCollection(series, action);
        case 'RESET_TIMESERIES': return resetTimeseries(series, action);
        default: return series;
    }
};