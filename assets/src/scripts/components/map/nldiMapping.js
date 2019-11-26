import { geoJson, circleMarker } from 'leaflet';
import { get } from '../../ajax';
import config from '../../config';
import { select } from 'd3-selection';
import { getNldiUpstreamSites, getNldiUpstreamFlows, getNldiDownstreamSites, getNldiDownstreamFlows } from '../../selectors/nldi-data-selector';
import {link} from "../../lib/redux";

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
export const addNldi = function(map, legendControl, siteno) {
    const nldiUrl = config.NLDI_SERVICES_ENDPOINT;
    const featureSource = 'nwissite';
    const dataSource = 'nwissite';
    const upstreamNavigation = 'UM';
    const downstreamNavigation = 'DM';
    const featureId = 'USGS-' + siteno;
    const distanceParam = `?distance=${config.NLDI_SERVICES_DISTANCE}`;
    const markerFillColor = '#ff7800';
    const markerFillOpacity = 0.8;
    const downStreamColor = '#41b6c4';
    const upstreamColor = '#253494';
    const flowLineOpacity = 0.65;

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

    // const fetchNldiLinesLayer = function(endpointUrl, style) {
    //     return get(endpointUrl)
    //         .then((responseText) => {
    //             return getLineDataLayer(JSON.parse(responseText), style);
    //         })
    //         .catch(reason => {
    //             console.error(reason);
    //         });
    // };



    // const fetchNldiPointsLayer = function(endpointUrl, style) {
    //     return get(endpointUrl)
    //         .then((responseText) => {
    //             return getPointDataLayer(JSON.parse(responseText), style);
    //         })
    //         .catch(reason => {
    //             console.error(reason);
    //         });
    // };

    const fetchNldiLinesLayer = function(nldiData, style) {
        return getLineDataLayer(nldiData, style);
    };

    const fetchNldiPointsLayer = function(nldiData, style) {
        return getPointDataLayer(nldiData, style);
    };

    // const upStreamSites = nldiUrl + '/'+ featureSource + '/' + featureId + '/navigate/' + upstreamNavigation + '/' + dataSource + distanceParam;
    // const downStreamSites = nldiUrl + '/'+ featureSource + '/' + featureId + '/navigate/' + downstreamNavigation + '/' + dataSource + distanceParam;
    // const upStreamFlow = nldiUrl + '/'+ featureSource + '/' + featureId + '/navigate/' + upstreamNavigation + distanceParam;
    // const downStreamFlow = nldiUrl + '/'+ featureSource + '/' + featureId + '/navigate/' + downstreamNavigation + distanceParam;
    //
    // const nldiUpstreamLinesPromise = fetchNldiLinesLayer(upStreamFlow, upstreamLineStyle);
    // const nldiDownStreamLinesPromise = fetchNldiLinesLayer(downStreamFlow, downstreamLineStyle);
    // const nldiUpStreamPointsPromise = fetchNldiPointsLayer(upStreamSites, geojsonMarkerOptions);
    // const nldiDownStreamPointsPromise = fetchNldiPointsLayer(downStreamSites, geojsonMarkerOptions);

    // Promise.all([
    //     nldiUpstreamLinesPromise, nldiDownStreamLinesPromise, nldiUpStreamPointsPromise, nldiDownStreamPointsPromise
    // ]).then(function(layers) {
    //    const [upStreamLines, downStreamLines, upStreamPoints, downStreamPoints] = layers;
    //    map.addLayer(upStreamLines);
    //    map.addLayer(downStreamLines);
    //    map.addLayer(upStreamPoints);
    //    map.addLayer(downStreamPoints);
    // });

    map.addLayer(fetchNldiLinesLayer(getNldiUpstreamFlows(), upstreamLineStyle));
    map.addLayer(fetchNldiLinesLayer(getNldiDownstreamFlows(), downstreamLineStyle));
    map.addLayer(fetchNldiPointsLayer(getNldiUpstreamSites(), geojsonMarkerOptions));
    map.addLayer(fetchNldiPointsLayer(getNldiDownstreamSites(), geojsonMarkerOptions));

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
};