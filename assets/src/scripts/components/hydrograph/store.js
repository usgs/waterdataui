const { applyMiddleware, createStore, compose } = require('redux');
const { default: thunk } = require('redux-thunk');

const { getMedianStatistics, getPreviousYearTimeseries, getTimeseries,
    parseMedianData } = require('../../models');
const { replaceHtmlEntities } = require('../../utils');


export const Actions = {
    retrieveTimeseries(siteno, params=null, startDate=null, endDate=null) {
        return function (dispatch) {
            const timeSeries = getTimeseries({sites: [siteno], params, startDate, endDate}).then(
                series => {
                    dispatch(Actions.addTimeseries('current', series[0]));
                    // Trigger a call to get last year's data
                    dispatch(Actions.retrieveCompareTimeseries(siteno, series[0].startTime, series[0].endTime));

                    return series[0];
                },
                () => {
                    dispatch(Actions.resetTimeseries('current'));
                }
            );
            const medianStatistics = getMedianStatistics({sites: [siteno]});
            Promise.all([timeSeries, medianStatistics]).then((data) => {
                const [series, stats] = data;
                const startDate = series.startTime;
                const endDate = series.endTime;
                let unit = replaceHtmlEntities(series.name.split(' ').pop());
                let plotableStats = parseMedianData(stats, startDate, endDate, unit);
                dispatch(Actions.setMedianStatistics(plotableStats));
            });
        };
    },
    retrieveCompareTimeseries(site, startTime, endTime) {
        return function (dispatch) {
            return getPreviousYearTimeseries({site, startTime, endTime}).then(
                series => dispatch(Actions.addTimeseries('compare', series[0], false)),
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
    addTimeseries(key, data, show=true) {
        return {
            type: 'ADD_TIMESERIES',
            key,
            data,
            show
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
    resizeTimeseriesPlot(width) {
        return {
            type: 'RESIZE_TIMESERIES_PLOT',
            width
        };
    }
};


export const timeSeriesReducer = function (state={}, action) {
    switch (action.type) {
        case 'ADD_TIMESERIES':
            return {
                ...state,
                tsData: {
                    ...state.tsData,
                    [action.key]: {
                        ...state.tsData[action.key],
                        [action.data.code]: action.data
                    }
                },
                showSeries: {
                    ...state.showSeries,
                    [action.key]: action.show
                }
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
                        '00060': {
                            values: action.medianStatistics.values,
                            name: '00060:median'
                        }
                    }
                },
                showSeries: {
                    ...state.showSeries,
                    medianStatistics: true
                },
                statisticalMetaData: {
                    ...state.statisticalMetaData,
                    beginYear: action.medianStatistics.beginYear,
                    endYear: action.medianStatistics.endYear
                }
            };

        case 'SHOW_MEDIAN_STATS_LABEL':
            return {
                ...state,
                showMedianStatsLabel : action.show
            };

        case 'RESIZE_TIMESERIES_PLOT':
            return {
                ...state,
                width: action.width
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
            compare: {
                '00060': {
                    values: []
                }
            },
            medianStatistics: {
                '00060': {
                    values: []
                }
            }
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
        currentParameterCode: '00060',
        width: 800,
        showMedianStatsLabel: false,
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
