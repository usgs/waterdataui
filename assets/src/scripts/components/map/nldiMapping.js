import { geoJson, circleMarker } from 'leaflet';
import { select } from 'd3-selection';
import config from '../../config';
import { mediaQuery } from '../../utils';

const markerFillColor = '#ff7800';
const markerFillOpacity = 0.8;
const downStreamColor = '#41b6c4';
const upstreamColor = '#253494';
const flowLineOpacity = 0.65;

/**
 * Add NLDI layer overlays to a leaflet map. An overlay is added for the flowlines
 * upstream and downstream of a site; another overlay is added to upstream and
 * downstream NWIS sites. Pop-ups are created for each feature in the overlay
 * layers.
 *
 * @param {L.map} map The leaflet map to which the overlay should be added
 * @param {L.Control} legendControl The map's legend control
 * @param {String} sitno The starting site for navigation
 */
export const createNldiLegend = function(legendControl, hasNldiData) {
    if (hasNldiData) {
        const legendListContainer = select(legendControl.getContainer()).select('.legend-list-container');
        const nldiLegendList = legendListContainer.append('ul')
                    .attr('id', 'nldi-legend-list')
                    .attr('class', 'usa-list--unstyled');

        const nldiUpstream = nldiLegendList.append('li');
        nldiUpstream.append('span').attr('style', `background: ${upstreamColor}; width: 16px; height: 16px; float: left; opacity: ${flowLineOpacity}; margin-right: 2px;`);
        nldiUpstream.append('span').text('Upstream Flowline');

        const nldiDownstream = nldiLegendList.append('li');
        nldiDownstream.append('span').attr('style', `background: ${downStreamColor}; width: 16px; height: 16px; float: left; opacity: ${flowLineOpacity}; margin-right: 2px;`);
        nldiDownstream.append('span').text('Downstream Flowline');

        const nldiMarker = nldiLegendList.append('li');
        nldiMarker.append('span').attr('style', `color: ${markerFillColor}; width: 16px; height: 16px; float: left; opacity: ${markerFillOpacity}; margin-right: 2px;`)
            .attr('class', 'fas fa-circle');
        nldiMarker.append('span').text('Additional Monitoring Locations');


        const legendContainer = select(legendControl.getContainer());
        // Make expand button visible
        legendContainer.select('.legend-expand-container').attr('hidden', null);

        // Set legend to be compressed if on medium or small device, otherwise show.
        let button = legendContainer.select('.legend-expand');
        if (mediaQuery(config.USWDS_MEDIUM_SCREEN)) {
            if (button.attr('title') === 'Show legend') {
                button.dispatch('click');
            }
        } else {
            if (button.attr('title') === 'Hide legend') {
                button.dispatch('click');
            }
        }

    } else {
        select(legendControl.getContainer()).select('#nldi-legend-list').remove();
    }
};

export const addNldiLayers = function (map, upstreamFlows, downstreamFlows, upstreamSites, downstreamSites) {
    const geojsonMarkerOptions = {
        radius: 6,
        fillColor: markerFillColor,
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: markerFillOpacity
    };

    const downstreamLineStyle = {
        'color': downStreamColor,
        'weight': 5,
        'opacity': flowLineOpacity
    };

    const upstreamLineStyle = {
        'color': upstreamColor,
        'weight': 5,
        'opacity':flowLineOpacity
    };

    const onEachPointFeatureAddPopUp = function(feature, layer) {
        const popupText = `Monitoring Location: <a href="${feature.properties.uri}">${feature.properties.name}</a>
            <br>ID: ${feature.properties.identifier}`;
        layer.bindPopup(popupText);
    };

    const getPointDataLayer = function(data, markerOptions) {
        return geoJson(data, {
            onEachFeature: onEachPointFeatureAddPopUp,
            pointToLayer: function (feature, latlng) {
                return circleMarker(latlng, markerOptions);
            }
        });
    };

    const getLineDataLayer = function(data, style) {
        return geoJson(data, {
            style: style
        });
    };

    const fetchNldiLinesLayer = function(nldiData, style) {
        return getLineDataLayer(nldiData, style);
    };

    const fetchNldiPointsLayer = function(nldiData, style) {
        return getPointDataLayer(nldiData, style);
    };

    map.addLayer(fetchNldiLinesLayer(upstreamFlows, upstreamLineStyle));
    map.addLayer(fetchNldiLinesLayer(downstreamFlows, downstreamLineStyle));
    map.addLayer(fetchNldiPointsLayer(upstreamSites, geojsonMarkerOptions));
    map.addLayer(fetchNldiPointsLayer(downstreamSites, geojsonMarkerOptions));
};