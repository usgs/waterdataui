import { geoJson, circleMarker} from 'leaflet';
import {markerClusterGroup} from 'markercluster-iow/src';

export const markerFillColor = '#ff7800';
export const markerFillOpacity = 0.8;

/**
 * Add network layer overlays to a leaflet map. An overlay is added for the sites
 * associated with the network.
 *
 * @param {L.map} map The leaflet map to which the overlay should be added
 * @param newtorkSites network site geojson data

 */

export const addNetworkLayers = function (map, networkSites) {
    const geojsonMarkerOptions = {
        radius: 6,
        fillColor: markerFillColor,
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: markerFillOpacity
    };

    const onEachPointFeatureAddPopUp = function (feature, layer) {
        const popupText = `Monitoring Location: <a href="${feature.properties.monitoringLocationUrl}">${feature.properties.monitoringLocationName}</a>
            <br>ID: ${feature.properties.monitoringLocationNumber}`;
        layer.bindPopup(popupText);
    };

    const getPointDataLayer = function (data, markerOptions) {
        return geoJson(data, {
            onEachFeature: onEachPointFeatureAddPopUp,
            pointToLayer: function (feature, latlng) {
                return circleMarker(latlng, markerOptions);
            }
        });
    };

    const fetchNetworkPointsLayer = function (networkData, style) {
        return getPointDataLayer(networkData, style);
    };

    const networkLayer = fetchNetworkPointsLayer(networkSites, geojsonMarkerOptions);
    if (networkSites.length > 50){
         const markers = markerClusterGroup({ chunkedLoading: true });
         markers.addLayer(networkLayer);
         map.addLayer(markers);
    } else {
        map.addLayer(networkLayer);
    }



};