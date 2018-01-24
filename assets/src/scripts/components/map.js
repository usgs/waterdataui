const { map: createMap, marker: createMarker } = require('leaflet');
const { BasemapLayer, TiledMapLayer } = require('esri-leaflet');


const HYDRO_URL = 'https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Esri_Hydro_Reference_Overlay/MapServer';


function attachToNode(node, {latitude, longitude, zoom}) {
    // Create map on node
    const map = createMap(node, {
        center: [latitude, longitude],
        zoom: zoom
    });

    // Add a gray basemap layer
    map.addLayer(new BasemapLayer('Gray'));

    // Add the ESRI World Hydro Reference Overlay
    map.addLayer(new TiledMapLayer({url: HYDRO_URL}));

    // Add a marker at the site location
    createMarker([latitude, longitude]).addTo(map);
}


module.exports = {attachToNode};
