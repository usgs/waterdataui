import {fetchNetworkSites} from '../networks/network-data';

import {uiReducer as ui} from '../store/ui-reducer';
import {networkDataReducer as networkData} from './network-data-reducer';
import {configureReduxStore} from '../store';

export const Actions = {
    retrieveNetworkData(networkCd) {
        return function(dispatch) {
            const networkSites = fetchNetworkSites(networkCd);

            return Promise.all( [networkSites]
            ).then(function(data){
                const [networkSites] = data;
                dispatch(Actions.setNetworkFeatures(networkSites));
            });
        };
    },
    setNetworkFeatures(networkSites) {
         return {
            type: 'SET_NETWORK_FEATURES',
            networkSites
        };
    },
    resizeUI(windowWidth, width) {
        return {
            type: 'RESIZE_UI',
            windowWidth,
            width
        };
    }
};

const reducers = {
    ui,
    networkData
};

export const configureStore = function(initialState){

     initialState = {
         networkData: {
             networkSites: []
         },
         ui: {
             windowWidth: 1024,
             width: 800
         },
         ...initialState
     };

    return configureReduxStore(initialState, reducers);
};