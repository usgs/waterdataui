
import {Actions} from 'network/store';
import {getNetworkMonitoringLocations} from 'network/selectors/network-data-selector';

import {drawSiteTable} from './data-table';
import {createMapLegend} from './legend';
import {createSiteMap, addSitesLayer} from './map';

/*
 * Creates the network map with node and attach it to the Redux store.
 * @param {Object} store - Redux store
 * @param {Object} node - DOM element
 * @param {String} networkcd
 */
export const attachToNode = function(store, node, {networkcd, extent}) {
    const fetchNetworkMonitoringLocations = store.dispatch(Actions.retrieveNetworkMonitoringLocations(networkcd));

    const map = createSiteMap(extent);
    createMapLegend(map, store);

    fetchNetworkMonitoringLocations.then(() => {
        const monitoringLocations = getNetworkMonitoringLocations(store.getState());
        addSitesLayer(map, monitoringLocations);
        drawSiteTable('link-list', monitoringLocations);
    });
};

