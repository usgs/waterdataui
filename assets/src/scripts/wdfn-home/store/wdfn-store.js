import {applyMiddleware, createStore, combineReducers, compose} from 'redux';
import {default as thunk} from 'redux-thunk';

import {executeGraphQlQuery, mapQuery} from '../../web-services/graphql';

import {wdfnDataReducer as wdfnData} from './wdfn-data-reducer';

export const SET_COUNT = 'SET_COUNT';
export const SET_WDFN_FEATURES = 'SET_WDFN_FEATURES';
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
          }
      },
      count: 0,
      sites: []
  }
};

const lookupSiteTypesFullNames = function (siteTypes) {
    // Translate keys into WQP understands
    const dictionary = {
        groundwater: 'Aggregate groundwater use',
        surfacewater: 'Aggregate surface-water-use',
        atmospheric: 'Atmosphere',
        spring: 'Spring',
        other: ['Estuary', 'Facility', 'Glacier']
    };

    siteTypes = Object.keys(siteTypes).flatMap(st => {
        if (siteTypes[st]) return dictionary[st];
    })
        .filter(st => st);

    return siteTypes;
};

const setCount = function (count) {
    return {
        type: SET_COUNT,
        count
    };
};

const setWdfnFeatures = function(features) {
    return {
        type: SET_WDFN_FEATURES,
        features
    };
};

const setSiteTypeFilter = function (filter) {
    return {
        type: APPLY_SITE_TYPE_FILTER,
        filter
    };
};

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


export const retrieveWdfnData = function ({ siteTypes, bBox, timePeriod }) {
    return function (dispatch) {
        const variables = {};

        if (Object.values(siteTypes).some(el => el))
            variables.siteType = lookupSiteTypesFullNames(siteTypes);

        if (Object.values(bBox).every(el => el)) {
            variables.bBox = `${bBox.west},${bBox.south},${bBox.east},${bBox.north}`;
        }

        executeGraphQlQuery(mapQuery, variables)
            .then(resp => JSON.parse(resp))
            .then(({ data }) => {
                dispatch(setWdfnFeatures(data.allFeatures.features));
                dispatch(setCount(data.allFeatures.count));
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
