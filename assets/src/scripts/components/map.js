const { map: createMap, marker: createMarker } = require('leaflet');
const { BasemapLayer, TiledMapLayer, dynamicMapLayer, Util } = require('esri-leaflet');
const { FLOOD_EXTENTS_ENDPOINT, FLOOD_BREACH_ENDPOINT, FLOOD_LEVEE_ENDPOINT, fetchFloodFeatures, fetchFloodExtent } = require('../flood_data');
const { Actions } = require('../store');

const HYDRO_URL = 'https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Esri_Hydro_Reference_Overlay/MapServer';

const getLayerDefs = function(layerNo, {siteno, stage=null}) {
   const stageQuery = stage ? ' AND STAGE = ${stage}' : '';
   return `${layerNo}: USGSID = '${siteno}'${stageQuery}`;
};

function attachToNode(store, node, {siteno, latitude, longitude, zoom}) {

    store.dispatch(Actions.retrieveFloodData(siteno));

    // Create map on node
    const map = createMap('site-map', {
        center: [latitude, longitude],
        zoom: zoom
    });
    let sliderContainer = node.getElementsByClassName('slider-wrapper')[0];
    let slider = sliderContainer.getElementsByTagName('input')[0];
    let stage = sliderContainer.getElementsByClassName('range-value')[0];

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
        layerDefs: `0:USGSID = '${siteno}';1:USGSID = '${siteno}'`
    });


    let currentData = {
        floodStages: [],
        floodExtent: {},
        gageHeight: null
    };

    const updateFloodLayers = function() {
        let previousData = currentData;
        let state = store.getState();
        currentData = {
            floodStages: state.floodStages,
            floodExtent: state.floodExtent,
            gageHeight: state.gageHeight
        };

        if (previousData.floodStages != currentData.floodStages) {
            if (currentData.floodStages.length === 0) {
                if (map.hasLayer(floodLayer)) {
                    map.removeLayer(floodLayer);
                    map.removeLayer(breachLayer);
                    map.removeLayer(leveeLayer);
                }
            } else {
                floodLayer.setLayerDefs(`0:USGSID = '${siteno}' AND STAGE = ${currentData.gageHeight}`);
                breachLayer.setLayerDefs(`0:USGSID = '${siteno}' AND STAGE = ${currentData.gageHeight}`);
                if (!map.hasLayer(floodLayer)) {
                    map.addLayer(floodLayer);
                    map.addLayer(breachLayer);
                    map.addLayer(leveeLayer);

                    // Also set slider
                    slider.min = 0;
                    slider.max = currentData.floodStages.length - 1;
                    slider.value = 0;
                    sliderContainer.removeAttribute('hidden');
                }
                stage.innerHTML = currentData.gageHeight;
            }
        }

        if (Object.keys(currentData.floodExtent).length > 0  && previousData.floodExtent != currentData.floodExtent) {
            map.fitBounds(Util.extentToBounds(currentData.floodExtent));
        }

        if (previousData.gageHeight != currentData.gageHeight) {
            floodLayer.setLayerDefs(`0:USGSID = '${siteno}' AND STAGE = ${currentData.gageHeight}`);
            breachLayer.setLayerDefs(`0:USGSID = '${siteno}' AND STAGE = ${currentData.gageHeight}`);
            stage.innerHTML = currentData.gageHeight;
        }
    };

    // Add a gray basemap layer
    map.addLayer(new BasemapLayer('Gray'));

    // Add the ESRI World Hydro Reference Overlay
    map.addLayer(new TiledMapLayer({url: HYDRO_URL}));

    // Add a marker at the site location
    createMarker([latitude, longitude]).addTo(map);

    store.subscribe(updateFloodLayers);

    slider.addEventListener('change', function(event) {
        store.dispatch(Actions.setGageHeight(event.target.value));
    });
}


module.exports = {attachToNode};
