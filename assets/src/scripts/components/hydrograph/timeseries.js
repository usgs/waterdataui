const { timeFormat } = require('d3-time-format');
const memoize = require('fast-memoize');
const { createSelector } = require('reselect');


// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');


/**
 * @return {Object}     Mapping of variable IDs to variable details
 */
export const variablesSelector = state => state.series.variables ? state.series.variables : null;


/**
 * @return {Object}     Variable details for the currently selected variable.
 */
export const currentVariableSelector = createSelector(
    variablesSelector,
    state => state.currentVariableID,
    (variables, variableID) => {
        return variableID ? variables[variableID] : null;
    }
);

/**
 * Returns currently selected parameter code
 * @return String or null if none
 */
    //TODO: see if this is use anywhere before removing.
export const currentParmCd = createSelector(
    currentVariableSelector,
    (currentVar) => currentVar && currentVar.variableCode ? currentVar.variableCode.value : null
);



/**
 * @return {Object}     Mapping of method IDs to method details
 */
export const methodsSelector = state => state.series.methods;


/**
 * @return {Object}     Mapping of time series ID to time series details
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
 * Selects all time series for the current time series variable.
 * @param  {String} tsKey   Time-series key
 * @param  {Object} state   Redux state
 * @return {Object}         Time-series data
 */
export const currentVariableTimeSeriesSelector = memoize(tsKey => createSelector(
    allTimeSeriesSelector,
    currentVariableSelector,
    (timeSeries, variable) => {
        let ts = {};
        if (variable) {
            ts = {};
            Object.keys(timeSeries).forEach(key => {
                const series = timeSeries[key];
                if (series.tsKey === tsKey && series.variable === variable.oid) {
                    ts[key] = series;
                }
            });
        }
        return ts;
    }
));

/**
 * Returns a selector that, for a given tsKey:
 * Selects all time series data.
 * @param  {String} tsKey   Time-series key
 * @param  {Object} state   Redux state
 * @return {Object} - Keys are tsID, values are time-series data
 */
export const timeSeriesSelector = memoize(tsKey => createSelector(
    allTimeSeriesSelector,
    (timeSeries) => {
        let x = {};
        Object.keys(timeSeries).forEach(key => {
            const series = timeSeries[key];
            if (series.tsKey === tsKey) {
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
    return state.showSeries[tsKey];
});



/**
 * @return {String}     The label for the y-axis
 */
export const yLabelSelector = createSelector(
    currentVariableSelector,
    variable => variable ? variable.variableDescription : ''
);


/**
 * @return {String}     The label for the y-axis, used by addSVGAccessibility
 */
export const titleSelector = createSelector(
    currentVariableSelector,
    variable => variable ? variable.variableName : ''
);


/**
 * @return {String}     Description for the currently display set of time
 *                      series
 */
export const descriptionSelector = createSelector(
    currentVariableSelector,
    currentVariableTimeSeriesSelector('current'),
    (variable, timeSeries) => {
        const desc = variable ? variable.variableDescription : '';
        const startTime = new Date(Math.min.apply(null, Object.values(timeSeries).map(ts => ts.startTime)));
        const endTime = new Date(Math.max.apply(null, Object.values(timeSeries).map(ts => ts.endTime)));
        return `${desc} from ${formatTime(startTime)} to ${formatTime(endTime)}`;
    }
);
