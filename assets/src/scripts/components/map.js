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

    let currentData;

    const updateFloodLayers = function() {
        let previousData = currentData;
        let state = store.getState();
        currentData = {
            floodFeatures: state.floodFeatures;
            floodExtent: state.floodExtent;
        };
        if (previousData != currentData) {
            if (currentData.floodFeatures.length === 0) {

            }
            floodLayer.setLayerDefs
        }
    }

    // Add a gray basemap layer
    map.addLayer(new BasemapLayer('Gray'));

    // Add the ESRI World Hydro Reference Overlay
    map.addLayer(new TiledMapLayer({url: HYDRO_URL}));

    // Add a marker at the site location
    createMarker([latitude, longitude]).addTo(map);

    store.subscribe(updateFloodLayers)l

    fetchPromise.then((features) => {
        console.log('Got feature count ' + features.length);
        if (features.length > 0) {
            let stages = features.map((feature) => feature.attributes.STAGE);

            stages.sort((a, b) => a - b);
            slider.min = 0;
            slider.max = stages.length - 1;
            slider.value = 0;
            stage.innerHTML = stages[0];
            sliderContainer.removeAttribute('hidden');

            let floodLayer = dynamicMapLayer({
                url: FLOOD_EXTENTS_ENDPOINT,
                layers: [0],
                f: 'image',
                format: 'png8',
                layerDefs: `0:USGSID = '${siteno}' AND STAGE = ${stages[0]}`
            });
            let breachLayer = dynamicMapLayer({
                url: FLOOD_BREACH_ENDPOINT,
                layers: [0],
                f: 'image',
                format: 'png8',
                layerDefs: `0:USGSID = '${siteno}' AND STAGE = ${stages[0]}`
            });
            let leveeLayer = dynamicMapLayer({
                url: FLOOD_LEVEE_ENDPOINT,
                layers: [0, 1],
                f: 'image',
                format: 'png8',
                layerDefs: `0:USGSID = '${siteno}';1:USGSID = '${siteno}'`
            });

            fetchFloodExtentPromise.then((resp) => {
                map.fitBounds(Util.extentToBounds(resp.extent));
            });
            breachLayer.addTo(map);
            floodLayer.addTo(map);
            leveeLayer.addTo(map);

            slider.addEventListener('change', function(event) {
               stage.innerHTML = stages[event.target.value];
               floodLayer.setLayerDefs(`0:USGSID = '${siteno}' AND STAGE = ${stages[event.target.value]}`);
               breachLayer.setLayerDefs(`0:USGSID = '${siteno}' AND STAGE = ${stages[event.target.value]}`);
            });
        }
    });
}


module.exports = {attachToNode};
