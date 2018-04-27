const memoize = require('fast-memoize');
const { createSelector } = require('reselect');

/*
 * Selectors that return properties from the state
 */
export const getVariables = state => state.series.variables ? state.series.variables : null;

export const getCurrentVariableID = state => state.timeseriesState.currentVariableID;

export const getCurrentDateRange = state => state.timeseriesState.currentDateRange;

export const getMethods = state => state.series.methods ? state.series.methods : null;

export const getQueryInfo = state => state.series.queryInfo || {};

/*
 * Selectors the return derived data from the state
 */

/*
 * @return {Object}     Variable details for the currently selected variable or null.
 */
export const getCurrentVariable = createSelector(
    getVariables,
    getCurrentVariableID,
    (variables, variableID) => {
        return variableID  && variables  && variables[variableID] ? variables[variableID] : null;
    }
);

/*
 * @return {String} or null - The parameter code of the currently selected variable or null if no variable selected
 */
export const getCurrentParmCd = createSelector(
    getCurrentVariable,
    (currentVar) => {
        return currentVar && currentVar.variableCode ? currentVar.variableCode.value : null;
    }
);

/*
 * @param {String} - time series key: current, compre or median
 * @param {String} or null period = date range of interest as an ISO-8601 duration. If null the currentDateRange is used
 * @param {String} or null parmCD - if null the parmCd of the current variable is used.
 * @return {String} or null - Return the the request key for the request object
 * selected variable.
 */
export const getTsRequestKey = memoize((tsKey, period, parmCd) => createSelector(
    getCurrentDateRange,
    getCurrentParmCd,
    (dateRange, currentParmCd) => {
        let result = `${tsKey}`;
        if (tsKey !== 'median') {
            const periodToUse = period ? period : dateRange;
            result += `:${periodToUse}`;
            if (periodToUse !== 'P7D') {
                const parmCdToUse = parmCd ? parmCd : currentParmCd;
                result += `:${parmCdToUse}`;
            }
        }
        return result;
    })
);
/*
 * @param {String} tsKey - current, compare, or median
 * @param {String} or null period - date range of interest specified as an ISO-8601 duration. If null, P7D is assumed
 * @param {String} or null parmCD - Only need to specify if period is something other than P7D or null
 * @return {Boolean} - True if the time series with key, period, and parmCd has already been requested
 *
 */
export const hasTimeSeries = memoize((tsKey, period, parmCd) => createSelector(
    getTsRequestKey(tsKey, period, parmCd),
    state => state.series,
    (tsRequestKey, series) => {
        return series && series.requests && series.requests[tsRequestKey] ? true : false;
}));

