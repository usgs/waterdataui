import {applyMiddleware, createStore, combineReducers, compose} from 'redux';
import {default as thunk} from 'redux-thunk';

import {dailyValueTimeSeriesDataReducer as dailyValueTimeSeriesData} from './daily-value-time-series';
import {dailyValueTimeSeriesStateReducer as dailyValueTimeSeriesState} from './daily-value-time-series';
import {
    floodDataReducer as floodData,
    floodStateReducer as floodState} from './flood-inundation';
import {hydrographDataReducer as hydrographData} from './hydrograph-data';
import {hydrographParametersReducer as hydrographParameters} from './hydrograph-parameters';
import {hydrographStateReducer as hydrographState,
    INITIAL_STATE as HYDROGRAPH_INITIAL_STATE
} from './hydrograph-state';
import {networkDataReducer as networkData} from './network';
import {nldiDataReducer as nldiData} from './nldi-data';
import {uiReducer as ui} from './ui-state';

const appReducer = combineReducers({
    hydrographData,
    hydrographParameters,
    hydrographState,
    dailyValueTimeSeriesData,
    floodData,
    nldiData,
    dailyValueTimeSeriesState,
    floodState,
    ui,
    networkData
});

const MIDDLEWARES = [thunk];


export const configureStore = function(initialState) {
    initialState = {
        hydrographData: {},
        hydrographParameters: {},
        hydrographState: HYDROGRAPH_INITIAL_STATE,
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
