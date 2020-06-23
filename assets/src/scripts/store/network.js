import {
    fetchMonitoringLocationMetaData
} from '../web-services/observations';

const INITIAL_DATA = {
    networkList: []
};



/*
 * Synchronous Redux actions to save the observation's networks data
 * @param {Array of GeoJSON Object} networkList
 * @return {Object} Redux action
 */
const setNetworkList = function(networkList) {
    return {
        type: 'SET_NETWORK_LIST',
        networkList
    };
};

const retrieveNetworkListData = function(siteno) {
     return function (dispatch) {
        return fetchMonitoringLocationMetaData(siteno).then(function (networkList) {

            if (networkList != [] && 'links' in networkList) {
                networkList = networkList['links'].filter(function (item) {
                    return item['rel'] == 'collection';
                });
                dispatch(setNetworkList(networkList));
            } else{
                dispatch(setNetworkList([]));
            }

        });
    };
};

/*
 * Slice reducer
 */
export const networkDataReducer = function(networkData=INITIAL_DATA, action) {
    switch(action.type) {
        case 'SET_NETWORK_LIST':
            return {
                ...networkData,
                networkList: action.networkList
            };

        default: return networkData;
    }
};

export const Actions = {
    setNetworkList,
    retrieveNetworkListData
};
