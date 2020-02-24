
import find from 'lodash/find';
import findKey from 'lodash/findKey';
import last from 'lodash/last';
import {DateTime} from 'luxon';
import {applyMiddleware, createStore, combineReducers, compose} from 'redux';
import {default as thunk} from 'redux-thunk';

import {normalize} from '../schema';
import {calcStartTime, sortedParameters} from '../utils';

import {getCurrentParmCd, getCurrentDateRange, hasTimeSeries, getTsRequestKey, getRequestTimeRange,
    getCustomTimeRange, getIanaTimeZone} from '../selectors/time-series-selector';

import {fetchFloodFeatures, fetchFloodExtent} from '../web-services/flood-data';
import {getPreviousYearTimeSeries, getTimeSeries, queryWeatherService} from '../web-services/models';
import {fetchNldiUpstreamSites, fetchNldiDownstreamSites, fetchNldiDownstreamFlow, fetchNldiUpstreamFlow} from '../web-services/nldi-data';
import {fetchTimeSeries} from '../web-services/observations';
import {fetchSiteStatistics} from '../web-services/statistics-data';

import {floodDataReducer as floodData} from './flood-data-reducer';
import {floodStateReducer as floodState} from './flood-state-reducer';
import {nldiDataReducer as nldiData} from './nldi-data-reducer';
import {observationsDataReducer as observationsData} from './observations-data-reducer';
import {observationsStateReducer as observationsState} from './observations-state-reducer';
import {seriesReducer as series} from './series-reducer';
import {statisticsDataReducer as statisticsData} from './statistics-data-reducer';
import {timeSeriesStateReducer as timeSeriesState} from './time-series-state-reducer';
import {uiReducer as ui} from './ui-reducer';

