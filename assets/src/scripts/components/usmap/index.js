import { select } from 'd3-selection';
import { link, subscribe } from '../../lib/d3-redux';
import { Features } from '../../selectors/observations-selector';
import { Sites } from '../../selectors/waterquality-selector';
import config from '../../config';
import { retrieveObservationsData } from '../../store/observations';
import { retrieveWaterqualityData } from '../../store/waterquality';

/*
 * Creates a US map
 */
const usMap = function(node, {latitude, longitude, zoom}, store) {
    let gray = L.layerGroup();
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

    const getFeaturesInBbox = () => {
        const bounds = map.getBounds();
        const bbox = {
          west: bounds.getWest(),     
          south: bounds.getSouth(),     
          east: bounds.getEast(),     
          north: bounds.getNorth()     
        };
        // store.dispatch(retrieveObservationsData(bbox));
        store.dispatch(retrieveWaterqualityData(bbox));
    };

    map.on('moveend', () => {
        getFeaturesInBbox();
    });

    const addSiteCircles = (node, features) => {
        features.forEach(f => {
            if (f.geometry) {
                const marker = L.circle(f.geometry.coordinates.reverse(), {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.2,
                    radius: 5000
                });
                marker.addTo(map);
            }
        });
    };

    const plotWaterQualitySites = (node, sites) => {
        Object.values(sites).forEach(s => {
          const marker = L.circle([s.LatitudeMeasure, s.LongitudeMeasure], {
              color: 'red',
              fillColor: '#f03',
              fillOpacity: 0.2,
              radius: 5000
          });
          console.log(s);
          const popup = 
            `<span style="display: block; font-weight: bold">${s.MonitoringLocationName}</span>Vertical Measure: ${s['VerticalMeasure/MeasureValue']}`;
          marker.bindPopup(popup);
          marker.addTo(map);
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

    // node
    //     .call(link(store, addSiteCircles, Features));
    node
        .call(link(store, plotWaterQualitySites, Sites));
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
