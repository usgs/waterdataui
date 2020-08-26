import {applyMiddleware, createStore, combineReducers, compose} from 'redux';
import {default as thunk} from 'redux-thunk';

import {executeGraphQlQuery, mapQuery} from '../../web-services/graphql';

import {wdfnDataReducer as wdfnData} from './wdfn-data-reducer';

export const SET_COUNT = 'SET_COUNT';
export const SET_WDFN_FEATURES = 'SET_WDFN_FEATURES';
export const SET_LOADING_STATE = 'SET_LOADING_STATE';
export const APPLY_PARAMETER_FILTER = 'APPLY_PARAMETER_FILTER';
export const APPLY_PERIOD_FILTER = 'APPLY_PERIOD_FILTER';
export const APPLY_SITE_TYPE_FILTER = 'APPLY_SITE_TYPE_FILTER';
export const APPLY_GEOGRAPHIC_FILTER = 'APPLY_GEOGRAPHIC_FILTER';

export const STORE_STRUCTURE = {
  wdfnData: {
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
          },
          parameters: []
      },
      count: 0,
      sites: [],
      uiState: {
        loading: false
      }
  }
};

/* 
 * Translates the selected site types into proper WQP keywords
 * @param { Object.<string, boolean> } siteTypes
 * @returns { Array.<String> } WQP-friendly search terms 
 */
const lookupSiteTypesFullNames = function (siteTypes) {
    const dictionary = {
        groundwater: ['Aggregate groundwater use', 'Well', 'Subsurface'],
        surfacewater: ['Aggregate surface-water-use', 'Stream', 'Lake, Reservoir, Impoundment'],
        atmospheric: 'Atmosphere',
        spring: 'Spring',
        other: ['Facility', 'Land']
    };

    siteTypes = Object.keys(siteTypes).flatMap(st => {
        if (siteTypes[st]) return dictionary[st];
    })
        .filter(st => st);

    return siteTypes;
};

/* 
 * Synchronous redux action to set the number of sites returned 
 * @param { number } count
 * @returns { Object } Redux action
 */
const setCount = function (count) {
    return {
        type: SET_COUNT,
        count
    };
};

/* 
 * Synchronous redux action to set the features returned from the API 
 * @param { Array.<Object> } features
 * @returns { Object } Redux action
 */
const setWdfnFeatures = function(features) {
    return {
        type: SET_WDFN_FEATURES,
        features
    };
};

/* 
 * Synchronous redux action to set the site type filter
 * @param { Object.<string, boolean> } filter
 * @returns { Object } Redux action
 */
const setSiteTypeFilter = function (filter) {
    return {
        type: APPLY_SITE_TYPE_FILTER,
        filter
    };
};

/* 
 * Synchronous redux action to set the parameter codes to search
 * @param { Array.<string> } filter
 * @returns { Object } Redux action
 */
const setParamFilter = function (pCodes) {
    return {
        type: APPLY_PARAMETER_FILTER,
        pCodes
    };
};

export const applyParamFilter = function (pCodes) {
  return function (dispatch) {
    dispatch(setParamFilter(pCodes));
  };
};

/* 
 * Synchronous redux action to set the bounding box coordinates 
 * @param { Object.<string, string> } filter
 * @returns Redux action
 */
const setBboxFilter = function ({ west, south, east, north }) {
    return {
        type: APPLY_GEOGRAPHIC_FILTER,
        west,
        south,
        east,
        north
    };
};

export const applyGeographicFilter = function (bBox) {
    return function (dispatch) {
        dispatch(setBboxFilter(bBox));
    };
};

const setPeriodFilter = function (startDate) {
  return {
    type: APPLY_PERIOD_FILTER,
    startDate
  };
};

export const applyPeriodFilter = function (startDate) {
  return function (dispatch) {
    dispatch(setPeriodFilter(startDate));
  };
};

const setLoadingState = function (loadingState) {
  return {
    type: SET_LOADING_STATE,
    loadingState
  };
};

/*
 * Asynchronous Redux action to set the loading state 
 * @param { String } loadingState
 * @returns Redux dispatch function
 */
export const applyLoadingState = function (loadingState) {
  return function (dispatch) {
    dispatch(setLoadingState(loadingState));
  };
};

/*
 * Asynchronous Redux action to fetch data from the API
 * @param { Object } 
 * @returns Redux dispatch function
 */
export const retrieveWdfnData = function ({ siteTypes, bBox, parameters, timePeriod }) {
    return function (dispatch) {
        const variables = {};

        if (Object.values(siteTypes).some(el => el))
            variables.siteType = lookupSiteTypesFullNames(siteTypes);

        if (Object.values(bBox).every(el => el)) {
            variables.bBox = `${bBox.west},${bBox.south},${bBox.east},${bBox.north}`;
        }

        if (parameters && parameters.length > 0) {
            variables.pCode = parameters;
        }

        if (timePeriod) {
          variables.startDateLo = timePeriod;
        }

        executeGraphQlQuery(mapQuery, variables)
            .then(resp => JSON.parse(resp))
            .then(({ data }) => {
                dispatch(setWdfnFeatures(data.monitoringLocations.features));
                dispatch(setCount(data.monitoringLocations.count));
            });
    };
};

export const applySiteTypeFilter = function (siteType, checked) {
  return function (dispatch) {
      dispatch(setSiteTypeFilter({ [siteType]: checked }));
  };
};

const appReducer = combineReducers({
    wdfnData
});

const MIDDLEWARES = [thunk];

export const configureStore = function (initialState) {
    initialState = {
        ...STORE_STRUCTURE,
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

export const Actions = {
  setSiteTypeFilter,
  setCount,
  setBboxFilter,
  setWdfnFeatures
};
