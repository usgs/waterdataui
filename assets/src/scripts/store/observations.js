import {
    fetchSitesInBbox
} from '../web-services/observations';

const SET_OBSERVATIONS_FEATURES = 'SET_OBSERVATIONs_FEATURES';

const INITIAL_DATA = {
    features: {}
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
const setObservationsFeatures = function(features) {
    return {
        type: SET_OBSERVATIONS_FEATURES,
        features
    };
};

export const retrieveObservationsData = function(bbox) {
    return function (dispatch) {
        const features = fetchSitesInBbox(bbox);
        return Promise.all([
            features
        ]).then(function(data) {
           const [features] = data;
           dispatch(setObservationsFeatures(features));
        });
    };
};

/*
 * Slice reducer
 */
export const observationsDataReducer = function(observationsData=INITIAL_DATA, action) {
    switch(action.type) {
        case SET_OBSERVATIONS_FEATURES:
            return {
                // ...observationsData,
                ...action.features
            };

        default: return observationsData;
    }
};

export const Actions = {
    setObservationsFeatures,
    retrieveObservationsData
};
