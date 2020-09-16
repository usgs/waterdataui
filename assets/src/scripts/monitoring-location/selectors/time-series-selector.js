import memoize from 'fast-memoize';
import uniq from 'lodash/uniq';
import _includes from 'lodash/includes';
import { DateTime } from 'luxon';
import { createSelector } from 'reselect';

import {getIanaTimeZone} from './time-zone-selector';

/*
 * Selectors that return properties from the state
 */
export const getVariables = state => state.ivTimeSeriesData.variables ? state.ivTimeSeriesData.variables : null;

export const getSourceInfo = state => state.ivTimeSeriesData.sourceInfo || {};

export const getSiteCodes = state => state.ivTimeSeriesData.siteCodes || {};

export const getMethods = state => state.ivTimeSeriesData.methods ? state.ivTimeSeriesData.methods : {};

export const getQueryInfo = state => state.ivTimeSeriesData.queryInfo || {};

export const getRequests = state => state.ivTimeSeriesData.requests || {};

export const getCurrentVariableID = state => state.ivTimeSeriesState.currentIVVariableID;

export const getCurrentMethodID = state => state.ivTimeSeriesState.currentIVMethodID;

export const getCheckedCustomTimeRangeSelectionButton = state => state.customTimeRangeSelectionButton;

export const getCheckedCustomTimeRangeSubSelectionButton = state => state.customTimeRangeSubSelectionButton;

export const getCurrentDateRangeKind = (state) => {
    return state.ivTimeSeriesState.currentIVDateRangeKind || null;
};

export const getCurrentDateRangeKindCustomSelection = (state) => {
    return state.ivTimeSeriesState.currentIVDateRangeKindCustomSelection || null;
};

export const getLoadingTsKeys = state => state.ivTimeSeriesState.loadingIVTSKeys || [];

export const getNwisTimeZone = state => state.ivTimeSeriesData.timeZones || {};

export const getCustomTimeRange = state => state.ivTimeSeriesState.customIVTimeRange;

export const getTimeSeries = state => state.ivTimeSeriesData.timeSeries ? state.ivTimeSeriesData.timeSeries : {};

export const hasAnyTimeSeries = createSelector(
    getTimeSeries,
    (timeSeries) => {
        return Object.keys(timeSeries).length ? true : false;
    }
);

/*
 * Selectors the return derived data from the state
 */

/*
 * @param {String} siteno
 * @return {String} monitoring loation name. Returns empty string if state does not contain siteNo.
 */
export const getMonitoringLocationName = memoize((siteNo) => createSelector(
    getSourceInfo,
    (sourceInfo) => siteNo in sourceInfo ? sourceInfo[siteNo].siteName || '' : ''
));

/*
 * @param {String} siteno
 * @return {String} agency code for siteno
 */
export const getAgencyCode = memoize((siteNo) => createSelector(
    getSiteCodes,
    (siteCodes) => siteNo in siteCodes ? siteCodes[siteNo].agencyCode || '' : ''
));
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
    getCurrentDateRangeKind,
    getCurrentParmCd,
    (dateRangeKind, currentParmCd) => {
        const periodToUse = period ? period : dateRangeKind;

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
    state => state.ivTimeSeriesData,
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

/*
 * @param {String} tsKey - current or compare
 * @param {String} or null period - date range of interest specified as an ISO-8601 duration. If null, P7D is assumed
 * @param {String} or null parmCd - Only need to specify if period is something other than P7D or null
 * @return {Object} with start and end {Number} properties that contain the range of the data requested in universal time or null
 *      if the store does not contain a query for the tsKey request
 * */
export const getRequestTimeRange = memoize((tsKey, period, parmCd) => createSelector(
    getTsQueryInfo(tsKey, period, parmCd),
    getIanaTimeZone,
    (tsQueryInfo, ianaTimeZone) => {
        const notes = tsQueryInfo.notes ? tsQueryInfo.notes : null;
        if (!notes) {
            return null;
        }
        let result;
        // If this is a period-based query (eg, P7D), use the request time
        // as the end date.
        if (notes['filter:timeRange'].mode === 'PERIOD') {
            const endTime = DateTime.fromMillis(notes.requestDT, {zone: ianaTimeZone});
            const startTime = endTime.minus({days: notes['filter:timeRange'].periodDays});
            result = {
                start: startTime.toMillis(),
                end: notes.requestDT
            };
        } else {
            let intervalStart = notes['filter:timeRange'].interval.start;
            let intervalEnd = notes['filter:timeRange'].interval.end;
            result = {
                start: intervalStart,
                end: intervalEnd
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

/**
 * Returns a selector that, for a given tsKey and period:
 * Selects all time series data. If period is null then, the currentDateRange is used
 * @param  {String} tsKey   Time-series key
 * @param {String} period or null date range using ISO-8601 duration;
 * @param  {Object} state   Redux state
 * @return {Object} - Keys are tsID, values are time-series data
 */
export const getTimeSeriesForTsKey = memoize((tsKey, period) => createSelector(
    getTsRequestKey(tsKey, period),
    getTimeSeries,
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
 * Returns a selector that, for a given tsKey:
 * Selects all time series for the current time series variable and current date range.
 * @param  {String} tsKey   Time-series key
 * @param  {Object} state   Redux state
 * @return {Object}         Time-series data
 */
export const getCurrentVariableTimeSeries = memoize((tsKey, period) => createSelector(
    getTimeSeriesForTsKey(tsKey, period),
    getCurrentVariable,
    (timeSeries, variable) => {
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
));

/*
 * @param {String} tsKey - current or compare
 * @param {String} or null period - date range of interest specified as an ISO-8601 duration. If null, P7D is assumed
 * @param {String} or null parmCd - Only need to specify if period is something other than P7D or null
 * return {Array} an object containing method_id and method_description properties
 */
export const getAllMethodsForCurrentVariable = createSelector(
    getMethods,
    getCurrentVariableTimeSeries('current', 'P7D'),
    (methods, timeSeries) => {
        const allMethods = Object.values(methods);
        const currentMethodIds = uniq(Object.values(timeSeries).map((ts) => ts.method));

        return allMethods.filter((method) => {
            return _includes(currentMethodIds, method.methodID);
        });
    }
);

