import { geoJson, circleMarker } from 'leaflet';
import { get } from '../../ajax';
import config from '../../config';
import { select } from 'd3-selection';

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
    const distanceParam = '?distance=322';
    const markerFillColor = '#ff7800';
    const markerFillOpacity = 0.8;
    const downStreamColor = '#41b6c4';
    const upstreamColor = '#253494';
    const flowLineOpacity = 0.65;

    const allExtents = {
        'features': [],
        'properties': {
            'title': 'all nldi extents'
        },
        'type': 'FeatureCollection'
    };

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
        const uri = feature.properties.uri;
        const popupText = 'Data Source: ' + feature.properties.source +
            '<br>Data Source Name: ' + feature.properties.sourceName +
            '<br>Station Name: ' + feature.properties.name +
            '<br>Station ID: ' + feature.properties.identifier +
            '<br>More Station Data: ' + '<a href="' + uri + '">Go to site page</a>';
        layer.bindPopup(popupText);
    };

    const addPointDataToMap = function(data, markerOptions) {
        const pointLayer = geoJson(data, {
            onEachFeature: onEachPointFeatureAddPopUp,
            pointToLayer: function (feature, latlng) {
                return circleMarker(latlng, markerOptions);
            }
        });
        pointLayer.setZIndex(999);
        map.addLayer(pointLayer);
    };

    const onEachLineFeatureAddPopUp = function(feature, layer) {
        const popupText = 'Data Source: NHD+' +
            '<br>Reach ComID: ' + feature.properties.nhdplus_comid;
        layer.bindPopup(popupText);
    };

    const addLineDataToMap = function(data, style) {
        const lineLayer = geoJson(data, {
            onEachFeature: onEachLineFeatureAddPopUp,
            style: style
            });
        lineLayer.addTo(map);
        const features = data.features;
        features.forEach(function(feature) {
            allExtents.features.push(feature);
        });
//        map.fitBounds(geoJson(allExtents).getBounds());
    };

    const addNldiLinesToMap = function(endpointUrl, style) {
        get(endpointUrl)
            .then((responseText) => {
                addLineDataToMap(JSON.parse(responseText), style);
            })
            .catch(reason => {
                console.error(reason);
            });
    };

    const addNldiPointsToMap = function(endpointUrl, style) {
        get(endpointUrl)
            .then((responseText) => {
                addPointDataToMap(JSON.parse(responseText), style);
            })
            .catch(reason => {
                console.error(reason);
            });
    };

    const upStreamSites = nldiUrl + '/'+ featureSource + '/' + featureId + '/navigate/' + upstreamNavigation + '/' + dataSource + distanceParam;
    const downStreamSites = nldiUrl + '/'+ featureSource + '/' + featureId + '/navigate/' + downstreamNavigation + '/' + dataSource + distanceParam;
    const upStreamFlow = nldiUrl + '/'+ featureSource + '/' + featureId + '/navigate/' + upstreamNavigation + distanceParam;
    const downStreamFlow = nldiUrl + '/'+ featureSource + '/' + featureId + '/navigate/' + downstreamNavigation + distanceParam;

    const nldiLines = [
        {url : upStreamFlow, style : upstreamLineStyle},
        {url : downStreamFlow, style : downstreamLineStyle}
    ];

    const nldiPoints = [
        {url : upStreamSites, style : geojsonMarkerOptions},
        {url : downStreamSites, style : geojsonMarkerOptions}
    ];

    nldiLines.forEach(function(pair) {
        addNldiLinesToMap(pair.url, pair.style);
    });

    nldiPoints.forEach(function(pair) {
        addNldiPointsToMap(pair.url, pair.style);
    });

    const legendListContainer = select(legendControl.getContainer()).select('.legend-list-container');
    const nldiLegendList = legendListContainer.append('ul')
                .attr('id', 'nldi-legend-list')
                .classed('usa-list--unstyled', true);

    nldiLegendList.append('li')
                .classed('nldi-legend', true)
                .html('<li><i style="background:' + upstreamColor + '; width: 16px; height: 16px; float: left; opacity: ' + flowLineOpacity + '; margin-right: 2px;"></i><span>Upstream Flowline</span> </li>'
                            + '<li><i style="background:' + downStreamColor + '; width: 16px; height: 16px; float: left; opacity: ' + flowLineOpacity + '; margin-right: 2px;"></i><span>Downstream Flowline</span> </li>'
                            + '<li><i class="fas fa-circle" style="color:' + markerFillColor + '; width: 16px; height: 16px; float: left; opacity: ' + markerFillOpacity + '; margin-right: 2px;"></i><span>Additional Monitoring Locations</span> </li>');
};