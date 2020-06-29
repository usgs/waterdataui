
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

/*
 * Creates a legend control. The control has a expand button that is hidden by default.
 *
 * @param {Object} - options allowed for a standard Leaflet Control with the additional option:
 * @return L.Control containing the legend control
 */
export const createLegendControl = function(options) {
    let legendControl = L.control(options);

    legendControl.onAdd = function() {
        let container = L.DomUtil.create('div', 'legend');

        let buttonContainer = L.DomUtil.create('div', 'legend-expand-container', container);
        buttonContainer.setAttribute('hidden', true);
        let buttonLabel = L.DomUtil.create('span', '', buttonContainer);
        buttonLabel.innerHTML = 'Legend';
        let expandButton = L.DomUtil.create('button', 'legend-expand usa-button-secondary', buttonContainer);
        expandButton.innerHTML = '<i class="fas fa-compress"></i>';
        expandButton.title = 'Hide legend';

        let legendListContainer = L.DomUtil.create('div', 'legend-list-container', container);

        // Set up click handler for the expandButton
        L.DomEvent.on(expandButton, 'click', function() {
            if (expandButton.title === 'Hide legend') {
                expandButton.innerHTML = '<i class="fas fa-expand"></i>';
                expandButton.title = 'Show legend';
                legendListContainer.setAttribute('hidden', true);
            } else {
                expandButton.innerHTML = '<i class="fas fa-compress"></i>';
                expandButton.title = 'Hide legend';
                legendListContainer.removeAttribute('hidden');
            }
        });

        return container;
    };

    return legendControl;
};
