
const findKey = require('lodash/findKey');
const last = require('lodash/last');
const { applyMiddleware, createStore, combineReducers, compose } = require('redux');
const { default: thunk } = require('redux-thunk');

const { getMedianStatistics, getPreviousYearTimeSeries, getTimeSeries,
    parseMedianData, sortedParameters } = require('../models');
const { calcStartTime } = require('../utils');
const { normalize } = require('../schema');
const { fetchFloodFeatures, fetchFloodExtent } = require('../floodData');
const { getCurrentParmCd, getCurrentDateRange, hasTimeSeries, getTsRequestKey, getRequestTimeRange } = require('../selectors/timeSeriesSelector');

const { floodDataReducer: floodData } = require('./floodDataReducer');
const { floodStateReducer: floodState } = require('./floodStateReducer');
const { seriesReducer: series } = require('./seriesReducer');
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
    retrieveTimeSeries(siteno, params=null) {
        return function (dispatch, getState) {
            const currentState = getState();
            const timeSeries = getTimeSeries({sites: [siteno], params}).then(
                series => {
                    const requestKey = getTsRequestKey('current', 'P7D')(currentState);
                    const collection = normalize(series, requestKey);

                    // Get the start/end times of this request's range.
                    const notes = collection.queryInfo[requestKey].notes;
                    const endTime = notes.requestDT;
                    const startTime = new Date(endTime);
                    startTime.setDate(endTime.getDate() - notes['filter:timeRange'].periodDays);

                    // Trigger a call to get last year's data
                    dispatch(Actions.retrieveCompareTimeSeries(siteno, 'P7D', startTime, endTime));

                    // Update the series data for the 'current' series
                    dispatch(Actions.addSeriesCollection('current', collection));

                    // Update the application state
                    dispatch(Actions.toggleTimeSeries('current', true));
                    dispatch(Actions.setCurrentVariable(
                        getCurrentVariableId(collection.timeSeries || {}, collection.variables || {})
                    ));
                    dispatch(Actions.setGageHeight(getLatestValue(collection, GAGE_HEIGHT_CD)));

                    return {collection, startTime, endTime};
                },
                () => {
                    dispatch(Actions.resetTimeSeries(getTsRequestKey('current', 'P7D')(currentState)));
                    dispatch(Actions.toggleTimeSeries('current', false));
                    return {
                        collection: null,
                        startTime: null,
                        endTime: null
                    };
                }
            );
            const medianStatistics = getMedianStatistics({sites: [siteno]});
            return Promise.all([timeSeries, medianStatistics]).then(([{collection, endTime}, stats]) => {
                if (endTime) {
                    let medianCollection = parseMedianData(stats, endTime, collection && collection.variables ? collection.variables : {});
                    dispatch(Actions.addSeriesCollection(getTsRequestKey('median')(currentState), medianCollection));
                    dispatch(Actions.toggleTimeSeries('median', true));
                }
            });
        };
    },
    retrieveCompareTimeSeries(site, period, startTime, endTime) {
        return function (dispatch, getState) {
            return getPreviousYearTimeSeries({site, startTime, endTime}).then(
                series => {
                    const requestKey = getTsRequestKey('compare', period)(getState());
                    const collection = normalize(series, requestKey);
                    dispatch(Actions.addSeriesCollection(requestKey, collection));
                },
                () => dispatch(Actions.resetTimeSeries(getTsRequestKey('compare', period)(getState())))
            );
        };
    },
    retrieveExtendedTimeSeries(site, period) {
        return function(dispatch, getState) {
            const state = getState();
            const parmCd = getCurrentParmCd(state);
            const requestKey = getTsRequestKey ('current', period, parmCd)(state);
            if (!hasTimeSeries('current', period, parmCd)(state)) {
                const endTime = new Date(getRequestTimeRange('current', 'P7D')(state).end);
                let startTime = calcStartTime(period, endTime);

                return getTimeSeries({
                    sites: [site],
                    params: [parmCd],
                    startDate: startTime,
                    endDate: endTime
                }).then(
                    series => {
                        const collection = normalize(series, requestKey);
                        dispatch(Actions.addSeriesCollection(requestKey, collection));
                        dispatch(Actions.retrieveCompareTimeSeries(site, period, startTime, endTime));
                    },
                    () => {
                        console.log(`Unable to fetch data for period ${period} and parameter code ${parmCd}`);
                        dispatch(Actions.addSeriesCollection(requestKey, {}));
                    }
                ).then(() => {
                    dispatch(Actions.setCurrentDateRange(period));
                });
            } else {
                dispatch(Actions.setCurrentDateRange(period));
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
            type: 'TIMESERIES_PLAY_ON',
            playId
        };
    },
    timeSeriesPlayStop() {
        return {
            type: 'TIMESERIES_PLAY_STOP'
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
            type: 'TOGGLE_TIMESERIES',
            key,
            show
        };
    },
    addSeriesCollection(key, data) {
        return {
            type: 'ADD_TIMESERIES_COLLECTION',
            key,
            data
        };
    },
    resetTimeSeries(key) {
        return {
            type: 'RESET_TIMESERIES',
            key
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
    }
};

const appReducer = combineReducers({
    series,
    floodData,
    timeSeriesState,
    floodState,
    ui
});

const MIDDLEWARES = [thunk];


export const configureStore = function (initialState) {
    initialState = {
        series: {},
        floodData: {
            stages: [],
            extent: {}
        },

        timeSeriesState: {
            showSeries: {
                current: true,
                compare: false,
                median: false
            },
            currentDateRange: 'P7D',
            currentVariableID: null,
            cursorOffset: null,
            audiblePlayId: null
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
