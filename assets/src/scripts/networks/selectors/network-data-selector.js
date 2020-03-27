import {createSelector} from 'reselect';

export const getNetworkSites = state => state.networkData.networkSites;

/*
 * Provides a function which returns True if network data is not empty.
 */
export const hasNetworkData = createSelector(
    getNetworkSites,

    (networkSites) =>
        networkSites.length > 0
);