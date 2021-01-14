import findKey from 'lodash/findKey';
import last from 'lodash/last';
import merge from 'lodash/merge';
import omitBy from 'lodash/omitBy';

import {DateTime} from 'luxon';

import {normalize} from 'ui/schema';
import {calcStartTime, sortedParameters} from 'ui/utils';
import {getPreviousYearTimeSeries, getTimeSeries} from 'ui/web-services/models';

import {convertCelsiusCollectionsToFahrenheitAndMerge, isPeriodCustom, parsePeriodCode} from 'ml/iv-data-utils';
import {
    getCurrentDateRange,
    getCurrentParmCd, getCustomTimeRange, getRequestTimeRange,
    getTimeSeriesCollectionIds,
    getTsRequestKey,
    hasTimeSeries
} from 'ml/selectors/time-series-selector';
import {getIanaTimeZone} from 'ml/selectors/time-zone-selector';

import {Actions as floodInundationActions} from 'ml/store/flood-inundation';
import {Actions as ivTimeSeriesStateActions} from 'ml/store/instantaneous-value-time-series-state';

const GAGE_HEIGHT_CD = '00065';

/* eslint no-use-before-define: 0 */

/*
* Local helper functions
 */
const getLatestValue = function(collection, parmCd) {
    let parmVar = findKey(collection.variables, (varValue) => {
        return varValue.variableCode.value === parmCd;
    });
    let parmTimeSeries = findKey(collection.timeSeries, (ts) => {
        return ts.variable === parmVar;
    });
    let points = parmTimeSeries ? collection.timeSeries[parmTimeSeries].points : [];
    return points.length ? last(points).value : null;
};

/*
 * @param {Object} timeSeries - keys are time series id
 * @param {Object} variables  - keys are the variable id
 */
const getCurrentVariableId = function(timeSeries, variables) {
    const tsVariablesWithData = Object.values(timeSeries)
        .filter((ts) => ts.points.length)
        .map((ts) => variables[ts.variable]);
    const sortedVarsWithData = sortedParameters(tsVariablesWithData);
    if (sortedVarsWithData.length) {
        return sortedVarsWithData[0].oid;
    } else {
        const sortedVars = sortedParameters(Object.values(variables));
        return sortedVars.length ? sortedVars[0].oid : '';
    }
};

/*
 * Actions for ivTimeSeriesDataReducer
 */
/*
 * Synchronous Redux action to add a collection of time series to the Redux store
 * The collection will be merged into the existing collection of time series
 * @param {Object} normalized data returned from a call to retrieve IV data.
 * @return {Object} - Redux action
 */
const addIVTimeSeriesCollection = function(collection) {
    return {
        type: 'ADD_IV_TIME_SERIES_COLLECTION',
        collection
    };
};

/*
 * Synchronous Redux action - removes the time series data from the Redux store for
 * the specific IV time series (may be more than one) represented by the tsRequestKey
 * @param {String} tsRequestKey
 * @Return {Object} - Redux action
 */
const resetIVTimeSeries = function(tsRequestKey) {
    return {
        type: 'RESET_IV_TIME_SERIES',
        tsRequestKey
    };
};

/*
 * Asynchronous Redux action - fetches the IV time series data for all parameter codes for siteno for the
 * last 7 days.
 * @param {String} siteno
 * @return {Function} which when dispatched returns a Promise
 */
const retrieveIVTimeSeries = function(siteno) {
    return function(dispatch, getState) {
        const currentState = getState();
        const tsRequestKey = getTsRequestKey('current', 'P7D')(currentState);
        dispatch(ivTimeSeriesStateActions.addIVTimeSeriesToLoadingKeys([tsRequestKey]));
        return getTimeSeries({sites: [siteno]}).then(
            series => {
                const collection = normalize(series, tsRequestKey);
                // Get the start/end times of this request's range.
                const notes = collection.queryInfo[tsRequestKey].notes;
                const endTime = notes.requestDT;
                const startTime = calcStartTime('P7D', endTime, 'local');
                convertCelsiusCollectionsToFahrenheitAndMerge(collection);

                // Trigger a call to get last year's data
                dispatch(Actions.retrieveCompareIVTimeSeries(siteno, 'P7D', startTime, endTime));

                // Update the series data for the 'current' series
                dispatch(Actions.addIVTimeSeriesCollection(collection));
                dispatch(ivTimeSeriesStateActions.removeIVTimeSeriesFromLoadingKeys([tsRequestKey]));

                // Update the application state
                dispatch(ivTimeSeriesStateActions.setIVTimeSeriesVisibility('current', true));
                const variable = getCurrentVariableId(collection.timeSeries || {}, collection.variables || {});
                dispatch(ivTimeSeriesStateActions.setCurrentIVVariable(variable));
                dispatch(floodInundationActions.setGageHeight(getLatestValue(collection, GAGE_HEIGHT_CD)));
            },
            () => {
                dispatch(Actions.resetIVTimeSeries(tsRequestKey));
                dispatch(ivTimeSeriesStateActions.removeIVTimeSeriesFromLoadingKeys([tsRequestKey]));

                dispatch(ivTimeSeriesStateActions.setIVTimeSeriesVisibility('current', false));
            }
        );
    };
};

