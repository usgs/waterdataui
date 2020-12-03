import {select} from 'd3-selection';
import {createStructuredSelector} from 'reselect';

import config from 'ui/config';
import {createMap, createBaseLayer} from 'ui/leaflet-rendering/map';
import {legendControl} from 'ui/leaflet-rendering/legend-control';
import {link} from 'ui/lib/d3-redux';

import {fetchNetworkMonitoringLocations} from 'ui/web-services/observations';

import {hasFloodData, getFloodExtent, getFloodStageHeight} from 'ml/selectors/flood-data-selector';
import {hasNldiData, getNldiDownstreamFlows, getNldiUpstreamFlows, getNldiUpstreamBasin}
    from 'ml/selectors/nldi-data-selector';
import {Actions as nldiDataActions} from 'ml/store/nldi-data';
import {Actions as floodInundationActions} from 'ml/store/flood-inundation';

import {floodSlider} from './flood-slider';
import {drawCircleMarkerLegend, drawFIMLegend, drawMonitoringLocationMarkerLegend} from './legend';
import {addNldiLayers, drawNldiLegend} from './nldi-mapping';


const ACTIVE_SITE_COLOR = 'red';
const ACTIVE_SITE_OPACITY = .8;
const geojsonMarkerOptions = {
    radius: 6,
    fillColor: ACTIVE_SITE_COLOR,
    color: '#000',
    weight: 1,
    opacity: 1,
    fillOpacity: ACTIVE_SITE_OPACITY
};

const getESRIFloodLayers = function(layerType) {
    return `${config.FIM_GIS_ENDPOINT}${layerType}/MapServer/`;
};

const getLayerDefs = function(layerNo, siteno, stage) {
   const stageQuery = stage ? ` AND STAGE = ${stage}` : '';
   return `${layerNo}: USGSID = '${siteno}'${stageQuery}`;
};

const getActiveMonitoringLocationsLayer = function(locations, markerOptions) {
    return L.geoJson(locations, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, markerOptions);
        },
        onEachFeature: function(feature, layer) {
            const url = feature.properties.monitoringLocationUrl;
            const name = feature.properties.monitoringLocationName;
            const id = feature.properties.monitoringLocationNumber;
            const type = feature.properties.monitoringLocationType;
            const popupText = `Monitoring Location: <a href="${url}">${name}</a>
                    <br/>ID: ${id}<br/>Site type: ${type}`;
            layer.bindPopup(popupText, {
                autoPan: false
            });
        }
    });
};

/*
 * Creates a site map
 */
