const { timeFormat } = require('d3-time-format');
const { applyMiddleware, createStore, compose } = require('redux');
const { default: thunk } = require('redux-thunk');

const { getMedianStatistics, getPreviousYearTimeseries, getTimeseries,
    parseMedianData } = require('../../models');
const { getHtmlFromString, unicodeHtmlEntity } = require('../../utils');

const { baseMarkers, extendedMarkers } = require('./legend');

const { defineLineMarker, defineCircleMarker } = require('./markers');

// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');


export const Actions = {
    retrieveTimeseries(siteno, startDate=null, endDate=null) {
        return function (dispatch) {
            const timeSeries = getTimeseries({sites: [siteno], startDate, endDate}).then(
                series => {
                    dispatch(Actions.addTimeseries('current', siteno, series[0]));
                    dispatch(Actions.setLegendMarkers('current'));
                    // Trigger a call to get last year's data
                    const startTime = series[0].seriesStartDate;
                    const endTime = series[0].seriesEndDate;
                    dispatch(Actions.retrieveCompareTimeseries(siteno, startTime, endTime));
                    dispatch(Actions.setLegendMarkers('compare'));

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
                dispatch(Actions.setLegendMarkers('medianStatistics'));
                dispatch(Actions.selectLegendMarkers());
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
    },
    selectLegendMarkers() {
        return {
            type: 'SELECT_DISPLAY_MARKERS',
            text: 'Select Display Markers'
        };
    }
};


export const timeSeriesReducer = function (state={}, action) {
    switch (action.type) {
        case 'ADD_TIMESERIES':
            // If data is valid
            if (action.data && action.data.values) {
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
                    title: action.data.variableName,
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

        case 'SET_LEGEND_MARKERS':
            let marker;
            let text;
            if (action.key === 'compare' || action.key === 'current') {
                text = 'Current Year';
                let domId = `ts-${action.key}`;
                let svgGroup = `${action.key}-line-marker`;
                if (action.key === 'compare') {
                    text = 'Last Year';
                }
                marker = defineLineMarker(domId, 'line', text, svgGroup);
            }
            else if (action.key === 'medianStatistics') {
                let beginYear;
                let endYear;
                try {
                    beginYear = state.statisticalMetaData.beginYear;
                    endYear = state.statisticalMetaData.endYear;
                    text = `Median Discharge ${beginYear} - ${endYear}`;
                }
                catch(err) {
                    beginYear = '';
                    endYear = '';
                    text = 'Median Discharge';
                }
                marker = defineCircleMarker(4, null, 'median-data-series', text, 'median-circle-marker');
            }
            else {
                marker = null;
            }
            return {
                ...state,
                legendMarkers: {
                    ...state.legendMarkers,
                    [action.key]: marker
                }
            };

        case 'SELECT_DISPLAY_MARKERS':
            let displayMarkers = [];
            const showSeries = state.showSeries ? state.showSeries : {};
            const markers = state.legendMarkers ? state.legendMarkers : {};
            for (const [key, value] of Object.entries(showSeries)) {
                let marker;
                if (value) {
                    marker = markers[key];
                    if (marker) {
                        displayMarkers.push(marker);
                    }
                }
            }
            return {
                ...state,
                displayMarkers: displayMarkers
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
        legendMarkers: {},
        displayMarkers: [],
        title: '',
        desc: '',
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