/*
 * Asynchronous Redux action - fetches the IV Time series which represents period for site one year after
 * startTime and endTime.
 * @param {String} siteno
 * @param {String} period - ISO 8601 duration
 * @param {Number} startTime - in epoch milliseconds
 * @param {Number} endTime - in epoch milliseconds
 * @return {Function} which when dispatched returns a Promise
 */
const retrieveCompareIVTimeSeries = function(siteno, period, startTime, endTime, parameterCode) {
    return function(dispatch, getState) {
        const tsRequestKey = getTsRequestKey('compare', period)(getState());
        dispatch(ivTimeSeriesStateActions.addIVTimeSeriesToLoadingKeys([tsRequestKey]));
        return getPreviousYearTimeSeries({site: siteno, startTime, endTime, parameterCode}).then(
            series => {
                const collection = normalize(series, tsRequestKey);
                convertCelsiusCollectionsToFahrenheitAndMerge(collection);
                dispatch(Actions.addIVTimeSeriesCollection(collection));
                dispatch(ivTimeSeriesStateActions.removeIVTimeSeriesFromLoadingKeys([tsRequestKey]));
            },
            () => {
                dispatch(Actions.resetIVTimeSeries(tsRequestKey));
                dispatch(ivTimeSeriesStateActions.removeIVTimeSeriesFromLoadingKeys([tsRequestKey]));
            }
        );
    };
};

/*
* Asynchronous Redux Action - fetches the custom time period, period for the siteno and parameterCd
* @param {String} siteno - a USGS code that identifies a monitoring location
* @param {String} parameterCd - a five digit code that references the type of measurement taken at a location
* @param {String} period - ISO 8601 duration - has the form
* of {P for Period of time}{the number of units}{the type of unit such as 'D' for days or 'Y' for years}
* - examples 'P17D' and  'P1Y'
* @return {Function} which returns a promise
 */
const retrieveCustomTimePeriodIVTimeSeries = function(siteno, parameterCd, period) {

    return function(dispatch, getState) {
        const state = getState();
        const tsRequestKey = getTsRequestKey('current', period, parameterCd)(state);
        // We need to resetTimeSeries because the merge function in the addSeriesCollection does not clear out the
        // time series values. This is an issue if the length of the values that we are retrieving are fewer than
        // what is saved.
        const currentTsIds = getTimeSeriesCollectionIds('current', 'period', parameterCd)(state) || [];
        if (currentTsIds.length > 0) {
            dispatch(Actions.resetIVTimeSeries(tsRequestKey));
        }

        const parsedPeriodCodes = parsePeriodCode(period);
        dispatch(ivTimeSeriesStateActions.setUserInputsForSelectingTimespan('mainTimeRangeSelectionButton', parsedPeriodCodes.mainTimeRangeSelectionButton));
        dispatch(ivTimeSeriesStateActions.setCurrentIVDateRange(period));

        if (isPeriodCustom(period)) {
            dispatch(ivTimeSeriesStateActions.setUserInputsForSelectingTimespan('numberOfDaysFieldValue', parsedPeriodCodes.numberOfDaysFieldValue));
        }

        dispatch(ivTimeSeriesStateActions.addIVTimeSeriesToLoadingKeys([tsRequestKey]));

        return getTimeSeries({sites: [siteno], params: [parameterCd], period: period}).then(
            series => {
                const collection = normalize(series, tsRequestKey);
                convertCelsiusCollectionsToFahrenheitAndMerge(collection);
                dispatch(Actions.addIVTimeSeriesCollection(collection));
                dispatch(ivTimeSeriesStateActions.setUserInputsForSelectingTimespan('mainTimeRangeSelectionButton', 'custom'));
                dispatch(ivTimeSeriesStateActions.setUserInputsForSelectingTimespan('customTimeRangeSelectionButton', 'days-input'));
                dispatch(ivTimeSeriesStateActions.removeIVTimeSeriesFromLoadingKeys([tsRequestKey]));
            },
            () => {
                console.log(`Unable to fetch data for period ${period} and parameter code ${parameterCd}`);
                dispatch(Actions.resetIVTimeSeries(tsRequestKey));
                dispatch(ivTimeSeriesStateActions.removeIVTimeSeriesFromLoadingKeys([tsRequestKey]));
            }
        );
    };
};

