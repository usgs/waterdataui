const { select } = require('d3-selection');
const { createStructuredSelector } = require('reselect');

const { map: createMap, marker: createMarker } = require('leaflet');
const { BasemapLayer, TiledMapLayer, dynamicMapLayer, Util } = require('esri-leaflet');

const { link, provide } = require('../../lib/redux');

const { FIM_ENDPOINT, HYDRO_ENDPOINT } = require('../../config');
const { FLOOD_EXTENTS_ENDPOINT, FLOOD_BREACH_ENDPOINT, FLOOD_LEVEE_ENDPOINT } = require('../../floodData');
const { Actions } = require('../../store');

const { createLegendControl, createFIMLegend } = require('./legend');


const fimAvailableSelector = state => state.floodStages.length > 0;

const getLayerDefs = function(layerNo, siteno, stage) {
   const stageQuery = stage ? ` AND STAGE = ${stage}` : '';
   return `${layerNo}: USGSID = '${siteno}'${stageQuery}`;
};


/*
 * Creates a site map
 */
const siteMap = function(node, {siteno, latitude, longitude, zoom}) {
    // Create map on node
    node.append('div')
        .attr('id', 'site-map');
    const map = createMap('site-map', {
        center: [latitude, longitude],
        zoom: zoom,
        scrollWheelZoom: false
    });

    map.on('focus', () => {
        map.scrollWheelZoom.enable();
    });
    map.on('blur', () => {
        map.scrollWheelZoom.disable();
    });

    let floodLayer = dynamicMapLayer({
        url: FLOOD_EXTENTS_ENDPOINT,
        layers: [0],
        f: 'image',
        format: 'png8'
    });
    let breachLayer = dynamicMapLayer({
        url: FLOOD_BREACH_ENDPOINT,
        layers: [0],
        f: 'image',
        format: 'png8'
    });
    let leveeLayer = dynamicMapLayer({
        url: FLOOD_LEVEE_ENDPOINT,
        layers: [0, 1],
        f: 'image',
        format: 'png8',
        layerDefs: `${getLayerDefs(0, siteno)};${getLayerDefs(1, siteno)}`
    });

    let legendControl = createLegendControl({
        position: 'bottomright'
    });
    legendControl.addTo(map);


    const updateFloodLayers = function (node, {stages, gageHeight}) {
        if (gageHeight) {
            const layerDefs = getLayerDefs(0, siteno, gageHeight);
            floodLayer.setLayerDefs(layerDefs);
            breachLayer.setLayerDefs(layerDefs);
        }
        if (stages.length === 0) {
            if (map.hasLayer(floodLayer)) {
                map.removeLayer(floodLayer);
                map.removeLayer(breachLayer);
                map.removeLayer(leveeLayer);
            }
        } else {
            if (!map.hasLayer(floodLayer)) {
                map.addLayer(floodLayer);
                map.addLayer(breachLayer);
                map.addLayer(leveeLayer);
            }
        }
    };


    const updateMapExtent = function (node, {extent}) {
        if (Object.keys(extent).length > 0) {
            map.fitBounds(Util.extentToBounds(extent).extend([latitude, longitude]));
        }
    };


    /*
     * Creates the FIM legend if FIM data is available, otherwise removes the FIM legend if it exists.
     * @param {HTMLElement} node - element where the map is rendered
     * @param {Boolean} isFIMAvailable
     */
    const addFIMLegend = function(node, isFIMAvailable) {
        createFIMLegend(legendControl, isFIMAvailable);
    };


    const addFimLink = function (node, isFIMAvailable) {
        if (isFIMAvailable) {
            node.append('a')
                .attr('id', 'fim-link')
                .attr('href', `${FIM_ENDPOINT}?site_no=${siteno}`)
                .attr('target', '_blank')
                .attr('rel', 'noopener')
                .text('Provisional Flood Information');
        } else {
            node.select('#fim-link').remove();
        }
    };

    // Add a gray basemap layer
    map.addLayer(new BasemapLayer('Gray'));

    // Add the ESRI World Hydro Reference Overlay
    if (HYDRO_ENDPOINT) {
        map.addLayer(new TiledMapLayer({url: HYDRO_ENDPOINT}));
    }

    // Add a marker at the site location
    createMarker([latitude, longitude]).addTo(map);

    node
        .call(link(updateFloodLayers, createStructuredSelector({
            stages: (state) => state.floodStages,
            gageHeight: (state) => state.gageHeight
        })))
        .call(link(updateMapExtent, createStructuredSelector({
            extent: (state) => state.floodExtent
        })))
        .call(link(addFIMLegend, fimAvailableSelector))
        .call(link(addFimLink, fimAvailableSelector));
};

/*
 * Creates the site map with node and attach it to the Redux store.
 * @param {Object} store - Redux store
 * @param {Object} node - DOM element
 * @param {String} siteno
 * @param {Number} latitude - latitude of siteno
 * @param {Number} longitude - longitude of siteno
 * @param {Number} zoom - zoom level to initially set the map to
 */
function attachToNode(store, node, {siteno, latitude, longitude, zoom}) {

    store.dispatch(Actions.retrieveFloodData(siteno));

    select(node)
        .call(provide(store))
        .call(siteMap, {siteno, latitude, longitude, zoom});
}

module.exports = {attachToNode};
