import {applyMiddleware, createStore, combineReducers, compose} from 'redux';
import {default as thunk} from 'redux-thunk';

import {
    floodDataReducer as floodData,
    floodStateReducer as floodState} from 'ml/store/flood-inundation';
import {nldiDataReducer as nldiData} from 'ml/store/nldi-data';
import {dailyValueTimeSeriesDataReducer as dailyValueTimeSeriesData} from 'ml/store/daily-value-time-series';
import {dailyValueTimeSeriesStateReducer as dailyValueTimeSeriesState} from 'ml/store/daily-value-time-series';
import {ivTimeSeriesDataReducer as ivTimeSeriesData} from 'ml/store/instantaneous-value-time-series-data';
import {ivTimeSeriesStateReducer as ivTimeSeriesState} from 'ml/store/instantaneous-value-time-series-state';
import {statisticsDataReducer as statisticsData} from 'ml/store/statistics-data';
import {timeZoneReducer as ianaTimeZone} from 'ml/store/time-zone';
import {uiReducer as ui} from 'ml/store/ui-state';
import {networkDataReducer as networkData} from 'ml/store/network';

const appReducer = combineReducers({
    ivTimeSeriesData,
    ianaTimeZone,
    dailyValueTimeSeriesData,
    statisticsData,
    floodData,
    nldiData,
    ivTimeSeriesState,
    dailyValueTimeSeriesState,
    floodState,
    ui,
    networkData
});

const MIDDLEWARES = [thunk];


export const configureStore = function(initialState) {
    initialState = {
        ivTimeSeriesData: {},
        ianaTimeZone: null,
        dailyValueTimeSeriesData: {},
        floodData: {
            stages: [],
            extent: {},
            floodLevels: null
        },
        nldiData: {
            upstreamFlows: [],
            downstreamFlows: [],
            upstreamSites: [],
            downstreamSites: [],
            upstreamBasin: []
        },
        statisticsData: {},
        ivTimeSeriesState: {
            showIVTimeSeries: {
                current: true,
                compare: false,
                median: false
            },
            currentIVDateRange: 'P7D',
            customIVTimeRange: null,
            currentIVVariableID: null,
            ivGraphCursorOffset: null,
            audiblePlayId: null,
            loadingIVTSKeys: [],
            ivGraphBrushOffset: null,
            userInputsForTimeRange: {
                mainTimeRangeSelectionButton: 'P7D',
                customTimeRangeSelectionButton: 'days-input',
                numberOfDaysFieldValue: ''
            }
        },
        dailyValueTimeSeriesState: {
            cursorOffset: null
        },
        floodState: {
            gageHeight: null
        },
        ui : {
            windowWidth: 1024,
            width: 800
        },
        networkData : {
            networkList: []
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
        appReducer,
        initialState,
        enhancers
    );
};
