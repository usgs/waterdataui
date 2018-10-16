import merge from 'lodash/merge';
import omitBy from 'lodash/omitBy';

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
            ...{[action.key]: {}}
        }
    };
};

const addIanaTimeZone = function(series, action) {
    return {
        ...series,
        ianaTimeZone: action.ianaTimeZone
    };
};

/*
 * Slice reducer
 */

export const seriesReducer = function(series={}, action) {
    switch (action.type) {
        case 'ADD_TIME_SERIES_COLLECTION': return addTimeSeriesCollection(series, action);
        case 'RESET_TIME_SERIES': return resetTimeSeries(series, action);
        case 'LOCATION_IANA_TIME_ZONE_SET': return addIanaTimeZone(series, action);
        default: return series;
    }
};
