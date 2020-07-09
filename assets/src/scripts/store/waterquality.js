import {
    fetchSitesInBbox
} from '../web-services/waterquality';

const SET_WATERQUALITY_FEATURES = 'SET_WATERQUALITY_FEATURES';
const APPLY_CHARACTERISTIC_FILTER = 'APPLY_CHARACTERISTIC_FILTER';

const INITIAL_DATA = {
};

const downSelect = (oldSites, newSites) => {
    if (oldSites.sites.length > 0) {
        const oldSiteIds = oldSites.sites.map(s => s.MonitoringLocationIdentifier);
        const filteredSites = newSites.filter(s => oldSiteIds.includes(s.MonitoringLocationIdentifier));
        console.log(`Old Sites: ${oldSites.sites.length}`,
                    `New sites: ${newSites.length}`,
                    `Old AND New: ${filteredSites.length}`);
        return filteredSites;
    } else {
        return newSites;
    }
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
        type: SET_WATERQUALITY_FEATURES,
        features
    };
};

const setFilter = function (filter) {
    return {
        type: APPLY_CHARACTERISTIC_FILTER,
        filter
    };
};

export const applyCharacteristicFilter = function (characteristicName, filterValue) {
    return function (dispatch) {
        dispatch(setFilter({ [characteristicName]: filterValue }));
    };
};

export const retrieveWaterqualityData = function(bbox, characteristicName) {
    return function (dispatch) {
        const features = fetchSitesInBbox(bbox, characteristicName);
        return Promise.all([
            features
        ]).then(function(data) {
           const [features] = data;
           dispatch(setWaterqualityFeatures(features));
        });
    };
};

/*
 * Slice reducer
 */
export const waterqualityDataReducer = function(waterqualityData=INITIAL_DATA, action) {
    switch(action.type) {
        case SET_WATERQUALITY_FEATURES:
            return {
                sites: downSelect(waterqualityData, action.features)
            };
        case APPLY_CHARACTERISTIC_FILTER:
            return {
                ...waterqualityData,
                filters: {
                characteristics: {
                        ...action.filter      
                    }
                }
            };
        default: return waterqualityData;
    }
};

export const Actions = {
    applyCharacteristicFilter,
    setWaterqualityFeatures,
    retrieveWaterqualityData
};
