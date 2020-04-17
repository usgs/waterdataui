import merge from 'lodash/merge';
import omitBy from 'lodash/omitBy';

/*
 * Case reducers
 */

const addTimeSeriesCollection = function(series, action) {
    return merge({}, series, action.data);
};

const resetTimeSeries = function(series, action) {
    let newSeries = {
        ...series,
        timeSeries: omitBy(series.timeSeries, (tsValue) => tsValue.tsKey === action.key),
        requests: {
            ...(series || {}).requests
        }
    };
    newSeries.requests[action.key] = {};

    return newSeries;
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
