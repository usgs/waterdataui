const { timeFormat } = require('d3-time-format');
const { applyMiddleware, createStore } = require('redux');
const { default: thunk } = require('redux-thunk');

const { getPreviousYearTimeseries, getTimeseries } = require('../../models');

// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');


export const Actions = {
    retrieveTimeseries(siteno, startDate=null, endDate=null) {
        return function (dispatch) {
            return getTimeseries({sites: [siteno], startDate, endDate}).then(
                series => {
                    dispatch(Actions.addTimeseries('current', siteno, series[0]));

                    // Trigger a call to get last year's data
                    const startTime = series[0].seriesStartDate;
                    const endTime = series[0].seriesEndDate;
                    dispatch(Actions.retrieveCompareTimeseries(siteno, startTime, endTime));
                },
                () => dispatch(Actions.resetTimeseries('current'))
            );
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
