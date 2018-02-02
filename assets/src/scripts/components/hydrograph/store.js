const { timeFormat } = require('d3-time-format');
const { applyMiddleware, createStore } = require('redux');
const { default: thunk } = require('redux-thunk');

const { getMedianStatistics, getPreviousYearTimeseries, getTimeseries,
    parseMedianData } = require('../../models');
const { getHtmlFromString, unicodeHtmlEntity } = require('../../utils');

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
    }
};


const timeSeriesReducer = function (state={}, action) {
    switch (action.type) {
        case 'ADD_TIMESERIES':
            // If data is valid
            if (action.data && action.data.values &&
                    !action.data.values.some(d => d.value === -999999)) {
                return {
                    ...state,
                    tsData: {
                        ...state.tsData,
                        [action.key]: {
                            ...state.tsData[action.key],
                            data: action.data.values,
                            show: action.show
                        }
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
                tsData: {
                    ...state.tsData,
                    [action.key]: {
                        ...state.tsData[action.key],
                        show: action.show
                    }
                }
            };

        case 'RESET_TIMESERIES':
            return {
                ...state,
                tsData: {
                    ...state.tsData,
                    [action.key]: {
                        ...state.tsData[action.key],
                        data: [],
                        show: false
                    }
                }
            };


        case 'SET_MEDIAN_STATISTICS':
            return {
                ...state,
                tsData: {
                    ...state.tsData,
                    medianStatistics: {
                        ...state.tsData[action.key],
                        data: action.medianStatistics,
                        show: true
                    }
                },
                title: '',
                desc: ''
            };

        default:
            return state;
    }
};


export const configureStore = function (initialState) {
    initialState = {
        tsData: {
            current: {
                data: [],
                show: true
            },
            compare: {
                data: [],
                show: false
            },
            medianStatistics: {
                data: [],
                show: false
            }
        },
        title: '',
        desc: '',
        ...initialState
    };
    return createStore(
        timeSeriesReducer,
        initialState,
        applyMiddleware(thunk)
    );
};
