import {
    executeGraphQlQuery,
    mapQuery
} from '../web-services/graphql';

const SET_COUNT = 'SET_COUNT';
const SET_WDFN_FEATURES = 'SET_WDFN_FEATURES';
const APPLY_FILTER = 'APPLY_FILTER';
const APPLY_SITE_TYPE_FILTER = 'APPLY_SITE_TYPE_FILTER';
const APPLY_GEOGRAPHIC_FILTER = 'APPLY_GEOGRAPHIC_FILTER';

const INITIAL_DATA = {
};

//  Aggregate groundwater use; Aggregate surface-water-use; Atmosphere;
//  Estuary; Facility; Glacier; Lake, Reservoir, Impoundment; Land; Ocean;
//  Spring; Stream; Subsurface; Well; Wetland

const lookupSiteTypesFullNames = function (siteTypes) {
    const dictionary = {
        groundwater: 'Aggregate groundwater use',
        surfacewater: 'Aggregate surfacewater use',
        atmospheric: 'Atmosphere',
        spring: 'Spring'
    };

    siteTypes = Object.keys(siteTypes).map(st => {
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

        variables.startDateLo = '08-06-2015';

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
    console.log(action);
    switch(action.type) {
        case SET_WDFN_FEATURES:
            return {
                ...wdfnData,
                sites: action.features
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
