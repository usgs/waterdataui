
const findKey = require('lodash/findKey');
const last = require('lodash/last');
const { applyMiddleware, createStore, combineReducers, compose } = require('redux');
const { default: thunk } = require('redux-thunk');

const { getPreviousYearTimeSeries, getTimeSeries, sortedParameters, queryWeatherService } = require('../models');
const { calcStartTime } = require('../utils');
const { normalize } = require('../schema');
const { fetchFloodFeatures, fetchFloodExtent } = require('../floodData');
const { fetchSiteStatistics } = require('../statisticsData');
const { getCurrentParmCd, getCurrentDateRange, hasTimeSeries, getTsRequestKey, getRequestTimeRange
    } = require('../selectors/timeSeriesSelector');

const { floodDataReducer: floodData } = require('./floodDataReducer');
const { floodStateReducer: floodState } = require('./floodStateReducer');
const { seriesReducer: series } = require('./seriesReducer');
const { statisticsDataReducer: statisticsData } = require('./statisticsDataReducer');
const { metadataReducer: metadata } = require('./metadataReducer');
const { timeSeriesStateReducer: timeSeriesState } = require('./timeSeriesStateReducer');
const { uiReducer: ui } = require('./uiReducer');

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
    const tsVariables = Object.values(timeSeries)
        .filter((ts) => ts.points.length)
        .map((ts) => variables[ts.variable]);
    const sortedVars = sortedParameters(tsVariables);
    return sortedVars.length ? sortedVars[0].oid : '';
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
                    dispatch(Actions.setCurrentVariable(
                        getCurrentVariableId(collection.timeSeries || {}, collection.variables || {})
                    ));
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
                    dispatch(Actions.toggleTimeSeries('median', true));
                }
            );
        };
    },
    retrieveExtendedTimeSeries(site, period) {
        return function(dispatch, getState) {
            const state = getState();
            const parmCd = getCurrentParmCd(state);
            const requestKey = getTsRequestKey ('current', period, parmCd)(state);
            dispatch(Actions.setCurrentDateRange(period));
            if (!hasTimeSeries('current', period, parmCd)(state)) {
                const endTime = getRequestTimeRange('current', 'P7D')(state).end;
                let startTime = calcStartTime(period, endTime);
                dispatch(Actions.addTimeSeriesLoading([requestKey]));
                return getTimeSeries({
                    sites: [site],
                    params: [parmCd],
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
                        console.log(`Unable to fetch data for period ${period} and parameter code ${parmCd}`);
                        dispatch(Actions.addSeriesCollection(requestKey, {}));
                        dispatch(Actions.removeTimeSeriesLoading([requestKey]));
                    }
                );
            }
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
    updateCurrentVariable(siteno, variableID) {
        return function(dispatch, getState) {
            dispatch(Actions.setCurrentVariable(variableID));
            dispatch(Actions.retrieveExtendedTimeSeries(siteno, getCurrentDateRange(getState())));
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
    setCurrentVariable(variableID) {
        return {
            type: 'SET_CURRENT_VARIABLE',
            variableID
        };
    },
    setCurrentDateRange(period) {
        return {
            type: 'SET_CURRENT_DATE_RANGE',
            period
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
    setMonitoringLocationIdentifier(identifier) {
        return {
            type: 'MONITORING_LOCATION_IDENTIFIER_SET',
            identifier
        };
    }
};

const appReducer = combineReducers({
    series,
    statisticsData,
    metadata,
    floodData,
    timeSeriesState,
    floodState,
    ui
});

const MIDDLEWARES = [thunk];


export const configureStore = function (initialState) {
    initialState = {
        metadata: {},
        series: {},
        floodData: {
            stages: [],
            extent: {}
        },

        statisticsData: {},

        timeSeriesState: {
            showSeries: {
                current: true,
                compare: false,
                median: false
            },
            currentDateRange: 'P7D',
            currentVariableID: null,
            cursorOffset: null,
            audiblePlayId: null,
            loadingTSKeys: []
        },
        floodState: {
            gageHeight: null
        },
        ui : {
            windowWidth: 1024,
            width: 800
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
