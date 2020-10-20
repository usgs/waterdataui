
import {Actions} from 'network/store';
import {getNetworkSites} from 'network/selectors/network-data-selector';

import {drawSiteTable} from 'network/components/network-sites/data-table';
import {createMapLegend} from 'network/components/network-sites/legend';
import {createSiteMap, addSitesLayer} from 'network/components/network-sites/map';

/*
 * Creates the network map with node and attach it to the Redux store.
 * @param {Object} store - Redux store
 * @param {Object} node - DOM element
 * @param {String} networkcd
 */
export const attachToNode = function(store, node, {networkcd, extent}) {
    const fetchNetworkSites = store.dispatch(Actions.retrieveNetworkData(networkcd));

    const map = createSiteMap(extent);
    createMapLegend(map, store);

    fetchNetworkSites.then(() => {
        const networkSites = getNetworkSites(store.getState());
        addSitesLayer(map, networkSites);
        drawSiteTable('link-list', networkSites);
    });
};

