const HYDRO_URL = 'https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Esri_Hydro_Reference_Overlay/MapServer';


function attachToNode(node, {latitude, longitude, zoom}) {
    // Create map on node
    const map = L.map(node, {
        center: [latitude, longitude],
        zoom: zoom
    });

    // Basemap
    L.esri.basemapLayer('Gray').addTo(map);

    // Add a marker at the site location
    L.marker([latitude, longitude]).addTo(map);

    // Add the ESRI World Hydro Reference Overlay
    L.esri.tiledMapLayer({url: HYDRO_URL}).addTo(map);
}


module.exports = {attachToNode};
