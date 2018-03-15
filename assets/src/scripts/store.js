const merge = require('lodash/merge');
const { applyMiddleware, createStore, compose } = require('redux');
const { default: thunk } = require('redux-thunk');

const { getMedianStatistics, getPreviousYearTimeseries, getTimeseries,
    parseMedianData } = require('./models');
const { normalize } = require('./schema');
const { fetchFloodFeatures, fetchFloodExtent } = require('./floodData');



export const Actions = {
    retrieveTimeseries(siteno, params=null, startDate=null, endDate=null) {
        return function (dispatch) {
            const timeSeries = getTimeseries({sites: [siteno], params, startDate, endDate}).then(
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

                    return {collection, startTime, endTime};
                },
                () => {
                    dispatch(Actions.resetTimeseries('current'));
                }
            );
            const medianStatistics = getMedianStatistics({sites: [siteno]});
            Promise.all([timeSeries, medianStatistics]).then(([{collection, startTime, endTime}, stats]) => {
                let medianCollection = parseMedianData(stats, startTime, endTime, collection.variables);
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
        return function(dispatch) {
            const floodFeatures = fetchFloodFeatures(siteno);
            const floodExtent = fetchFloodExtent(siteno);
            Promise.all([floodFeatures, floodExtent]).then((data) => {
                const [features, extent] = data;
                if (features.length > 0) {
                    const stages = features.map((feature) => feature.attributes.STAGE).sort(function(a, b) {
                        return a - b;
                    });
                    dispatch(Actions.setFloodFeatures(stages, extent.extent));
                }
            });
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
    setTooltipTime(currentTime, compareTime) {
        return {
            type: 'SET_TOOLTIP_TIME',
            currentTime,
            compareTime
        };
    },
    setCursorLocation(xLocation) {
        return {
            type: 'SET_CURSOR_LOCATION',
            xLocation
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
    setGageHeight(gageHeightIndex) {
        return {
            type: 'SET_GAGE_HEIGHT',
            gageHeightIndex
        };
    },
    toggleAudibleInterface(audibleInterfaceOn) {
        return {
            type: 'AUDIBLE_INTERFACE_TOGGLE',
            audibleInterfaceOn
        };
    }
};


export const timeSeriesReducer = function (state={}, action) {
    let newState;
    switch (action.type) {
        case 'SET_FLOOD_FEATURES':
            return {
                ...state,
                floodStages: action.stages,
                floodExtent: action.extent,
                gageHeight: action.stages.length > 0 ? action.stages[0] : null
            };
        case 'ADD_TIMESERIES_COLLECTION':
            return {
                ...state,
                series: merge({}, state.series, action.data),
                showSeries: {
                    ...state.showSeries,
                    [action.key]: action.show
                },
                currentVariableID: state.currentVariableID || Object.values(
                    action.data.variables).sort((a, b) => {
                        const aVal = a.variableCode.value;
                        const bVal = b.variableCode.value;
                        if (aVal > bVal) {
                            return 1;
                        } else if (aVal < bVal) {
                            return -1;
                        } else {
                            return 0;
                        }
                    })[0].oid
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

        case 'SET_TOOLTIP_TIME':
            return {
                ...state,
                tooltipFocusTime: {
                    ...state.tooltipFocusTime,
                    current: action.currentTime,
                    compare: action.compareTime
                }
            };

        case 'SET_CURSOR_LOCATION':
            return {
                ...state,
                tooltipFocusTime: {
                    current: action.xLocation
                }
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

        case 'SET_GAGE_HEIGHT':
            return {
                ...state,
                gageHeight: state.floodStages[action.gageHeightIndex]
            };

        case 'AUDIBLE_INTERFACE_TOGGLE':
            return {
                ...state,
                audibleInterfaceOn: action.audibleInterfaceOn
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
        tooltipFocusTime: {
            current: null,
            compare: null
        },
        floodStages: [],
        floodExtent: {},
        gageHeight: null,
        audibleInterfaceOn: false,
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
