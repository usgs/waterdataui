
import {Actions} from '../../store';
import {getNetworkSites} from '../../selectors/network-data-selector';

import {drawSiteTable} from './data-table';
import {createLegendControl, createNetworkSitesLegend} from './legend';
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
    const mapLegend = createLegendControl({
        position: 'bottomright'
    });
    mapLegend.addTo(map);

    fetchNetworkSites.then(() => {
        const networkSites = getNetworkSites(store.getState());
        addSitesLayer(map, networkSites);
        createNetworkSitesLegend(mapLegend, networkSites.length > 0);
        drawSiteTable('link-list', networkSites);
    });
};

