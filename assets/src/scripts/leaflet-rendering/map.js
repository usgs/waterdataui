
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
 * Create a base or overlay layer using esri tiledMapLayer and a National Map basemap URL
 * @param {String} tiledMapLayerUrl
 * @return {L.esri.tiledMapLayer}
 */
export const createBaseLayer = function(tiledMapLayerUrl) {
    let layer = L.esri.tiledMapLayer({url: tiledMapLayerUrl});
    return layer
};
