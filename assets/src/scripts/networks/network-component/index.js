import {select} from 'd3-selection';
import {createStructuredSelector} from 'reselect';
import {link} from '../../lib/d3-redux';
import config from '../../config';

import {Actions} from '../store/network-store';
import {createLegendControl, createNetworkLegend} from './network-legend';
import {addNetworkLayers} from './network-elements';
import {hasNetworkData, getNetworkSites}
    from '../selectors/network-data-selector';

/*
 * Creates a network map
 */
const networkMap = function(node, extent, store) {

    let gray = new window.L.layerGroup();
    window.L.esri.basemapLayer('Gray').addTo(gray);

    if (config.HYDRO_ENDPOINT) {
        gray.addLayer(new window.L.esri.TiledMapLayer({url: config.HYDRO_ENDPOINT,
            maxZoom: 22,
            maxNativeZoom: 19}));
    }

    // Create map on node
    const map = new window.L.Map('network-map', {
        center: [0, 0],
        zoom: 1,
        scrollWheelZoom: false,
        layers: gray
    });

    const pExt = JSON.parse(extent);
    const leafletExtent = [[pExt[3],pExt[2]],[pExt[1],pExt[0]]];
    map.fitBounds(leafletExtent);

    map.on('focus', () => {
        map.scrollWheelZoom.enable();
    });
    map.on('blur', () => {
        map.scrollWheelZoom.disable();
    });

    let legendControl = createLegendControl({
        position: 'bottomright'
    });
    legendControl.addTo(map);

    const updateNetworkLayers = function (node, {networkSites}) {
        addNetworkLayers(map, networkSites);
    };

    //add additional baselayer
    var baseLayers = {
        'Grayscale': gray,
        'Satellite': new window.L.esri.basemapLayer('ImageryFirefly')
    };

    //add layer control
    window.L.control.layers(baseLayers).addTo(map);

    // Add the ESRI World Hydro Reference Overlay
    if (config.HYDRO_ENDPOINT) {
        map.addLayer(new window.L.esri.TiledMapLayer({url: config.HYDRO_ENDPOINT}));
    }

    /*
     * Creates the Network legend if Network data is available, otherwise removes the Network legend if it exists.
     * @param {HTMLElement} node - element where the map is rendered
     * @param {Boolean} isNetworkAvailable
     */
    const addNetworkLegend = function(node, isNetworkAvailable) {
        createNetworkLegend(legendControl, isNetworkAvailable);
    };

    node
        .call(link(store, addNetworkLegend, hasNetworkData))
        .call(link(store, updateNetworkLayers, createStructuredSelector({
            networkSites: getNetworkSites
        })));
};

/*
 * Creates the network map with node and attach it to the Redux store.
 * @param {Object} store - Redux store
 * @param {Object} node - DOM element
 * @param {String} networkcd
 */
export const attachToNode = function(store, node, {networkcd, extent}) {

    store.dispatch(Actions.retrieveNetworkData(networkcd));

    select(node)
        .call(networkMap, extent, store);
};