/*
* Asynchronous Redux action fetches the IV time series for siteno from startTime to endTime for
* the parmCd. If parmCd is null will use the current IV variable.
* @param {String} siteno
* @param {Number} startTime - epoch in milliseconds
* @param {Number} endTime - epoch in milliseconds
* @param {String} parmCd
* @return {Function} which returns a promise
 */
const retrieveCustomIVTimeSeries = function(siteno, startTime, endTime, parmCd=null) {
    return function(dispatch, getState) {
        const state = getState();
        const thisParmCd = parmCd ? parmCd : getCurrentParmCd(state);
        const tsRequestKey = getTsRequestKey('current', 'custom', thisParmCd)(state);
        // We need to resetTimeSeries because the merge function in the addSeriesCollection does not clear out the
        // time series values. This is an issue if the length of the values that we are retrieving are fewer than
        // what is saved.
        const currentTsIds = getTimeSeriesCollectionIds('current', 'custom', parmCd)(state) || [];
        if (currentTsIds.length > 0) {
            dispatch(Actions.resetIVTimeSeries(tsRequestKey));
        }

        dispatch(ivTimeSeriesStateActions.setCustomIVTimeRange(startTime, endTime));
        dispatch(ivTimeSeriesStateActions.addIVTimeSeriesToLoadingKeys([tsRequestKey]));
        dispatch(ivTimeSeriesStateActions.setIVTimeSeriesVisibility('median', false));
        return getTimeSeries({
            sites: [siteno],
            params: [thisParmCd],
            startDate: startTime,
            endDate: endTime
        }).then(
            series => {
                const collection = normalize(series, tsRequestKey);
                convertCelsiusCollectionsToFahrenheitAndMerge(collection);
                dispatch(Actions.addIVTimeSeriesCollection(collection));
                dispatch(ivTimeSeriesStateActions.setCurrentIVDateRange('custom'));
                dispatch(ivTimeSeriesStateActions.setUserInputsForSelectingTimespan('mainTimeRangeSelectionButton', 'custom'));
                dispatch(ivTimeSeriesStateActions.setUserInputsForSelectingTimespan('customTimeRangeSelectionButton', 'calendar-input'));
                dispatch(ivTimeSeriesStateActions.removeIVTimeSeriesFromLoadingKeys([tsRequestKey]));
            },
            () => {
                console.log(`Unable to fetch data for between ${startTime} and ${endTime} and parameter code ${thisParmCd}`);
                dispatch(Actions.addIVTimeSeriesCollection({}));
                dispatch(ivTimeSeriesStateActions.removeIVTimeSeriesFromLoadingKeys([tsRequestKey]));
            }
        );
    };
};

/*
* Asynchronous Redux function which fetches the IV time series for siteno for the period and paramC.
* If paramCd, the current parameter code is retrieved from the state and used. Before
* trying to fetch the data, the store is checked to see if it's already been retrieved. If so
* the promise is immediately resolved. This function is not used for custom time periods but
* rather one of the standard time periods.
* @param {String} siteno
* @param {String} period - ISO 8601 duration
* @param {String} paramCd
* @return {Function} which returns a promise.
 */
