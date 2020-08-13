import { select } from 'd3-selection';
import { link } from '../../lib/d3-redux';
import { Filters, Sites, Count } from '../selectors/wdfn-selector';
import config from '../../config';
import { 
  applySiteTypeFilter, 
  applyGeographicFilter,
  retrieveWdfnData 
} from '../store/wdfn-store';

/*
 * Creates a US map
 */
const usMap = function(node, {latitude, longitude, zoom}, store) {
    let gray = L.layerGroup();
    const markerGroup = L.layerGroup();

    L.esri.basemapLayer('Gray').addTo(gray);

    const checkboxes = document.querySelectorAll('#site-type-filters input');
    const paramCheckboxes = document.querySelectorAll('#filter-site-params input');

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

    // Parent checkboxes should control the state of their children
    const toggleChildCheckboxes = (checkbox) => {
        const checked = checkbox.checked;
        const li = checkbox.parentNode.parentNode;
        const childBoxes = li.querySelectorAll('li li input[type=checkbox]');

        Array.from(childBoxes).forEach(b => {
            b.checked = checked;
        });
    };

    paramCheckboxes.forEach(b => b.addEventListener('change', e => toggleChildCheckboxes(e.target)));

    const setSiteTypeFilter = (filter, store) => {
        const siteType = filter.name.replace('site-type-','');
        store.dispatch(applySiteTypeFilter(siteType, filter.checked));
    };

    checkboxes.forEach(b => b.addEventListener('change', e => setSiteTypeFilter(e.target, store)));

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

    // Dispatch redux action that will fetch sites from API
    const fetchMatchingSites = (node, filters) => {
        if (Object.keys(filters).length === 0) return;

        // If there are any sites already on the map, remove them
        markerGroup.clearLayers();

        const hasSiteType = Object.values(filters.siteTypes).some(el => el);
        const hasBbox = Object.values(filters.bBox).every(el => el);

        if (hasSiteType && hasBbox)
            store.dispatch(retrieveWdfnData(filters));
    };

    const addSiteCircles = (node, features) => {
        markerGroup.addTo(map);

        features.forEach(f => {
            if (f.geometry) {
                const marker = L.circle(f.geometry.coordinates.reverse(), {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.2,
                    radius: 5000
                });
                marker.addTo(markerGroup);
            }
        });
    };

    // Updates the count of sites matching the selected filters
    const setCount = (node, count) => {
        if (typeof count !== 'number') return 0;
        document.querySelector('#result-count span').textContent = count;
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
        .call(link(store, setCount, Count));
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
