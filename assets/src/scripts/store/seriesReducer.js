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

const updateStatisticalStartTimes = function(series, action) {
    let timeSeries = series.timeSeries;
    Object.keys(timeSeries).forEach(k => {
        let v = timeSeries[k];
        if (v.startTime) {
            v.startTime = action.startTime;
        }
        timeSeries[k] = v;
    });
    return series;
};

/*
 * Slice reducer
 */

export const seriesReducer = function(series={}, action) {
    switch (action.type) {
        case 'ADD_TIMESERIES_COLLECTION': return addTimeSeriesCollection(series, action);
        case 'RESET_TIMESERIES': return resetTimeSeries(series, action);
        default: return series;
    }
};