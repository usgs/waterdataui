import memoize from 'fast-memoize';
import { createSelector } from 'reselect';

/*
 * Selectors that return properties from the state
 */
export const getVariables = state => state.series.variables ? state.series.variables : null;

export const getMethods = state => state.series.methods ? state.series.methods : null;

export const getQueryInfo = state => state.series.queryInfo || {};

export const getRequests = state => state.series.requests || {};

export const getCurrentVariableID = state => state.timeSeriesState.currentVariableID;

export const getCurrentDateRange = state => state.timeSeriesState.currentDateRange;

export const getLoadingTsKeys = state => state.timeSeriesState.loadingTSKeys;

export const getIanaTimeZone = state => state.series.ianaTimeZone ? state.series.ianaTimeZone : null;

export const getNwisTimeZone = state => state.series.timeZones || {};


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
 * @param {String} - Time series key: current or compare
 * @param {String} or null period = date range of interest as an ISO-8601 duration. If null the currentDateRange is used
 * @param {String} or null parmCd - if null the parmCd of the current variable is used.
 * @return {String} or null - Return the the request key for the request object
 * selected variable.
 */
export const getTsRequestKey = memoize((tsKey, period, parmCd) => createSelector(
    getCurrentDateRange,
    getCurrentParmCd,
    (dateRange, currentParmCd) => {
        const periodToUse = period ? period : dateRange;

        let result = `${tsKey}:${periodToUse}`;
        if (periodToUse !== 'P7D') {
            const parmCdToUse = parmCd ? parmCd : currentParmCd;
            result += `:${parmCdToUse}`;
        }

        return result;
    })
);
/*
 * @param {String} tsKey - current or compare
 * @param {String} or null period - date range of interest specified as an ISO-8601 duration. If null, P7D is assumed
 * @param {String} or null parmCd - Only need to specify if period is something other than P7D or null
 * @return {Boolean} - True if the time series with key, period, and parmCd has already been requested
 *
 */
export const hasTimeSeries = memoize((tsKey, period, parmCd) => createSelector(
    getTsRequestKey(tsKey, period, parmCd),
    state => state.series,
    (tsRequestKey, series) => {
        return Boolean(series && series.requests && series.requests[tsRequestKey]);
}));

/*
 * @param {String} tsKey - current or compare
 * @param {String} or null period - date range of interest specified as an ISO-8601 duration. If null, P7D is assumed
 * @param {String} or null parmCd - Only need to specify if period is something other than P7D or null
 * @return {Object} containing the queryInfo for a specific timeseries request or the empty object if that request
 *      is not in the state
 * */
export const getTsQueryInfo  = memoize((tsKey, period, parmCd) => createSelector(
    getQueryInfo,
    getTsRequestKey(tsKey, period, parmCd),
    (queryInfos, tsRequestKey) => queryInfos[tsRequestKey] ? queryInfos[tsRequestKey] : {}
));

/*
 * @param {String} tsKey - current or compare
 * @param {String} or null period - date range of interest specified as an ISO-8601 duration. If null, P7D is assumed
 * @param {String} or null parmCd - Only need to specify if period is something other than P7D or null
 * @return {Object} with start and end {Date} properties that contain the range of the data requested or null
 *      if the store does not contain a query for the tsKey request
 * */
export const getRequestTimeRange = memoize((tsKey, period, parmCd) => createSelector(
    getTsQueryInfo(tsKey, period, parmCd),
    (tsQueryInfo) => {
        const notes = tsQueryInfo.notes ? tsQueryInfo.notes : null;
        if (!notes) {
            return null;
        }
        let result;
        // If this is a period-based query (eg, P7D), use the request time
        // as the end date.
        if (notes['filter:timeRange'].mode === 'PERIOD') {
            const start = new Date(notes.requestDT);
            start.setDate(start.getDate() - notes['filter:timeRange'].periodDays);
            result = {
                start: start.getTime(),
                end: notes.requestDT
            };
        } else {
            result = {
                start: notes['filter:timeRange'].interval.start,
                end: notes['filter:timeRange'].interval.end
            };
        }
        return result;
    }
));

/*
 * @param {String} tsKey - current or compare
 * @param {String} or null period - date range of interest specified as an ISO-8601 duration. If null, P7D is assumed
 * @param {String} or null parmCd - Only need to specify if period is something other than P7D or null
 * @return {Boolean} - True if the tsRequestKey for tsKey, period, and parmCD is being loaded.
 * */
export const isLoadingTS = memoize((tsKey, period, parmCd) => createSelector(
    getLoadingTsKeys,
    getTsRequestKey(tsKey, period, parmCd),
    (loadingTSKeys, tsRequestKey) => loadingTSKeys.includes(tsRequestKey)
));


/*
 * @param {String} tsKey - current or compare
 * @param {String} or null period - date range of interest specified as an ISO-8601 duration. If null, P7D is assumed
 * @param {String} or null parmCd - Only need to specify if period is something other than P7D or null
 * @return {Object} the requests object for the time series identified by tsKey, period, and parmCd or the empty object
 *      if none exists
 */
export const getTSRequest = memoize((tsKey, period, parmCd) => createSelector(
    getRequests,
    getTsRequestKey(tsKey, period, parmCd),
    (requests, tsRequestKey) => requests[tsRequestKey] || {}
));

/*
 * @param {String} tsKey - current or compare
 * @param {String} or null period - date range of interest specified as an ISO-8601 duration. If null, P7D is assumed
 * @param {String} or null parmCd - Only need to specify if period is something other than P7D or null
 * @return {Object} the timeSeriesCollection for the time series identified by tsKey, period, and parmCd or null if
 *      none exists
 */
export const getTimeSeriesCollectionIds = memoize((tsKey, period, parmCd) => createSelector(
    getTSRequest(tsKey, period, parmCd),
    (tsRequest) => tsRequest.timeSeriesCollections || null
));
