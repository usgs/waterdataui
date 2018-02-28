const merge = require('lodash/merge');
const { applyMiddleware, createStore, compose } = require('redux');
const { default: thunk } = require('redux-thunk');

const { getMedianStatistics, getPreviousYearTimeseries, getTimeseries,
    parseMedianData } = require('../../models');
const { normalize } = require('./schema');


export const Actions = {
    retrieveTimeseries(siteno, params=null, startDate=null, endDate=null) {
        return function (dispatch) {
            const timeSeries = getTimeseries({sites: [siteno], params, startDate, endDate}).then(
                series => {
                    const collection = normalize(series, 'current');

                    // Get the start/end times of every time series.
                    const tsArray = Object.values(collection.timeSeries);
                    const startTime = new Date(Math.min.apply(null,
                        tsArray.filter(ts => ts.startTime).map(ts => ts.startTime)));
                    const endTime = new Date(Math.max.apply(null,
                        tsArray.filter(ts => ts.endTime).map(ts => ts.endTime)));

                    dispatch(Actions.addSeriesCollection('current', collection));
                    // Trigger a call to get last year's data
                    dispatch(Actions.retrieveCompareTimeseries(siteno, startTime, endTime));

                    return collection;
                },
                () => {
                    dispatch(Actions.resetTimeseries('current'));
                }
            );
            const medianStatistics = getMedianStatistics({sites: [siteno]});
            Promise.all([timeSeries, medianStatistics]).then(([collection, stats]) => {
                // Get the start/end times of every time series.
                const tsArray = Object.values(collection.timeSeries);
                const startTime = new Date(Math.min.apply(null,
                    tsArray.filter(ts => ts.startTime).map(ts => ts.startTime)));
                const endTime = new Date(Math.max.apply(null,
                    tsArray.filter(ts => ts.endTime).map(ts => ts.endTime)));

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
    resizeTimeseriesPlot(width) {
        return {
            type: 'RESIZE_TIMESERIES_PLOT',
            width
        };
    },
    setCurrentParameterCode(parameterCode, variableID) {
        return {
            type: 'PARAMETER_CODE_SET',
            parameterCode,
            variableID
        };
    }
};


export const timeSeriesReducer = function (state={}, action) {
    let newState;
    switch (action.type) {
        case 'ADD_TIMESERIES_COLLECTION':
            return {
                ...state,
                series: merge({}, state.series, action.data),
                showSeries: {
                    ...state.showSeries,
                    [action.key]: action.show
                },
                // If there isn't a selected parameter code yet, pick the first
                // one after sorting by ID.
                currentParameterCode: state.currentParameterCode || Object.values(
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
                    })[0].variableCode.value,
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

        case 'RESIZE_TIMESERIES_PLOT':
            return {
                ...state,
                width: action.width
            };

        case 'PARAMETER_CODE_SET':
            return {
                ...state,
                currentParameterCode: action.parameterCode,
                currentVariableID: action.variableID
            };

        default:
            return state;
    }
};


const MIDDLEWARES = [thunk];


export const configureStore = function (initialState) {
    initialState = {
        tsData: {
            median: {}
        },
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
        currentParameterCode: null,
        currentVariableID: null,
        width: 800,
        showMedianStatsLabel: false,
        tooltipFocusTime: {
            current: null,
            compare: null
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
        timeSeriesReducer,
        initialState,
        enhancers
    );
};