const siteMap = function(node, {siteno, latitude, longitude, zoom}, store) {
    const map = createMap('site-map', {
        center: [latitude, longitude],
        zoom: zoom
    });

    const baseMapLayers = {
        'USGS Topo': createBaseLayer(config.TNM_USGS_TOPO_ENDPOINT),
        'Imagery': createBaseLayer(config.TNM_USGS_IMAGERY_ONLY_ENDPOINT),
        'Imagery+Topo': createBaseLayer(config.TNM_USGS_IMAGERY_TOPO_ENDPOINT)
    };

    const overlayLayers = {
        'Hydro': createBaseLayer(config.TNM_HYDRO_ENDPOINT)
    };

    map.addLayer(baseMapLayers['USGS Topo']);

    //add layer control
    L.control.layers(baseMapLayers,overlayLayers).addTo(map);

    // Add FIM layers
    const floodLayer = L.esri.dynamicMapLayer({
        url: getESRIFloodLayers('floodExtents'),
        layers: [0],
        f: 'image',
        format: 'png8'
    });
    const breachLayer = L.esri.dynamicMapLayer({
        url: getESRIFloodLayers('breach'),
        layers: [0],
        f: 'image',
        format: 'png8'
    });
    const leveeLayer = L.esri.dynamicMapLayer({
        url: getESRIFloodLayers('levee'),
        layers: [0, 1],
        f: 'image',
        format: 'png8',
        layerDefs: `${getLayerDefs(0, siteno)};${getLayerDefs(1, siteno)}`
    });

    /*
     * Function to link to redux store to update the flood layers when flood data changes
     */
    const updateFloodLayers = function(node, {hasFloodData, floodStageHeight}) {
        if (floodStageHeight) {
            const layerDefs = getLayerDefs(0, siteno, floodStageHeight);
            floodLayer.setLayerDefs(layerDefs);
            breachLayer.setLayerDefs(layerDefs);
        }
        if (hasFloodData) {
            if (!map.hasLayer(floodLayer)) {
                map.addLayer(floodLayer);
                map.addLayer(breachLayer);
                map.addLayer(leveeLayer);
            }

        } else {
            if (map.hasLayer(floodLayer)) {
                map.removeLayer(floodLayer);
                map.removeLayer(breachLayer);
                map.removeLayer(leveeLayer);
            }
        }
    };

    /*
     * Function to link to Redux store to set the map extent when flood data is retrieved
     */
    const updateMapExtent = function(node, extent) {
        if (Object.keys(extent).length > 0) {
            map.fitBounds(L.esri.Util.extentToBounds(extent).extend([latitude, longitude]));
        }
    };

    /*
     * Function to add the link to the Flood data information if flood data is available
     */
    const addFimLink = function(node, hasFloodData) {
        node.select('#fim-link').remove();
        if (hasFloodData) {
            node.append('a')
                .attr('id', 'fim-link')
                .classed('usa-link', true)
                .attr('href', `${config.FIM_ENDPOINT}?site_no=${siteno}`)
                .attr('target', '_blank')
                .attr('rel', 'noopener')
                .text('Provisional Flood Information');
        }
    };

    /*
     * Function to link to Redux store when NLDI data changes
     */
    const updateNldiLayers = function(node, {upstreamFlows, downstreamFlows, upstreamBasin}) {
        addNldiLayers(map, upstreamFlows, downstreamFlows, upstreamBasin);
    };

    // Create active site layer and function to update the sites layer with the current map bounds.
    let activeSitesLayer = L.layerGroup([]);
    const updateActiveSitesLayer = function(bounds) {
        const queryParams = {
            active: true,
            bbox: bounds.toBBoxString()
        };
        activeSitesLayer.clearLayers();
        fetchNetworkMonitoringLocations('RTN', queryParams).then((rtnLocations) => {
            const locationsToDraw = rtnLocations.filter((feature) => feature.properties.monitoringLocationNumber !== siteno);
            activeSitesLayer.addLayer(getActiveMonitoringLocationsLayer(locationsToDraw, geojsonMarkerOptions));
        });
        fetchNetworkMonitoringLocations('RTS', queryParams).then((rtsLocations) => {
            const locationsToDraw = rtsLocations.filter((feature) => feature.properties.monitoringLocationNumber !== siteno);
            activeSitesLayer.addLayer(getActiveMonitoringLocationsLayer(locationsToDraw, geojsonMarkerOptions));
        });
    };

    map.addLayer(activeSitesLayer);
    updateActiveSitesLayer(map.getBounds());

    map.on('moveend', function() {
        updateActiveSitesLayer(map.getBounds());
    });

    // Add a marker at the site location
    L.marker([latitude, longitude]).addTo(map);

    // add legend and legend elements
    const mlLegendControl = legendControl();
    mlLegendControl.addTo(map);
    mlLegendControl.compressLegendOnSmallDevices();
    const legendListContainer = select(mlLegendControl.getContainer()).select('.legend-list-container');
    legendListContainer
        .call(drawMonitoringLocationMarkerLegend)
        .call(drawCircleMarkerLegend, ACTIVE_SITE_COLOR, ACTIVE_SITE_OPACITY, 'Active Monitoring Locations')
        .call(link(store, drawFIMLegend, hasFloodData))
        .call(link(store, drawNldiLegend, hasNldiData));

    // Connect the FIM information and NLDI information from the Redux Store to the
    // rendering code.
    node
        .call(link(store, updateFloodLayers, createStructuredSelector({
            hasFloodData: hasFloodData,
            floodStageHeight: getFloodStageHeight
        })))
        .call(link(store, updateMapExtent, getFloodExtent))
        .call(link(store, addFimLink, hasFloodData))
        .call(link(store, updateNldiLayers, createStructuredSelector({
            upstreamFlows: getNldiUpstreamFlows,
            downstreamFlows: getNldiDownstreamFlows,
            upstreamBasin: getNldiUpstreamBasin
        })));
};

/*
 * Creates the site map with node and attach it to the Redux store.
 * @param {Object} store - Redux store
 * @param {Object} node - DOM element
 * @param {String} siteno
 * @param {Number} latitude - latitude of siteno
 * @param {Number} longitude - longitude of siteno
 * @param {Number} zoom - zoom level to initially set the map to
 */
export const attachToNode = function(store, node, {siteno, latitude, longitude, zoom}) {
    store.dispatch(floodInundationActions.retrieveFloodData(siteno));
    // hydrates the store with nldi data
    store.dispatch(nldiDataActions.retrieveNldiData(siteno));

    select(node).select('#flood-layer-control-container')
        .call(floodSlider, store);
    select(node)
        .call(siteMap, {siteno, latitude, longitude, zoom}, store);
};
