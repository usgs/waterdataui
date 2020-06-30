
/*
 * Creates a map within divID, sets the center and an initial zoom level of  and sets initialESRIBaseLayer
 * as the initial base layer along with . If no ESRI base layer is desired, set to null
 * @param {String} divId - id of div element where the map will be rendered
 * @param {Object} options
     * @prop {L.LatLng} center
     * @prop {Number} zoom
     * @prop {String} esriBaseLayer - Should be a defined ESRI base layer
     *      see https://esri.github.io/esri-leaflet/api-reference/layers/basemap-layer.html#basemaps
     * @prop {String} tiledBaseMapLayer - To be added to initial base layer
 * @return {L.map}
 */
export const createMap = function(divId, {center=[0,0], zoom=1}) {
    const map = L.map(divId, {
        center: center,
        zoom: zoom,
        scrollWheelZoom: false
    });

    map.on('focus', () => {
        map.scrollWheelZoom.enable();
    });
    map.on('blur', () => {
        map.scrollWheelZoom.disable();
    });

    return map;
};

/*
 * Create a base layer group using the esriBaseMapLayer and if defined add the tiled layer to the
 * returned layer group
 * @param {String} esriBaseMapLayer - See https://esri.github.io/esri-leaflet/api-reference/layers/basemap-layer.html#basemaps
 * @param {String} tiledMapLayerOverlayUrl
 * @return {L.LayerGroup}
 */
export const createBaseLayerGroup = function(esriBaseMapLayer, tiledMapLayerOverlayUrl=null) {
    let layer = L.layerGroup();
    L.esri.basemapLayer(esriBaseMapLayer).addTo(layer);
    if (tiledMapLayerOverlayUrl) {
        layer.addLayer(L.esri.tiledMapLayer({
            url: tiledMapLayerOverlayUrl
        }));
    }
    return layer;
};

