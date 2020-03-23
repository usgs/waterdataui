import { select } from 'd3-selection';
import { createStructuredSelector } from 'reselect';
import { map as createMap, control, layerGroup } from 'leaflet';
import { TiledMapLayer, basemapLayer } from 'esri-leaflet/src/EsriLeaflet';
import { link } from '../lib/d3-redux';
import config from '../config';

import { Actions } from '../store';
import { createLegendControl, createNetworkLegend } from './network-legend';
import { addNetworkLayers} from './networkMapping';
import { hasNetworkData, getNetworkSites}
    from '../selectors/network-data-selector';

/*
 * Creates a network map
 */
const networkMap = function(node, {extent}, store) {

    let gray = layerGroup();
    basemapLayer('Gray').addTo(gray);

    if (config.HYDRO_ENDPOINT) {
        gray.addLayer(new TiledMapLayer({url: config.HYDRO_ENDPOINT,
            maxZoom: 22,
            maxNativeZoom: 19}));
    }

    // Create map on node
    const map = createMap('network-map', {
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
        'Satellite': basemapLayer('ImageryFirefly')
    };

    //add layer control
    control.layers(baseLayers).addTo(map);

    // Add the ESRI World Hydro Reference Overlay
    if (config.HYDRO_ENDPOINT) {
        map.addLayer(new TiledMapLayer({url: config.HYDRO_ENDPOINT}));
    }

    // // Add a marker at the site location
    // createMarker([latitude, longitude]).addTo(map);

    /*
     * Creates the NLDI legend if NLDI data is available, otherwise removes the NLDI legend if it exists.
     * @param {HTMLElement} node - element where the map is rendered
     * @param {Boolean} isNldiAvailable
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
        .call(networkMap, {extent}, store);
};

