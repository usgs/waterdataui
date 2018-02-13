const { timeFormat } = require('d3-time-format');
const { applyMiddleware, createStore, compose } = require('redux');
const { default: thunk } = require('redux-thunk');

const { getMedianStatistics, getPreviousYearTimeseries, getTimeseries,
    parseMedianData } = require('../../models');
const { replaceHtmlEntities } = require('../../utils');

// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');


export const Actions = {
    retrieveTimeseries(siteno, startDate=null, endDate=null) {
        return function (dispatch) {
            const timeSeries = getTimeseries({sites: [siteno], startDate, endDate}).then(
                series => {
                    dispatch(Actions.addTimeseries('current', siteno, series[0]));
                    // Trigger a call to get last year's data
                    const startTime = series[0].seriesStartDate;
                    const endTime = series[0].seriesEndDate;
                    dispatch(Actions.retrieveCompareTimeseries(siteno, startTime, endTime));

                    return series[0];
                },
                () => dispatch(Actions.resetTimeseries('current'))
            );
            const medianStatistics = getMedianStatistics({sites: [siteno]});
            Promise.all([timeSeries, medianStatistics]).then((data) => {
                const [series, stats] = data;
                const startDate = series.seriesStartDate;
                const endDate = series.seriesEndDate;
                let unit = replaceHtmlEntities(series.variableName.split(' ').pop());
                let plotableStats = parseMedianData(stats, startDate, endDate, unit);
                dispatch(Actions.setMedianStatistics(plotableStats));
            });
        };
    },
    retrieveCompareTimeseries(site, startTime, endTime) {
        return function (dispatch) {
            return getPreviousYearTimeseries({site, startTime, endTime}).then(
                series => dispatch(Actions.addTimeseries('compare', site, series[0], false)),
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
    addTimeseries(key, siteno, data, show=true) {
        return {
            type: 'ADD_TIMESERIES',
            key,
            siteno,
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
            // If data is valid
            if (action.data && action.data.values) {
                let variableName = replaceHtmlEntities(action.data.variableName);
                return {
                    ...state,
                    tsData: {
                        ...state.tsData,
                        [action.key]: action.data.values
                    },
                    showSeries: {
                        ...state.showSeries,
                        [action.key]: action.show
                    },
                    title: variableName,
                    plotYLabel: action.data.variableDescription,
                    desc: action.data.variableDescription + ' from ' +
                        formatTime(action.data.seriesStartDate) + ' to ' +
                        formatTime(action.data.seriesEndDate)
                };
            } else {
                return state.dispatch(Actions.resetTimeseries());
            }

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
                    [action.key]: []
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
                    medianStatistics: action.medianStatistics.values
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
            current: [],
            compare: [],
            medianStatistics: []
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
        title: '',
        desc: '',
        width: 800,
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
