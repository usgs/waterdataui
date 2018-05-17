const merge = require('lodash/merge');
const omitBy = require('lodash/omitBy');

/*
 * Case reducers
 */

const addTimeSeriesCollection = function(series, action) {
    return merge({}, series, action.data);
};

const resetTimeSeries = function(series, action) {
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
        case 'ADD_TIME_SERIES_COLLECTION': return addTimeSeriesCollection(series, action);
        case 'RESET_TIME_SERIES': return resetTimeSeries(series, action);
        default: return series;
    }
};
