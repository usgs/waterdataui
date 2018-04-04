const merge = require('lodash/merge');
const findKey = require('lodash/findKey');
const last = require('lodash/last');
const { applyMiddleware, createStore, compose } = require('redux');
const { default: thunk } = require('redux-thunk');

const { getMedianStatistics, getPreviousYearTimeseries, getTimeseries,
    parseMedianData, sortedParameters } = require('./models');
const { normalize } = require('./schema');
const { fetchFloodFeatures, fetchFloodExtent } = require('./floodData');

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

const GAGE_HEIGHT_CD = '00065';

export const Actions = {
    retrieveTimeseries(siteno, params=null) {
        return function (dispatch) {
            const timeSeries = getTimeseries({sites: [siteno], params}).then(
                series => {
                    const collection = normalize(series, 'current');
                    dispatch(Actions.addSeriesCollection('current', collection));

                    // Get the start/end times of this request's range.
                    const notes = collection.queryInfo['current'].notes;
                    const endTime = notes.requestDT;
                    const startTime = new Date(endTime);
                    startTime.setDate(endTime.getDate() - notes['filter:timeRange'].periodDays);

                    // Trigger a call to get last year's data
                    dispatch(Actions.retrieveCompareTimeseries(siteno, startTime, endTime));

                    // Update the gage height if gage height is in the data.
                    const currentGageHeight = getLatestValue(collection, GAGE_HEIGHT_CD);
                    if (currentGageHeight) {
                        dispatch(Actions.setGageHeight(currentGageHeight));
                    }

                    return {collection, startTime, endTime};
                },
                () => {
                    dispatch(Actions.resetTimeseries('current'));
                    return {
                        collection: null,
                        startTime: null,
                        endTime: null
                    };
                }
            );
            const medianStatistics = getMedianStatistics({sites: [siteno]});
            return Promise.all([timeSeries, medianStatistics]).then(([{collection, startTime, endTime}, stats]) => {
                let medianCollection = parseMedianData(stats, startTime, endTime, collection && collection.variables ? collection.variables : {});
                dispatch(Actions.addSeriesCollection('median', medianCollection));
            });
        };
    },
    retrieveCompareTimeseries(site, startTime, endTime) {
        return function (dispatch) {
            return getPreviousYearTimeseries({site, startTime, endTime}).then(
                series => {
                    const collection = normalize(series, 'compare');
                    dispatch(Actions.addSeriesCollection('compare', collection, false));
                },
                () => dispatch(Actions.resetTimeseries('compare'))
            );
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
    startTimeseriesPlay(maxCursorOffset) {
        return function (dispatch, getState) {
            let state = getState();
            if (state.cursorOffset == null || state.cursorOffset >= maxCursorOffset) {
                dispatch(Actions.setCursorOffset(0));
            }
            if (!state.playId) {
                let play = function () {
                    let newOffset = getState().cursorOffset + 15 * 60 * 1000;
                    if (newOffset > maxCursorOffset) {
                        dispatch(Actions.stopTimeseriesPlay());
                    } else {
                        dispatch(Actions.setCursorOffset(newOffset));
                    }
                };
                let playId = window.setInterval(play, 10);
                dispatch(Actions.timeseriesPlayOn(playId));
            }
        };
    },
    stopTimeseriesPlay() {
        return function(dispatch, getState) {
            window.clearInterval(getState().playId);
            dispatch(Actions.timeseriesPlayStop());
        };
    },
    timeseriesPlayOn(playId) {
        return {
            type: 'TIMESERIES_PLAY_ON',
            playId
        };
    },
    timeseriesPlayStop() {
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
    toggleTimeseries(key, show) {
        return {
            type: 'TOGGLE_TIMESERIES',
            key,
            show
        };
    },
    addSeriesCollection(key, data, show=true) {
        return {
            type: 'ADD_TIMESERIES_COLLECTION',
            key,
            show,
            data
        };
    },
    resetTimeseries(key) {
        return {
            type: 'RESET_TIMESERIES',
            key
        };
    },
    showMedianStatsLabel(show) {
        return {
            type: 'SHOW_MEDIAN_STATS_LABEL',
            show
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
    setCurrentParameterCode(parameterCode, variableID) {
        return {
            type: 'PARAMETER_CODE_SET',
            parameterCode,
            variableID
        };
    },
    setGageHeightIndex(gageHeightIndex) {
        return {
            type: 'SET_GAGE_HEIGHT_INDEX',
            gageHeightIndex
        };
    },
    setGageHeight(gageHeight) {
        return {
            type: 'SET_GAGE_HEIGHT',
            gageHeight
        };
    }
};

const getGageHeight = function(gageHeight, floodStages) {
    let result = gageHeight;
    if (floodStages.length) {
        // Set gageHeight to the nearest flood stage
        result = floodStages[0];
        let diff = Math.abs(gageHeight - result );
        floodStages.forEach((stage) => {
            let newDiff = Math.abs(gageHeight - stage);
            if (newDiff < diff) {
                diff = newDiff;
                result = stage;
            }
        });
    }
    return result;
};


export const timeSeriesReducer = function (state={}, action) {
    let newState;
    let sorted;
    let currentVar;

    switch (action.type) {
        case 'TIMESERIES_PLAY_ON':
            return {
                ...state,
                playId: action.playId
            };

        case 'TIMESERIES_PLAY_STOP':
            return {
                ...state,
                playId: null
            };

        case 'SET_FLOOD_FEATURES':
            return {
                ...state,
                floodStages: action.stages,
                floodExtent: action.extent,
                gageHeight: getGageHeight(state.gageHeight, action.stages)
            };

        case 'ADD_TIMESERIES_COLLECTION':
            // Get variables sorted, and filtering out those that don't have
            // points on the corresponding time series.
            sorted = action.data.variables ? sortedParameters(
                Object.values(action.data.timeSeries || {})
                    .filter(ts => ts.points.length)
                    .map(ts => ts.variable)
                    .reduce((vars, v) => {
                        vars[v] = action.data.variables[v];
                        return vars;
                    }, {})
            ) : [];
            currentVar = sorted.length > 0 ? sorted[0].oid : null;
            return {
                ...state,
                series: merge({}, state.series, action.data),
                showSeries: {
                    ...state.showSeries,
                    [action.key]: action.show
                },
                currentVariableID: state.currentVariableID || currentVar
            };

        case 'TOGGLE_TIMESERIES':
            return {
                ...state,
                showSeries: {
                    ...state.showSeries,
                    [action.key]: action.show
                }
            };

        case 'RESET_TIMESERIES':
            newState = {
                ...state,
                showSeries: {
                    ...state.showSeries,
                    [action.key]: false
                },
                series: {
                    ...state.series,
                    request: {
                        ...(state.series || {}).request
                    }
                }
            };
            delete newState.series.request[action.key];
            return newState;

        case 'SHOW_MEDIAN_STATS_LABEL':
            return {
                ...state,
                showMedianStatsLabel : action.show
            };

        case 'SET_CURSOR_OFFSET':
            return {
                ...state,
                cursorOffset: action.cursorOffset
            };

        case 'RESIZE_UI':
            return {
                ...state,
                windowWidth: action.windowWidth,
                width: action.width
            };

        case 'PARAMETER_CODE_SET':
            return {
                ...state,
                currentVariableID: action.variableID
            };

        case 'SET_GAGE_HEIGHT_INDEX':
            return {
                ...state,
                gageHeight: state.floodStages[action.gageHeightIndex]
            };

        case 'SET_GAGE_HEIGHT':
            return {
                ...state,
                gageHeight: getGageHeight(action.gageHeight, state.floodStages)
            };

        default:
            return state;
    }
};


const MIDDLEWARES = [thunk];


export const configureStore = function (initialState) {
    initialState = {
        series: {},
        statisticalMetaData: {
            beginYear: '',
            endYear: ''
        },
        showSeries: {
            current: true,
            compare: false,
            median: false
        },
        currentVariableID: null,
        windowWidth: 1024,
        width: 800,
        showMedianStatsLabel: false,
        cursorOffset: null,
        floodStages: [],
        floodExtent: {},
        gageHeight: null,
        playId: null,
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
        timeSeriesReducer,
        initialState,
        enhancers
    );
};
