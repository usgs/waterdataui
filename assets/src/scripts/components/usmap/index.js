import {select} from 'd3-selection';

import config from '../../config';

/*
 * Creates a site map
 */
const siteMap = function(node, {latitude, longitude, zoom}, store) {
    let gray = L.layerGroup();
    L.esri.basemapLayer('Gray').addTo(gray);

    // Create map on node
    const map = L.map('site-map', {
        center: [latitude, longitude],
        zoom: zoom,
        scrollWheelZoom: false,
        layers: gray
    });

    map.on('focus', () => {
        map.scrollWheelZoom.enable();
    });

    map.on('blur', () => {
        map.scrollWheelZoom.disable();
    });

    //add additional baselayer
    var baseLayers = {
        'Grayscale': gray,
        'Satellite': L.esri.basemapLayer('ImageryFirefly')
    };

    //add layer control
    L.control.layers(baseLayers).addTo(map);

    // Add the ESRI World Hydro Reference Overlay
    if (config.HYDRO_ENDPOINT) {
        map.addLayer(new L.esri.TiledMapLayer({url: config.HYDRO_ENDPOINT}));
    }
};

/*
 * Creates the site map with node and attach it to the Redux store.
 * @param {Object} store - Redux store
 * @param {Object} node - DOM element
 * @param {Number} latitude - latitude of siteno
 * @param {Number} longitude - longitude of siteno
 * @param {Number} zoom - zoom level to initially set the map to
 */
export const attachToNode = function(store, node, {latitude, longitude, zoom}) {
    select(node)
        .call(siteMap, {latitude, longitude, zoom}, store);
};