const GAGE_HEIGHT_CD = '00065';
/*
 * Helper functions
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


export const Actions = {
    retrieveLocationTimeZone(latitude, longitude) {
        return function(dispatch) {
            return queryWeatherService(latitude, longitude).then(
                resp => {
                    const tzIANA = resp.properties.timeZone || null; // set to time zone to null if unavailable
                    dispatch(Actions.setLocationIanaTimeZone(tzIANA));
                },
                () => {
                    dispatch(Actions.setLocationIanaTimeZone(null));
                }
            );
        };
    },
    retrieveTimeSeries(siteno, params=null) {
        return function (dispatch, getState) {
            const currentState = getState();
            const requestKey = getTsRequestKey('current', 'P7D')(currentState);
            dispatch(Actions.addTimeSeriesLoading([requestKey]));

            return getTimeSeries({sites: [siteno], params}).then(
                series => {
                    const collection = normalize(series, requestKey);

                    // Get the start/end times of this request's range.
                    const notes = collection.queryInfo[requestKey].notes;
                    const endTime = notes.requestDT;
                    const startTime = calcStartTime('P7D', endTime, 'local');

                    // Trigger a call to get last year's data
                    dispatch(Actions.retrieveCompareTimeSeries(siteno, 'P7D', startTime, endTime));

                    // Update the series data for the 'current' series
                    dispatch(Actions.addSeriesCollection('current', collection));
                    dispatch(Actions.removeTimeSeriesLoading([requestKey]));

                    // Update the application state
                    dispatch(Actions.toggleTimeSeries('current', true));
                    const variable = getCurrentVariableId(collection.timeSeries || {}, collection.variables || {});
                    dispatch(Actions.setCurrentVariable(variable));
                    dispatch(Actions.setGageHeight(getLatestValue(collection, GAGE_HEIGHT_CD)));
                },
                () => {
                    dispatch(Actions.resetTimeSeries(getTsRequestKey('current', 'P7D')(currentState)));
                    dispatch(Actions.removeTimeSeriesLoading([requestKey]));

                    dispatch(Actions.toggleTimeSeries('current', false));
                }
            );
        };
    },
    retrieveCompareTimeSeries(site, period, startTime, endTime) {
        return function (dispatch, getState) {
            const requestKey = getTsRequestKey('compare', period)(getState());
            dispatch(Actions.addTimeSeriesLoading([requestKey]));
            return getPreviousYearTimeSeries({site, startTime, endTime}).then(
                series => {
                    const collection = normalize(series, requestKey);
                    dispatch(Actions.addSeriesCollection(requestKey, collection));
                    dispatch(Actions.removeTimeSeriesLoading([requestKey]));
                },
                () => {
                    dispatch(Actions.resetTimeSeries(getTsRequestKey('compare', period)(getState())));
                    dispatch(Actions.removeTimeSeriesLoading([requestKey]));
                }
            );
        };
    },
    retrieveMedianStatistics(site) {
        return function(dispatch) {
            return fetchSiteStatistics({site, statType: 'median'}).then(
                stats => {
                    dispatch(Actions.addMedianStats(stats));
                }
            );
        };
    },

    retrieveCustomTimePeriodTimeSeries(site, parameterCd, period) {
        return function(dispatch, getState) {
            const state = getState();
            const parmCd = parameterCd;
            const requestKey = getTsRequestKey('current', 'custom', parmCd)(state);
            dispatch(Actions.setCurrentDateRange('custom'));
            dispatch(Actions.addTimeSeriesLoading([requestKey]));
            return getTimeSeries({sites: [site], params: [parmCd], period: period}).then(
                series => {
                    const collection = normalize(series, requestKey);
                    const variables = Object.values(collection.variables);
                    const variableToDraw = find(variables, v =>  v.variableCode.value === parameterCd);
                    dispatch(Actions.setCurrentVariable(variableToDraw.variableCode.variableID));
                    dispatch(Actions.addSeriesCollection(requestKey, collection));
                    dispatch(Actions.removeTimeSeriesLoading([requestKey]));
                },
                () => {
                    console.log(`Unable to fetch data for period ${period} and parameter code ${parmCd}`);
                    dispatch(Actions.addSeriesCollection(requestKey, {}));
                    dispatch(Actions.removeTimeSeriesLoading([requestKey]));
                }
            );
        };
    },

    retrieveCustomTimeSeries(site, startTime, endTime, parmCd) {
        return function(dispatch, getState) {
            const state = getState();
            const thisParmCd = parmCd ? parmCd : getCurrentParmCd(state);
            const requestKey = getTsRequestKey('current', 'custom', thisParmCd)(state);

            dispatch(Actions.setCustomDateRange(startTime, endTime));
            dispatch(Actions.addTimeSeriesLoading([requestKey]));
            dispatch(Actions.toggleTimeSeries('median', false));
            return getTimeSeries({
                sites: [site],
                params: [thisParmCd],
                startDate: startTime,
                endDate: endTime
            }).then(
                series => {
                    const collection = normalize(series, requestKey);
                    dispatch(Actions.addSeriesCollection(requestKey, collection));
                    dispatch(Actions.removeTimeSeriesLoading([requestKey]));
                },
                () => {
                    console.log(`Unable to fetch data for between ${startTime} and ${endTime} and parameter code ${thisParmCd}`);
                    dispatch(Actions.addSeriesCollection(requestKey, {}));
                    dispatch(Actions.removeTimeSeriesLoading([requestKey]));
                }
            );
        };
    },
    retrieveExtendedTimeSeries(site, period, paramCd=null) {
        return function(dispatch, getState) {
            const state = getState();
            const thisParamCd = paramCd ? paramCd : getCurrentParmCd(state);
            const requestKey = getTsRequestKey ('current', period, thisParamCd)(state);
            dispatch(Actions.setCurrentDateRange(period));
            if (!hasTimeSeries('current', period, thisParamCd)(state)) {
                dispatch(Actions.addTimeSeriesLoading([requestKey]));
                const endTime = getRequestTimeRange('current', 'P7D')(state).end;
                const startTime = calcStartTime(period, endTime);
                return getTimeSeries({
                    sites: [site],
                    params: [thisParamCd],
                    startDate: startTime,
                    endDate: endTime
                }).then(
                    series => {
                        const collection = normalize(series, requestKey);
                        dispatch(Actions.retrieveCompareTimeSeries(site, period, startTime, endTime));
                        dispatch(Actions.addSeriesCollection(requestKey, collection));
                        dispatch(Actions.removeTimeSeriesLoading([requestKey]));
                    },
                    () => {
                        console.log(`Unable to fetch data for period ${period} and parameter code ${thisParamCd}`);
                        dispatch(Actions.addSeriesCollection(requestKey, {}));
                        dispatch(Actions.removeTimeSeriesLoading([requestKey]));
                    }
                );
            } else {
                return Promise.resolve({});
            }
        };
    },
    retrieveDailyValueData(monitoringLocationId, timeSeriesId) {
        return function(dispatch) {
            return fetchTimeSeries(monitoringLocationId, timeSeriesId)
                .then(
                    (data) => {
                        dispatch(Actions.setObservationsTimeSeries(timeSeriesId, data));
                    },
                    () => {
                        console.log(`Unable to fetch observations time series for ${timeSeriesId}`);
                    });
        };
    },
    retrieveFloodData(siteno) {
        return function (dispatch) {
            const floodFeatures = fetchFloodFeatures(siteno);
            const floodExtent = fetchFloodExtent(siteno);
            return Promise.all([floodFeatures, floodExtent]).then((data) => {
                const [features, extent] = data;
                const stages = features.map((feature) => feature.attributes.STAGE).sort(function (a, b) {
                    return a - b;
                });
                dispatch(Actions.setFloodFeatures(stages, stages.length ? extent.extent : {}));
            });
        };
    },
    retrieveNldiData(siteno) {
        return function (dispatch) {
            const upstreamFlow = fetchNldiUpstreamFlow(siteno);
            const downstreamFlow = fetchNldiDownstreamFlow(siteno);
            const upstreamSites = fetchNldiUpstreamSites(siteno);
            const downstreamSites = fetchNldiDownstreamSites(siteno);

            return Promise.all([
                upstreamFlow, downstreamFlow, upstreamSites, downstreamSites
            ]).then(function(data) {
               const [upStreamLines, downStreamLines, upStreamPoints, downStreamPoints] = data;
               dispatch(Actions.setNldiFeatures(upStreamLines, downStreamLines, upStreamPoints, downStreamPoints));
            });
        };
    },
    updateCurrentVariable(siteno, variableID) {
        return function(dispatch, getState) {
            dispatch(Actions.setCurrentVariable(variableID));
            const state = getState();
            const currentDateRange = getCurrentDateRange(state);
            if (currentDateRange === 'custom') {
                const timeRange = getCustomTimeRange(state);
                dispatch(
                    Actions.retrieveCustomTimeSeries(siteno, timeRange.startDT, timeRange.endDT));
            } else {
                dispatch(Actions.retrieveExtendedTimeSeries(siteno, currentDateRange));
            }
        };
    },
    startTimeSeriesPlay(maxCursorOffset) {
        return function (dispatch, getState) {
            let state = getState().timeSeriesState;
            if (state.cursorOffset == null || state.cursorOffset >= maxCursorOffset) {
                dispatch(Actions.setCursorOffset(0));
            }
            if (!state.audiblePlayId) {
                let play = function () {
                    let newOffset = getState().timeSeriesState.cursorOffset + 15 * 60 * 1000;
                    if (newOffset > maxCursorOffset) {
                        dispatch(Actions.stopTimeSeriesPlay());
                    } else {
                        dispatch(Actions.setCursorOffset(newOffset));
                    }
                };
                let playId = window.setInterval(play, 10);
                dispatch(Actions.timeSeriesPlayOn(playId));
            }
        };
    },
    stopTimeSeriesPlay() {
        return function(dispatch, getState) {
            window.clearInterval(getState().timeSeriesState.audiblePlayId);
            dispatch(Actions.timeSeriesPlayStop());
        };
    },
    timeSeriesPlayOn(playId) {
        return {
            type: 'TIME_SERIES_PLAY_ON',
            playId
        };
    },
    timeSeriesPlayStop() {
        return {
            type: 'TIME_SERIES_PLAY_STOP'
        };
    },
    addTimeSeriesLoading(tsKeys) {
        return {
            type: 'TIME_SERIES_LOADING_ADD',
            tsKeys
        };
    },
    removeTimeSeriesLoading(tsKeys) {
        return {
            type: 'TIME_SERIES_LOADING_REMOVE',
            tsKeys
        };
    },
    setFloodFeatures(stages, extent) {
        return {
            type: 'SET_FLOOD_FEATURES',
            stages,
            extent
        };
    },
    setNldiFeatures(upstreamFlows, downstreamFlows, upstreamSites, downstreamSites) {
        return {
            type: 'SET_NLDI_FEATURES',
            upstreamFlows,
            downstreamFlows,
            upstreamSites,
            downstreamSites
        };
    },
    setObservationsTimeSeries(timeSeriesId, data) {
        return {
            type: 'SET_OBSERVATIONS_TIME_SERIES',
            timeSeriesId,
            data
        };
    },
    toggleTimeSeries(key, show) {
        return {
            type: 'TOGGLE_TIME_SERIES',
            key,
            show
        };
    },
    addSeriesCollection(key, data) {
        return {
            type: 'ADD_TIME_SERIES_COLLECTION',
            key,
            data
        };
    },
    resetTimeSeries(key) {
        return {
            type: 'RESET_TIME_SERIES',
            key
        };
    },
    addMedianStats(data) {
        return {
            type: 'MEDIAN_STATS_ADD',
            data
        };
    },
    setCursorOffset(cursorOffset) {
        return {
            type: 'SET_CURSOR_OFFSET',
            cursorOffset
        };
    },
    resizeUI(windowWidth, width) {
        return {
            type: 'RESIZE_UI',
            windowWidth,
            width
        };
    },
    setHydrographXRange(hydrographXRange) {
        return {
            type: 'SET_HYDROGRAPH_X_RANGE',
            hydrographXRange
        };
    },
    clearHydrographXRange() {
        return {
            type: 'CLEAR_HYDROGRAPH_X_RANGE'
        };
    },
    setCurrentVariable(variableID) {
        return {
            type: 'SET_CURRENT_VARIABLE',
            variableID
        };
    },
    setCurrentMethodID(methodID) {
        return {
            type: 'SET_CURRENT_METHOD_ID',
            methodID
        };
    },
    setCurrentDateRange(period) {
        return {
            type: 'SET_CURRENT_DATE_RANGE',
            period
        };
    },
    setCustomDateRange(startTime, endTime) {
        return {
            type: 'SET_CUSTOM_DATE_RANGE',
            startTime,
            endTime
        };
    },
    retrieveUserRequestedDataForDateRange(siteno, startTimeStr, endTimeStr) {
        return function(dispatch, getState) {
            const state = getState();
            const locationIanaTimeZone = getIanaTimeZone(state);
            const startTime = new DateTime.fromISO(startTimeStr,{zone: locationIanaTimeZone}).toMillis();
            const endTime = new DateTime.fromISO(endTimeStr, {zone: locationIanaTimeZone}).toMillis();
            return dispatch(Actions.retrieveCustomTimeSeries(siteno, startTime, endTime));
        };
    },
    retrieveDataForDateRange(siteno, startTimeStr, endTimeStr, parmCd) {
        return function(dispatch, getState) {
            const state = getState();
            const locationIanaTimeZone = getIanaTimeZone(state);
            const startTime = new DateTime.fromISO(startTimeStr,{zone: locationIanaTimeZone}).toMillis();
            const endTime = new DateTime.fromISO(endTimeStr, {zone: locationIanaTimeZone}).toMillis();

            dispatch(Actions.retrieveCustomTimeSeries(siteno, startTime, endTime, parmCd));
        };
    },
    setGageHeightFromStageIndex(index) {
        return function(dispatch, getState) {
            const stages = getState().floodData.stages;
            if (index > -1 && index < stages.length) {
                dispatch(Actions.setGageHeight(stages[index]));
            }
        };
    },
    setGageHeight(gageHeight) {
        return {
            type: 'SET_GAGE_HEIGHT',
            gageHeight
        };
    },
    setLocationIanaTimeZone(ianaTimeZone) {
        return {
            type: 'LOCATION_IANA_TIME_ZONE_SET',
            ianaTimeZone
        };
    },
    setCurrentObservationsTimeSeriesId(timeSeriesId) {
        return {
            type: 'SET_CURRENT_TIME_SERIES_ID',
            timeSeriesId
        };
    }
};

const appReducer = combineReducers({
    series,
    observationsData,
    statisticsData,
    floodData,
    nldiData,
    timeSeriesState,
    observationsState,
    floodState,
    ui
});

const MIDDLEWARES = [thunk];


export const configureStore = function (initialState) {
    initialState = {
        series: {},
        observationsData: {},
        floodData: {
            stages: [],
            extent: {}
        },
        nldiData: {
            upstreamFlows: [],
            downstreamFlows: [],
            upstreamSites: [],
            downstreamSites: []
        },

        statisticsData: {},

        timeSeriesState: {
            showSeries: {
                current: true,
                compare: false,
                median: false
            },
            currentDateRange: 'P7D',
            customTimeRange: null,
            currentVariableID: null,
            cursorOffset: null,
            audiblePlayId: null,
            loadingTSKeys: []
        },
        observationsState: {},
        floodState: {
            gageHeight: null
        },
        ui : {
            windowWidth: 1024,
            width: 800,
            hydrographXRange: {}
        },
        ...initialState
    };

    let enhancers;
    if (window.__REDUX_DEVTOOLS_EXTENSION__) {
        enhancers = compose(
            applyMiddleware(...MIDDLEWARES),
            window.__REDUX_DEVTOOLS_EXTENSION__({serialize: true})
        );
    } else {
        enhancers = applyMiddleware(...MIDDLEWARES);
    }

    return createStore(
        appReducer,
        initialState,
        enhancers
    );
};
