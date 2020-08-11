import {
    executeGraphQlQuery,
    mapQuery
} from '../web-services/graphql';

const SET_COUNT = 'SET_COUNT';
const SET_WDFN_FEATURES = 'SET_WDFN_FEATURES';
const APPLY_SITE_TYPE_FILTER = 'APPLY_SITE_TYPE_FILTER';
const APPLY_GEOGRAPHIC_FILTER = 'APPLY_GEOGRAPHIC_FILTER';

const INITIAL_DATA = {
};

// other: ['Estuary', 'Facility', 'Glacier', 'Lake', 'Reservoir', 'Impoundment', 'Land', 'Ocean', 'Stream', 'Subsurface', 'Well', 'Wetland']

const lookupSiteTypesFullNames = function (siteTypes) {
    const dictionary = {
        groundwater: 'Aggregate groundwater use',
        surfacewater: 'Aggregate surfacewater use',
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

/*
 * Synchronous Redux actions to save the nldi data
 * @param {Array of GeoJSON Object} upstreamFlows
 * @param {Array of GeoJSON Object} downstreamFlows
 * @param {Array of GeoJSON Object} upstreamSites
 * @param {Array of GeoJSON Object} downstreamSites
 * @param {GeoJSON Object} upstreamBasin
 * @return {Object} Redux action
 */
const setWaterqualityFeatures = function(features) {
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

export const applySiteTypeFilter = function (siteType, checked) {
    return function (dispatch) {
        dispatch(setSiteTypeFilter({ [siteType]: checked }));
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

        variables.startDateLo = '08-06-2015';
        console.log(variables);

        executeGraphQlQuery(mapQuery, variables)
            .then(({ data }) => {
                dispatch(setWaterqualityFeatures(data.allFeatures.features));
                dispatch(setCount(data.allFeatures.count));
            });
    };
};

/*
 * Slice reducer
 */
export const wdfnDataReducer = function(wdfnData=INITIAL_DATA, action) {
    switch(action.type) {
        case SET_WDFN_FEATURES:
            return {
                ...wdfnData,
                sites: action.features
            };
        case APPLY_GEOGRAPHIC_FILTER:
            return {
                ...wdfnData,
                filters: {
                    ...wdfnData.filters,
                    bBox: {
                        west: action.west,
                        east: action.east,
                        north: action.north,
                        south: action.south
                    }
                }
            };
        case APPLY_SITE_TYPE_FILTER:
            return {
                ...wdfnData,
                filters: {
                    ...wdfnData.filters,
                    siteTypes: {
                        ...wdfnData.filters.siteTypes,
                        ...action.filter
                    }
                }
            };
        case SET_COUNT:
            return {
                ...wdfnData,
                count: action.count
            };
        default: return wdfnData;
    }
};

export const Actions = {
    applySiteTypeFilter,
    setWaterqualityFeatures,
    retrieveWdfnData
};
