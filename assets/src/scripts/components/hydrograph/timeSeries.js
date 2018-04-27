const { timeFormat } = require('d3-time-format');
const memoize = require('fast-memoize');
const { createSelector } = require('reselect');

const { getQueryInfo, getCurrentVariable, getCurrentVariableTimeSeriesRequestKey } = require('../../selectors/timeSeriesSelector');


// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');



/**
 * @return {Object} Mapping of time series ID to time series details. Only timeseries with non zero points are returned
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
    getCurrentVariableTimeSeriesRequestKey(tsKey),
    allTimeSeriesSelector,
    getCurrentVariable,
    (tsRequestKey, timeSeries, variable) => {
        let ts = {};
        if (variable) {
            ts = {};
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


/**
 * Returns a selector that, for a given tsKey and period:
 * Selects all time series data. If period is null then, the currentDateRange is used
 * @param  {String} tsKey   Time-series key
 * @param {String} or null date range using ISO-8601 duration
 * @param  {Object} state   Redux state
 * @return {Object} - Keys are tsID, values are time-series data
 */
export const timeSeriesSelector = memoize((tsKey, period) => createSelector(
    getCurrentVariableTimeSeriesRequestKey(tsKey, period),
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



/**
 * Factory function creates a function that:
 * Returns the current show state of a timeseries.
 * @param  {Object}  state     Redux store
 * @param  {String}  tsKey Timeseries key
 * @return {Boolean}           Show state of the timeseries
 */
export const isVisibleSelector = memoize(tsKey => (state) => {
    return state.timeseriesState.showSeries[tsKey];
});



/**
 * @return {String}     The label for the y-axis
 */
export const yLabelSelector = createSelector(
    getCurrentVariable,
    variable => variable ? variable.variableDescription : ''
);


/**
 * @return {String}     The name of the currently selected variable.
 */
export const titleSelector = createSelector(
    getCurrentVariable,
    variable => variable ? variable.variableName : ''
);


export const requestTimeRangeSelector = createSelector(
    getQueryInfo,
    (queryInfos) => {
        return Object.keys(queryInfos).reduce((ranges, tsKey) => {
            const notes = queryInfos[tsKey].notes;
            // If this is a period-based query (eg, P7D), use the request time
            // as the end date.
            if (notes['filter:timeRange'].mode === 'PERIOD') {
                const start = new Date(notes.requestDT);
                start.setDate(notes.requestDT.getDate() - notes['filter:timeRange'].periodDays);
                ranges[tsKey] = {
                    start: start,
                    end: notes.requestDT
                };
            } else {
                ranges[tsKey] = {
                    start: notes['filter:timeRange'].interval.start,
                    end: notes['filter:timeRange'].interval.end
                };
            }
            return ranges;
        }, {});
    }
);


/**
 * @return {String}     Description for the currently display set of time
 *                      series
 */
export const descriptionSelector = createSelector(
    getCurrentVariable,
    requestTimeRangeSelector,
    (variable, requestTimeRanges) => {
        const desc = variable ? variable.variableDescription : '';
        const range = requestTimeRanges['current:P7D'];
        if (range) {
            return `${desc} from ${formatTime(range.start)} to ${formatTime(range.end)}`;
        } else {
            return desc;
        }
    }
);
