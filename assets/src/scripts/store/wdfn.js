import {
    executeGraphQlQuery,
    mapQuery
} from '../web-services/graphql';

const SET_WDFN_FEATURES = 'SET_WDFN_FEATURES';
const APPLY_FILTER = 'APPLY_FILTER';
const APPLY_SITE_TYPE_FILTER = 'APPLY_SITE_TYPE_FILTER';

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
            variables.siteTypes = lookupSiteTypesFullNames(siteTypes);

        executeGraphQlQuery(mapQuery, variables)
            .then(resp => resp.json())
            .then(json => console.log(json));
    };
    // return function (dispatch) {
    //     const features = fetchSitesInBbox(bbox, characteristicName);
    //     return Promise.all([
    //         features
    //     ]).then(function(data) {
    //        const [features] = data;
    //        dispatch(setWaterqualityFeatures(features));
    //     });
    // };
};

/*
 * Slice reducer
 */
export const wdfnDataReducer = function(wdfnData=INITIAL_DATA, action) {
    switch(action.type) {
        case SET_WDFN_FEATURES:
            return {
                sites: downSelect(wdfnData, action.features)
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
        default: return wdfnData;
    }
};

export const Actions = {
    applySiteTypeFilter,
    setWaterqualityFeatures,
    retrieveWdfnData
};
