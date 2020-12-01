import {applyMiddleware, createStore, combineReducers, compose} from 'redux';
import {default as thunk} from 'redux-thunk';

import {fetchNetworkMonitoringLocations} from 'ui/web-services/observations';

import {networkDataReducer as networkData} from './network-data-reducer';

export const Actions = {
    retrieveNetworkMonitoringLocations(networkCd) {
        return function(dispatch) {
            return fetchNetworkMonitoringLocations(networkCd)
                .then(function(features) {
                    dispatch(Actions.setNetworkMonitoringLocations(features));
            });
        };
    },
    setNetworkMonitoringLocations(networkMonitoringLocations) {
         return {
            type: 'SET_NETWORK_MONITORING_LOCATIONS',
            networkMonitoringLocations
        };
    }
};

const appReducer = combineReducers({
    networkData
});

const MIDDLEWARES = [thunk];

export const configureStore = function(initialState) {
    initialState = {
        networkData: {
            networkMonitoringLocations: []
        },
        ...initialState
    };

    let enhancers;
    if (window.__REDUX_DEVTOOLS_EXTENSION__) {
        enhancers = compose(
            applyMiddleware(...MIDDLEWARES),
            window.__REDUX_DEVTOOLS_EXTENSION__({serialize: true})
        );
    } else {
        enhancers = applyMiddleware(...MIDDLEWARES);
    }

    return createStore(
        appReducer,
        initialState,
        enhancers
    );
};