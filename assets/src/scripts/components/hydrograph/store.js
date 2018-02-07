const { timeFormat } = require('d3-time-format');
const { applyMiddleware, createStore, compose } = require('redux');
const { default: thunk } = require('redux-thunk');

const { getMedianStatistics, getPreviousYearTimeseries, getTimeseries,
    parseMedianData } = require('../../models');
const { getHtmlFromString, unicodeHtmlEntity } = require('../../utils');

const { baseMarkers, extendedMarkers } = require('./legend');

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
                let unit = series.variableName.split(' ').pop();
                const htmlEntities = getHtmlFromString(unit);
                if (htmlEntities !== null) {
                    for (let htmlEntity of htmlEntities) {
                        let unicodeEntity = unicodeHtmlEntity(htmlEntity);
                        unit = unit.replace(htmlEntity, unicodeEntity);
                    }
                }
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
    setLegendMarkers(key) {
        return {
            type: 'SET_LEGEND_MARKERS',
            key
        };
    }
};


export const timeSeriesReducer = function (state={}, action) {
    switch (action.type) {
        case 'ADD_TIMESERIES':
            if (action.data && action.data.values &&
                    !action.data.values.some(d => d.value === -999999)) {
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
                    legendMarkers: baseMarkers,
                    title: action.data.variableName,
                    desc: action.data.variableDescription + ' from ' +
                        formatTime(action.data.seriesStartDate) + ' to ' +
                        formatTime(action.data.seriesEndDate)
                };
            } else {
                return state.dispatch(Actions.resetTimeseries());
            }

        case 'TOGGLE_TIMESERIES':
            let legendMarkers;
            if (action.key === 'compare' && action.show === true) {
                legendMarkers = extendedMarkers;
            }
            else {
                legendMarkers = baseMarkers;
            }
            return {
                ...state,
                showSeries: {
                    ...state.showSeries,
                    [action.key]: action.show
                },
                legendMarkers: legendMarkers
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
                },
                legendMarkers: baseMarkers
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

        case 'SET_LEGEND_MARKERS':
            return {
                ...state,
                legendMarkers: []
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
        legendMarkers: [],
        title: '',
        desc: '',
        ...initialState
    };

    let enhancers;
    if (window.__REDUX_DEVTOOLS_EXTENSION__) {
        enhancers = compose(
            applyMiddleware(...MIDDLEWARES),
            window.__REDUX_DEVTOOLS_EXTENSION__()
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
