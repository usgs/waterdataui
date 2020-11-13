import {applyMiddleware, createStore, combineReducers, compose} from 'redux';
import {default as thunk} from 'redux-thunk';

import {fetchNetworkFeatures} from 'ui/web-services/network-data';

import {networkDataReducer as networkData} from 'network/store/network-data-reducer';

export const Actions = {
    retrieveNetworkData(networkCd) {
        return function(dispatch) {
            return fetchNetworkFeatures(networkCd)
                .then(function(features) {
                    dispatch(Actions.setNetworkFeatures(features));
            });
        };
    },
    setNetworkFeatures(networkSites) {
         return {
            type: 'SET_NETWORK_FEATURES',
            networkSites
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
            networkSites: []
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