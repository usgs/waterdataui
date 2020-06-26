const INITIAL_STATE = {
    networkSites: []
};

/*
 * Case reducers
 */
const setNetworkFeatures = function(networkData, action) {
    return {
        networkSites: action.networkSites
    };
};

/*
 * Slice reducer
 */
export const networkDataReducer = function(networkData=INITIAL_STATE, action) {
    switch(action.type) {
        case 'SET_NETWORK_FEATURES': return setNetworkFeatures(networkData, action);
        default: return networkData;
    }
};