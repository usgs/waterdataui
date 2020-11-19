const INITIAL_STATE = {
    networkSites: []
};

/*
 * Case reducers
 */
const setNetworkMonitoringLocations = function(networkData, action) {
    return {
        ...networkData,
        networkMonitoringLocations: action.networkMonitoringLocations
    };
};

/*
 * Slice reducer
 */
export const networkDataReducer = function(networkData=INITIAL_STATE, action) {
    switch(action.type) {
        case 'SET_NETWORK_MONITORING_LOCATIONS': return setNetworkMonitoringLocations(networkData, action);
        default: return networkData;
    }
};