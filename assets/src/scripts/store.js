const { applyMiddleware, createStore, compose } = require('redux');
const { default: thunk } = require('redux-thunk');

const { getMedianStatistics, getPreviousYearTimeseries, getTimeseries,
    parseMedianData } = require('./models');
const { fetchFloodFeatures, fetchFloodExtent } = require('./flood_data');


export const Actions = {
    retrieveTimeseries(siteno, params=null, startDate=null, endDate=null) {
        return function (dispatch) {
            const timeSeries = getTimeseries({sites: [siteno], params, startDate, endDate}).then(
                series => {
                    dispatch(Actions.addTimeseries('current', series));
                    // Trigger a call to get last year's data
                    dispatch(Actions.retrieveCompareTimeseries(siteno, series[0].startTime, series[0].endTime));

                    return series;
                },
                () => {
                    dispatch(Actions.resetTimeseries('current'));
                }
            );
            const medianStatistics = getMedianStatistics({sites: [siteno]});
            Promise.all([timeSeries, medianStatistics]).then((data) => {
                const [series, stats] = data;
                const startDate = series[0].startTime;
                const endDate = series[0].endTime;
                const units = series.reduce((units, series) => {
                    units[series.code] = series.unit;
                    return units;
                }, {});
                let plotableStats = parseMedianData(stats, startDate, endDate, units);
                dispatch(Actions.setMedianStatistics(plotableStats));
            });
        };
    },
    retrieveCompareTimeseries(site, startTime, endTime) {
        return function (dispatch) {
            return getPreviousYearTimeseries({site, startTime, endTime}).then(
                series => dispatch(Actions.addTimeseries('compare', series, false)),
                () => dispatch(Actions.resetTimeseries('compare'))
            );
        };
    },
    retrieveFloodData(siteno) {
        return function(displatch) {
            const floodFeatures = fetchFloodFeatures(siteno);
            const floodExtent = fetchFloodExtent(siteno);
            Promise.all([floodFeatures, floodExtent]).then((data) => {
                const [features, extent] = data;
                if (features.length > 0) {
                    const stages = features.map((feature) => feature.attributes.STAGE).sort(function(a, b) {return a - b;});
                    displatch(Actions.setFloodFeatures(stages, extent.extent));
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
    addTimeseries(key, data, show=true) {
        return {
            type: 'ADD_TIMESERIES',
            key,
            show,
            // Key the data on its parameter code
            data: data.reduce(function (acc, series) {
                acc[series.code] = series;
                return acc;
            }, {})
        };
    },
    resetTimeseries(key) {
        return {
            type: 'RESET_TIMESERIES',
            key
        };
    },
    setMedianStatistics(medianStatistics) {
        return {
            type: 'SET_MEDIAN_STATISTICS',
            medianStatistics
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
    resizeUI(windowWidth, width) {
        return {
            type: 'RESIZE_UI',
            windowWidth,
            width
        };
    },
    setCurrentParameterCode(parameterCode) {
        return {
            type: 'PARAMETER_CODE_SET',
            parameterCode
        };
    },
    setGageHeight(gageHeightIndex) {
        return {
            type: 'SET_GAGE_HEIGHT',
            gageHeightIndex
        };
    }
};


export const timeSeriesReducer = function (state={}, action) {
    switch (action.type) {
        case 'SET_FLOOD_FEATURES':
            return {
                ...state,
                floodStages: action.stages,
                floodExtent: action.extent,
                gageHeight: action.stages.length > 0 ? action.stages[0] : null
            };
        case 'ADD_TIMESERIES':
            return {
                ...state,
                tsData: {
                    ...state.tsData,
                    [action.key]: {
                        ...state.tsData[action.key],
                        ...action.data
                    }
                },
                showSeries: {
                    ...state.showSeries,
                    [action.key]: action.show
                },
                // If there isn't a selected parameter code yet, pick the first
                // one after sorting by ID.
                currentParameterCode: state.currentParameterCode ||
                    action.data[Object.keys(action.data).sort()[0]].code
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
            return {
                ...state,
                tsData: {
                    ...state.tsData,
                    [action.key]: {}
                },
                showSeries: {
                    ...state.showSeries,
                    [action.key]: false
                }
            };

        case 'SET_MEDIAN_STATISTICS':
            return {
                ...state,
                tsData: {
                    ...state.tsData,
                    medianStatistics: {
                        ...state.tsData['medianStatistics'],
                        ...action.medianStatistics
                    }
                },
                showSeries: {
                    ...state.showSeries,
                    medianStatistics: true
                }
            };

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

        case 'RESIZE_UI':
            return {
                ...state,
                windowWidth: action.windowWidth,
                width: action.width
            };

        case 'PARAMETER_CODE_SET':
            return {
                ...state,
                currentParameterCode: action.parameterCode
            };

        case 'SET_GAGE_HEIGHT':
            return {
                ...state,
                gageHeight: state.floodStages[action.gageHeightIndex]
            };

        default:
            return state;
    }
};


const MIDDLEWARES = [thunk];


export const configureStore = function (initialState) {
    initialState = {
        tsData: {
            current: {
            },
            compare: {},
            medianStatistics: {}
        },
        statisticalMetaData: {
            beginYear: '',
            endYear: ''
        },
        showSeries: {
            current: true,
            compare: false,
            medianStatistics: false
        },
        currentParameterCode: null,
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
