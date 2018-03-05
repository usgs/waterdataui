const { map: createMap, marker: createMarker } = require('leaflet');
const { BasemapLayer, TiledMapLayer, dynamicMapLayer, Util } = require('esri-leaflet');

const {get} = require('../ajax');



const HYDRO_URL = 'https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Esri_Hydro_Reference_Overlay/MapServer';
const fetchFloodInformation = function(siteno) {
    const FIM_QUERY = `${window.FIM_ENDPOINT}floodExtents/MapServer/0/query?where=USGSID+%3D+%27${siteno}%27&outFields=USGSID%2C+STAGE&returnGeometry=false&returnTrueCurves=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=falsereturnDistinctValues=false&f=json`;

    return get(FIM_QUERY)
        .then((response) => {
            const respJson = JSON.parse(response);
            return respJson.features ? respJson.features : [];
        })
        .catch(reason => {
            console.log(`Unable to get FIM data for ${siteno} with reason: ${reason}`);
            return [];
        });
};

const fetchFloodExtent = function(siteno){
    const FIM_QUERY = `${window.FIM_ENDPOINT}floodExtents/MapServer/0/query?where=USGSID+%3D+%27${siteno}%27&returnExtentOnly=true&outSR=4326&f=json`;
    return get(FIM_QUERY)
        .then((response) => {
            return JSON.parse(response);
        })
        .catch(reason => {
            console.log(`Unable to get FIM data for ${siteno} with reason: ${reason}`);
            return [];
        });
};

function attachToNode(node, {siteno, latitude, longitude, zoom}) {

    let fetchPromise = fetchFloodInformation(siteno);
    let fetchFloodExtentPromise = fetchFloodExtent(siteno);
    // Create map on node
    const map = createMap('site-map', {
        center: [latitude, longitude],
        zoom: zoom
    });
    let sliderContainer = node.getElementsByClassName('slider-wrapper')[0];
    let slider = sliderContainer.getElementsByTagName('input')[0];
    let stage = sliderContainer.getElementsByClassName('range-value')[0];

    // Add a gray basemap layer
    map.addLayer(new BasemapLayer('Gray'));

    // Add the ESRI World Hydro Reference Overlay
    map.addLayer(new TiledMapLayer({url: HYDRO_URL}));

    // Add a marker at the site location
    createMarker([latitude, longitude]).addTo(map);

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
                url: `${window.FIM_ENDPOINT}floodExtents/MapServer/`,
                layers: [0],
                f: 'image',
                format: 'png8',
                layerDefs: `0:USGSID = '${siteno}' AND STAGE = ${stages[0]}`
            });
            let breachLayer = dynamicMapLayer({
                url: `${window.FIM_ENDPOINT}breach/MapServer/`,
                layers: [0],
                f: 'image',
                format: 'png8',
                layerDefs: `0:USGSID = '${siteno}' AND STAGE = ${stages[0]}`
            });
            let supplyLayer = dynamicMapLayer({
                url: `${window.FIM_ENDPOINT}suppLyrs/MapServer/`,
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
            supplyLayer.addTo(map);

            slider.addEventListener('change', function(event) {
               stage.innerHTML = stages[event.target.value];
               floodLayer.setLayerDefs(`0:USGSID = '${siteno}' AND STAGE = ${stages[event.target.value]}`);
               breachLayer.setLayerDefs(`0:USGSID = '${siteno}' AND STAGE = ${stages[event.target.value]}`);
            });
        }
    });
}


module.exports = {attachToNode};
