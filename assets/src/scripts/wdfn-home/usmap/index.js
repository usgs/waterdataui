import { select } from 'd3-selection';
import { link } from '../../lib/d3-redux';
import { Sites } from '../selectors/wdfn-selector';
import config from '../../config';
import { 
  applyGeographicFilter
} from '../store/wdfn-store';

/*
 * Creates a US map
 */
const usMap = function(node, {latitude, longitude, zoom}, store) {
    let gray = L.layerGroup();
    const markerGroup = L.layerGroup();

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

    // Store bounding box coordinates
    const setBboxFilter = () => {
        const bounds = map.getBounds();

        const bbox = {
          west: bounds.getWest(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          north: bounds.getNorth()
        };

        store.dispatch(applyGeographicFilter(bbox));
    };

    map.on('moveend', setBboxFilter);

    const addSiteCircles = (_, features) => {
        markerGroup.clearLayers();
        markerGroup.addTo(map);

        features.forEach(f => {
            if (f.geometry && f.properties) {
                const marker = L.circle(f.geometry.coordinates.reverse(), {
                    radius: 5000,
                    className: `site-marker ${f.properties.monitoringLocationIdentifier}`
                });
                marker.addTo(markerGroup);
            }
        });
    };

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

    node
        .call(link(store, addSiteCircles, Sites));
};

/*
 * Creates the US map with node and attach it to the Redux store.
 * @param {Object} store - Redux store
 * @param {Object} node - DOM element
 * @param {Number} latitude - latitude of siteno
 * @param {Number} longitude - longitude of siteno
 * @param {Number} zoom - zoom level to initially set the map to
 */
export const attachToNode = function(store, node, {latitude, longitude, zoom}) {
    select(node)
        .call(usMap, {latitude, longitude, zoom}, store);
};
