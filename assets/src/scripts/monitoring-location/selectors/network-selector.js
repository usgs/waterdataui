import {createSelector} from 'reselect';

export const getNetworkList = state => state.networkData.networkList || [];

/*
 * Provides a function which returns True if network data is not empty.
 */
export const hasNetworkData = createSelector(
    getNetworkList,
    (getNetworkList) =>
        getNetworkList.length > 0
);