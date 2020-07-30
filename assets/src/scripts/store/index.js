import {applyMiddleware, createStore, combineReducers, compose} from 'redux';
import {default as thunk} from 'redux-thunk';

import {
    floodDataReducer as floodData,
    floodStateReducer as floodState} from './flood-inundation';
import {nldiDataReducer as nldiData} from './nldi-data';
import {dailyValueTimeSeriesDataReducer as dailyValueTimeSeriesData} from './daily-value-time-series';
import {dailyValueTimeSeriesStateReducer as dailyValueTimeSeriesState} from './daily-value-time-series';
import {ivTimeSeriesDataReducer as ivTimeSeriesData} from './instantaneous-value-time-series-data';
import {ivTimeSeriesStateReducer as ivTimeSeriesState} from './instantaneous-value-time-series-state';
import {observationsDataReducer as observations} from './observations';
import {statisticsDataReducer as statisticsData} from './statistics-data';
import {timeZoneReducer as ianaTimeZone} from './time-zone';
import {uiReducer as ui} from './ui-state';
import {waterqualityDataReducer as waterquality} from './waterquality';
import {wdfnDataReducer as wdfn} from './wdfn';

const appReducer = combineReducers({
    ivTimeSeriesData,
    ianaTimeZone,
    dailyValueTimeSeriesData,
    observations,
    statisticsData,
    waterquality,
    wdfn,
    floodData,
    nldiData,
    ivTimeSeriesState,
    dailyValueTimeSeriesState,
    floodState,
    ui
});

const MIDDLEWARES = [thunk];


export const configureStore = function (initialState) {
    initialState = {
        ivTimeSeriesData: {},
        ianaTimeZone: null,
        dailyValueTimeSeriesData: {},
        floodData: {
            stages: [],
            extent: {}
        },
        nldiData: {
            upstreamFlows: [],
            downstreamFlows: [],
            upstreamSites: [],
            downstreamSites: [],
            upstreamBasin: []
        },
        observations: {},
        waterquality: {
            filters: {
                characteristics: {
                    Nitrate: false,
                    Lead: false
                }
            },
            sites: []
        },
        wdfn: {
            filters: {
                siteTypes: {
                    groundwater: false,
                    surfacewater: false,
                    atmospheric: false,
                    spring: false
                },
                timePeriod: null,
                bBox: {
                    west: null,
                    south: null,
                    east: null,
                    north: null
                }
            },
            count: 0,
            sites: []
        },
        statisticsData: {},
        ivTimeSeriesState: {
            showIVTimeSeries: {
                current: true,
                compare: false,
                median: false
            },
            currentIVDateRangeKind: 'P7D',
            customIVTimeRange: null,
            currentIVVariableID: null,
            ivGraphCursorOffset: null,
            audiblePlayId: null,
            loadingIVTSKeys: [],
            ivGraphBrushOffset: null
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