const retrieveExtendedIVTimeSeries = function(siteno, period, paramCd=null) {
    return function(dispatch, getState) {
        const state = getState();
        const thisParamCd = paramCd ? paramCd : getCurrentParmCd(state);
        const tsRequestKey = getTsRequestKey ('current', period, thisParamCd)(state);

        const parsedPeriodCodes = parsePeriodCode(period);
        dispatch(ivTimeSeriesStateActions.setUserInputsForSelectingTimespan('mainTimeRangeSelectionButton', parsedPeriodCodes.mainTimeRangeSelectionButton));
        dispatch(ivTimeSeriesStateActions.setCurrentIVDateRange(period));

        isPeriodCustom(period) ?
            dispatch(ivTimeSeriesStateActions.setUserInputsForSelectingTimespan('numberOfDaysFieldValue', parsedPeriodCodes.numberOfDaysFieldValue)) :
            null;


        if (!hasTimeSeries('current', period, thisParamCd)(state)) {
            dispatch(ivTimeSeriesStateActions.addIVTimeSeriesToLoadingKeys([tsRequestKey]));
            const endTime = getRequestTimeRange('current', 'P7D')(state).end;
            const startTime = calcStartTime(period, endTime);
            return getTimeSeries({
                sites: [siteno],
                params: [thisParamCd],
                startDate: startTime,
                endDate: endTime
            }).then(
                series => {
                    const collection = normalize(series, tsRequestKey);
                    convertCelsiusCollectionsToFahrenheitAndMerge(collection);
                    dispatch(Actions.retrieveCompareIVTimeSeries(siteno, period, startTime, endTime, thisParamCd));
                    dispatch(Actions.addIVTimeSeriesCollection(collection));
                    dispatch(ivTimeSeriesStateActions.removeIVTimeSeriesFromLoadingKeys([tsRequestKey]));
                },
                () => {
                    console.log(`Unable to fetch data for period ${period} and parameter code ${thisParamCd}`);
                    dispatch(Actions.addIVTimeSeriesCollection({}));
                    dispatch(ivTimeSeriesStateActions.removeIVTimeSeriesFromLoadingKeys([tsRequestKey]));
                }
            );
        } else {
            return Promise.resolve({});
        }
    };
};

/*
 * Asynchronous Redux Action which retrieves data for a custom time range
 * @param {String} siteno
 * @param {String} startDateStr - ISO date string
 * @param {String} endDateStr - ISO date String
 * @param {String} paramCd
 * @return {Function} which returns a promise when the data has been fetched
 */
const retrieveUserRequestedIVDataForDateRange = function(siteno, startDateStr, endDateStr, parmCd=null) {
    return function(dispatch, getState) {
        const state = getState();
        const locationIanaTimeZone = getIanaTimeZone(state);
        const startTime = DateTime.fromISO(startDateStr,{zone: locationIanaTimeZone}).toMillis();
        const endTime = DateTime.fromISO(endDateStr, {zone: locationIanaTimeZone}).endOf('day').toMillis();
        return dispatch(Actions.retrieveCustomIVTimeSeries(siteno, startTime, endTime, parmCd));
    };
};

/*
* Asynchronous Redux Action which sets the current variable id and fetches the custom
* time series for that variable or the extended time series depending on the current date range kind.
* @param {String} siteno
* @param {String} variableID
* @return {Function} when returns a promise.
 */
const updateIVCurrentVariableAndRetrieveTimeSeries = function(siteno, variableID) {

    return function(dispatch, getState) {
        dispatch(ivTimeSeriesStateActions.setCurrentIVVariable(variableID));
        const state = getState();
        const currentDateRange = getCurrentDateRange(state);

        if (currentDateRange === 'custom') {
            const timeRange = getCustomTimeRange(state);
            return dispatch(
                Actions.retrieveCustomIVTimeSeries(siteno, timeRange.start, timeRange.end));
        } else {
            return dispatch(Actions.retrieveExtendedIVTimeSeries(siteno, currentDateRange));
        }
    };
};

export const ivTimeSeriesDataReducer = function(ivTimeSeriesData={}, action) {
    switch(action.type) {
        case 'ADD_IV_TIME_SERIES_COLLECTION':
            return merge({}, ivTimeSeriesData, action.collection);

        case 'RESET_IV_TIME_SERIES': {
            let newSeries = {
                ...ivTimeSeriesData,
                timeSeries: omitBy(ivTimeSeriesData.timeSeries, (tsValue) => tsValue.tsKey === action.tsRequestKey),
                requests: {
                    ...(ivTimeSeriesData || {}).requests
                }
            };
            newSeries.requests[action.tsRequestKey] = {};

            return newSeries;
        }

        default:
            return ivTimeSeriesData;
    }
};

export const Actions = {
    addIVTimeSeriesCollection,
    resetIVTimeSeries,
    retrieveCompareIVTimeSeries,
    retrieveIVTimeSeries,
    retrieveCustomTimePeriodIVTimeSeries,
    retrieveCustomIVTimeSeries,
    retrieveExtendedIVTimeSeries,
    retrieveUserRequestedIVDataForDateRange,
    updateIVCurrentVariableAndRetrieveTimeSeries
};
