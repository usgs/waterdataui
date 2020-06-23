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

            if (networkList != [] && 'links' in networkList) {
                networkList = networkList['links'].filter(function (item) {
                    return item['rel'] == 'collection';
                });
                networkList.forEach(function (item) {
                    item['href'] = buildNetworkURL(item['href']);
                });
                dispatch(setNetworkList(networkList));
            } else{
                dispatch(setNetworkList([]));
            }

        });
    };
};

/*
 * function to build a network URL from a labs json url
 * @param {String} link
 * @return {String} network link
 */
export const buildNetworkURL = function(link) {
    const networkTitle = link.split('/')[6].split('?')[0];
    let baseURL = String(window.location)
    baseURL = baseURL.slice(0,baseURL.indexOf('monitoring-location'));
    return `${baseURL}networks/${networkTitle}`;
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
