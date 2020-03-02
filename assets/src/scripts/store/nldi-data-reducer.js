const INITIAL_STATE = {
    upstreamFlows: [],
    downstreamFlows: [],
    upstreamSites: [],
    downstreamSites: [],
    upstreamBasin: []
};

/*
 * Case reducers
 */
const setNldiFeatures = function(nldiData, action) {
    return {
        upstreamFlows: action.upstreamFlows,
        downstreamFlows: action.downstreamFlows,
        upstreamSites: action.upstreamSites,
        downstreamSites: action.downstreamSites,
        upstreamBasin: action.upstreamBasin
    };
};

/*
 * Slice reducer
 */
export const nldiDataReducer = function(nldiData=INITIAL_STATE, action) {
    switch(action.type) {
        case 'SET_NLDI_FEATURES': return setNldiFeatures(nldiData, action);
        default: return nldiData;
    }
};
