
import {Actions} from '../../store';
import {getNetworkSites} from '../../selectors/network-data-selector';

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
    const fetchNetworkSites = store.dispatch(Actions.retrieveNetworkData(networkcd));

    const map = createSiteMap(extent);
    const legend = createMapLegend(store);
    map.addControl(legend);

    fetchNetworkSites.then(() => {
        const networkSites = getNetworkSites(store.getState());
        addSitesLayer(map, networkSites);
        drawSiteTable('link-list', networkSites);
    });
};

