import {
    fetchNldiDownstreamFlow,
    fetchNldiDownstreamSites, fetchNldiUpstreamBasin,
    fetchNldiUpstreamFlow,
    fetchNldiUpstreamSites
} from '../web-services/nldi-data';

const INITIAL_DATA = {
    upstreamFlows: [],
    downstreamFlows: [],
    upstreamSites: [],
    downstreamSites: [],
    upstreamBasin: []
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
const setNldiFeatures = function(upstreamFlows, downstreamFlows, upstreamSites, downstreamSites, upstreamBasin) {
    return {
        type: 'SET_NLDI_FEATURES',
        upstreamFlows,
        downstreamFlows,
        upstreamSites,
        downstreamSites,
        upstreamBasin
    };
};

const retrieveNldiData = function(siteno) {
    return function (dispatch) {
        const upstreamFlow = fetchNldiUpstreamFlow(siteno);
        const downstreamFlow = fetchNldiDownstreamFlow(siteno);
        const upstreamSites = fetchNldiUpstreamSites(siteno);
        const downstreamSites = fetchNldiDownstreamSites(siteno);
        const upstreamBasin = fetchNldiUpstreamBasin(siteno);

        return Promise.all([
            upstreamFlow, downstreamFlow, upstreamSites, downstreamSites, upstreamBasin
        ]).then(function(data) {
           const [upStreamLines, downStreamLines, upStreamPoints, downStreamPoints, upstreamBasin] = data;
           dispatch(setNldiFeatures(upStreamLines, downStreamLines, upStreamPoints, downStreamPoints, upstreamBasin));
        });
    };
};

/*
 * Slice reducer
 */
export const nldiDataReducer = function(nldiData=INITIAL_DATA, action) {
    switch(action.type) {
        case 'SET_NLDI_FEATURES':
            return {
                ...nldiData,
                upstreamFlows: action.upstreamFlows,
                downstreamFlows: action.downstreamFlows,
                upstreamSites: action.upstreamSites,
                downstreamSites: action.downstreamSites,
                upstreamBasin: action.upstreamBasin
            };

        default: return nldiData;
    }
};

export const Actions = {
    setNldiFeatures,
    retrieveNldiData
};
