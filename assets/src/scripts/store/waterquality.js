import {
    fetchSitesInBbox
} from '../web-services/waterquality';

const SET_WATERQUALITY_FEATURES = 'SET_WATERQUALITY_FEATURES';

const INITIAL_DATA = {
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

export const retrieveWaterqualityData = function(bbox) {
    return function (dispatch) {
        const features = fetchSitesInBbox(bbox);
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
                // ...observationsData,
                ...action.features
            };

        default: return waterqualityData;
    }
};

export const Actions = {
    setWaterqualityFeatures,
    retrieveWaterqualityData
};
