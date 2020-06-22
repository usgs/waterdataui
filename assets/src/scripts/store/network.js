import {
    fetchObservationItem
} from '../web-services/observations';

const INITIAL_DATA = {
    networkList: [],
};
import config from '../config';

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
        return fetchObservationItem(siteno).then(function (networkList) {
            networkList = networkList['links'].filter(function(item) {
               return item['rel'] == 'collection';
            });
            networkList.forEach(function(item) {
                const networkTitle = item['href'].split('/')[6].split('?')[0];
                item['href'] =  'https://waterdata.usgs.gov/networks/' + networkTitle;
            });
            dispatch(setNetworkList(networkList));
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
                networkList: action.networkList,
            };

        default: return networkData;
    }
};

export const Actions = {
    setNetworkList,
    retrieveNetworkListData
};
