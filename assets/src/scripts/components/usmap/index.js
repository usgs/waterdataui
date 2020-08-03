import { select } from 'd3-selection';
import { link, subscribe } from '../../lib/d3-redux';
import { Features } from '../../selectors/observations-selector';
import { Sites } from '../../selectors/waterquality-selector';
import { siteTypes } from '../../selectors/wdfn-selector';
import { Filters } from '../../selectors/wdfn-selector';
import config from '../../config';
import { applySiteTypeFilter, retrieveWdfnData } from '../../store/wdfn';
import { createStructuredSelector } from 'reselect';

/*
 * Creates a US map
 */
const usMap = function(node, {latitude, longitude, zoom}, store) {
    let gray = L.layerGroup();
    const markerGroup = L.layerGroup();

    L.esri.basemapLayer('Gray').addTo(gray);

    const checkboxes = document.querySelectorAll('#site-type-filters input');

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

    const setSiteTypeFilter = (filter, store) => {
        store.dispatch(applySiteTypeFilter(filter.value, filter.checked));
    };

    checkboxes.forEach(b => b.addEventListener('change', e => setSiteTypeFilter(e.target, store)));

    const fetchMatchingSites = (node, filters) => {
        // const bounds = map.getBounds();
        // const bbox = {
        //   west: bounds.getWest(),
        //   south: bounds.getSouth(),
        //   east: bounds.getEast(),
        //   north: bounds.getNorth()
        // };
        // store.dispatch(retrieveObservationsData(bbox));
        // const hasSiteType = Object.values(filters.siteTypes).some(el => el);
        // if (hasSiteType)
        //     store.dispatch(retrieveWdfnData(filters));
    };

    const addSiteCircles = (node, features) => {
        markerGroup.addTo(map);
        // features.forEach(f => {
        //     if (f.geometry) {
        //         const marker = L.circle(f.geometry.coordinates.reverse(), {
        //             color: 'red',
        //             fillColor: '#f03',
        //             fillOpacity: 0.2,
        //             radius: 5000
        //         });
        //         marker.addTo(map);
        //     }
        // });

        features.forEach(f => {
            L.marker([f.LatitudeMeasure, f.LongitudeMeasure]).addTo(markerGroup);
        });
    };

    const applyFilter = (node, filter) => {
        markerGroup.clearLayers();

        const charateristic = Object.keys(filter)[0];
        if (filter[charateristic]) {
            getFeaturesInBbox(charateristic);
        }
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

    node
        .call(link(store, fetchMatchingSites, Filters));
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
