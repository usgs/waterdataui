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
 * @param {String} or null period = date range of interst as an ISO-8601 duration. If null P7D is used
 * @param {String} or null parmCD - Only need if period is something other than P7D or null
 */
export const tsRequestKey = function(tsKey, period, parmCd) {
    let result =`${tsKey}`;
    if (tsKey !== 'median') {
        const periodToUse = period ? period : 'P7D';
        result += `:${periodToUse}`;
        if (periodToUse !== 'P7D') {
            result += `:${parmCd}`;
        }
    }

    return result;
};
/*
 * @param {String} tsKey - current, compare, or median
 * @param {String} or null period - date range of interest specified as an ISO-8601 duration. If null, P7D is assumed
 * @param {String} or null parmCD - Only need to specify if period is something other than P7D or null
 * @return {Boolean} - True if the time series with key, period, and parmCd has already been requested
 *
 */
export const hasTimeSeries = memoize(tsRequestKey => {

    return state => state.series && state.series.requests && state.series.requests[tsRequestKey] ? true : false;
});

/*
 * @param {String} tsKey - current, compare, or median
 * @param {String} or null - period to use, otherwise the current date range is used.
 * @return {String} or null - Return the the request key for the request object for the tsKey and period and currently
 * selected variable.
 */
export const getCurrentVariableTimeSeriesRequestKey = memoize((tsKey, period )=> createSelector(
    getCurrentParmCd,
    getCurrentDateRange,
    (parmCd, currentPeriod) => {
        if (parmCd && (period || currentPeriod)) {
            const periodToUse = period ? period : currentPeriod;
            return tsRequestKey(tsKey, periodToUse, parmCd);
        } else {
            return null;
        }
    })
);
