import {createSelector} from 'reselect';

export const getNetworkMonitoringLocations = state => state.networkData.networkMonitoringLocations;

/*
 * Provides a function which returns True if network data is not empty.
 */
export const hasNetworkMonitoringLocations = createSelector(
    getNetworkMonitoringLocations,

    (networkMonitoringLocations) =>
        networkMonitoringLocations.length > 0
);