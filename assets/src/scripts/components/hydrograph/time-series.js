import { timeFormat } from 'd3-time-format';
import memoize from 'fast-memoize';
import _includes from 'lodash/includes';
import uniq from 'lodash/uniq';
import { createSelector } from 'reselect';

import { getRequestTimeRange, getCurrentVariable, getTsRequestKey, getIanaTimeZone, getCurrentParmCd, getCurrentMethodID,
    getMethods } from '../../selectors/time-series-selector';


export const TEMPERATURE_PARAMETERS = {
    celsius: [
        '00010',
        '00020',
        '45587',
        '45589',
        '50011',
        '72176',
        '72282',
        '72283',
        '72329',
        '81027',
        '81029',
        '85583',
        '99229',
        '99230'
    ],
    fahrenheit: [
        '00011',
        '00021',
        '45590'
    ]
};


// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');



/**
 * @return {Object} Mapping of time series ID to time series details. Only time series with non zero points are returned
 */
export const allTimeSeriesSelector = createSelector(
    state => state.series,
    (stateSeries) => {
        let timeSeries = {};
        if (stateSeries && stateSeries.hasOwnProperty('timeSeries')) {
            let stateTimeSeries = stateSeries.timeSeries;
            for (let key of Object.keys(stateTimeSeries)) {
                const ts = stateTimeSeries[key];
                if (ts.hasOwnProperty('points') && ts.points.length > 0) {
                    timeSeries[key] = ts;
                }
            }
        }
        return timeSeries;
    }
);


/**
 * Returns a selector that, for a given tsKey:
 * Selects all time series for the current time series variable and current date range.
 * @param  {String} tsKey   Time-series key
 * @param  {Object} state   Redux state
 * @return {Object}         Time-series data
 */
export const currentVariableTimeSeriesSelector = memoize(tsKey => createSelector(
    getTsRequestKey(tsKey),
    allTimeSeriesSelector,
    getCurrentVariable,
    (tsRequestKey, timeSeries, variable) => {
        let ts = {};
        if (variable) {
            Object.keys(timeSeries).forEach(key => {
                const series = timeSeries[key];
                if (series.tsKey === tsRequestKey && series.variable === variable.oid) {
                    ts[key] = series;
                }
            });
        }
        return ts;
    }
));

/*
 * Return all times series for the current variable.
 * @ return {Object} time series data
 */
export const getAllTimeSeriesForCurrentVariable = createSelector(
    getCurrentVariable,
    allTimeSeriesSelector,
    (variable, timeSeries) => {
        let ts = {};
        if (variable) {
            Object.keys(timeSeries).forEach(key => {
                const series = timeSeries[key];
                if (series.variable === variable.oid) {
                    ts[key] = series;
                }
            });
        }
        return ts;
    }
);

/*
 * @param {String} tsKey - current or compare
 * @param {String} or null period - date range of interest specified as an ISO-8601 duration. If null, P7D is assumed
 * @param {String} or null parmCd - Only need to specify if period is something other than P7D or null
 * return {Array} an object containing method_id and method_description properties
 */
export const getAllMethodsForCurrentVariable = createSelector(
    getMethods,
    getAllTimeSeriesForCurrentVariable,
    (methods, timeSeries) => {
        const allMethods = Object.values(methods);
        const currentMethodIds = uniq(Object.values(timeSeries).map((ts) => ts.method));

        return allMethods.filter((method) => {
            return _includes(currentMethodIds, method.methodID);
        });
    }
);

/**
 * Returns a selector that, for a given tsKey and period:
 * Selects all time series data. If period is null then, the currentDateRange is used
 * @param  {String} tsKey   Time-series key
 * @param {String} or null date range using ISO-8601 duration;
 * @param  {Object} state   Redux state
 * @return {Object} - Keys are tsID, values are time-series data
 */
export const timeSeriesSelector = memoize((tsKey, period) => createSelector(
    getTsRequestKey(tsKey, period),
    allTimeSeriesSelector,
    (tsRequestKey, timeSeries) => {
        let x = {};
        Object.keys(timeSeries).forEach(key => {
            const series = timeSeries[key];
            if (series.tsKey === tsRequestKey) {
                x[key] = series;
            }
        });
        return x;
    }
));

export const hasTimeSeriesWithPoints = memoize((tsKey, period) => createSelector(
    timeSeriesSelector(tsKey, period),
    (timeSeries) => {
        const seriesWithPoints = Object.values(timeSeries).filter(x => x.points.length > 0);
        return seriesWithPoints.length > 0;
}));

/**
 * Factory function creates a function that:
 * Returns the current show state of a time series.
 * @param  {Object}  state     Redux store
 * @param  {String}  tsKey Time series key
 * @return {Boolean}           Show state of the time series
 */
export const isVisibleSelector = memoize(tsKey => (state) => {
    return state.timeSeriesState.showSeries[tsKey];
});



/**
 * @return {String}     The label for the y-axis
 */
export const yLabelSelector = createSelector(
    getCurrentVariable,
    variable => variable ? variable.variableDescription : ''
);


export const secondaryYLabelSelector = createSelector(
    getCurrentParmCd,
    parmCd => {
        let secondaryYLabel = null;
        if (TEMPERATURE_PARAMETERS.celsius.includes(parmCd)) {
            secondaryYLabel = 'degrees Fahrenheit';
        } else if(TEMPERATURE_PARAMETERS.fahrenheit.includes(parmCd)) {
            secondaryYLabel = 'degrees Celsius';
        }
        return secondaryYLabel;
    }
);


/**
 * @return {String}     The title to include in the hyrdograph, will include method description if defined.
 */
export const titleSelector = createSelector(
    getCurrentVariable,
    getCurrentMethodID,
    getMethods,
    (variable, methodId, methods) => {
        let title = variable ? variable.variableName : '';
        if(methodId && methods && methods[methodId].methodDescription) {
                title = `${title}, ${methods[methodId].methodDescription}`;
        }
        return title;
    }
);


/**
 * @return {String}     Description for the currently display set of time
 *                      series
 */
export const descriptionSelector = createSelector(
    getCurrentVariable,
    getRequestTimeRange('current', 'P7D'),
    (variable, requestTimeRange) => {
        const desc = variable ? variable.variableDescription : '';
        if (requestTimeRange) {
            return `${desc} from ${formatTime(requestTimeRange.start)} to ${formatTime(requestTimeRange.end)}`;
        } else {
            return desc;
        }
    }
);

/**
 * Select the time zone. If the time zone is null, use `local` as the time zone
 *
 * @ return {String} - IANA time zone
 *
 */
export const tsTimeZoneSelector = createSelector(
    getIanaTimeZone,
    ianaTimeZone => {
        return ianaTimeZone !== null ? ianaTimeZone : 'local';
    }
);
