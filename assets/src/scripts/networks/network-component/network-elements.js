import List from 'list.js';
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

    const listValues = [];
    const onEachPointFeatureAddPopUp = function (feature, layer) {
        listValues.push({
            'name': feature.properties.monitoringLocationName,
            'link': feature.properties.monitoringLocationUrl,
            'linkhref': feature.properties.monitoringLocationUrl
        });
        const popupText = `Monitoring Location: <a href="${feature.properties.monitoringLocationUrl}">${feature.properties.monitoringLocationName}</a>
            <br>ID: ${feature.properties.monitoringLocationNumber}`;
        layer.bindPopup(popupText);
    };

    const getPointDataLayer = function (data, markerOptions) {
        return L.geoJson(data, {
            onEachFeature: onEachPointFeatureAddPopUp,
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, markerOptions);
            }
        });
    };

    const fetchNetworkPointsLayer = function (networkData, style) {
        return getPointDataLayer(networkData, style);
    };

    const networkLayer = fetchNetworkPointsLayer(networkSites, geojsonMarkerOptions);


    if(networkSites.length > 0 && networkSites.length < 10000) {
        if (networkSites.length > 50) {
            const markers = L.markerClusterGroup({chunkedLoading: true});
            markers.addLayer(networkLayer);
            map.addLayer(markers);
        } else {
            map.addLayer(networkLayer);
        }

        const valueNames = ['name', 'link',  { name: 'linkhref', attr: 'href' }];
        const options = {
            valueNames: valueNames,
            item: '<tr><td class="name"></td><td><a class="link linkhref"></a></td></tr>',
            page: 50,
            pagination: [{
                left: 1,
                right: 1,
                innerWindow: 2,
                outerWindow: 1
            }]
        };
        new List('link-list', options, listValues);



    } else{
        if (networkSites.length > 0) {
            document.getElementById('overload-map').innerHTML = 'Too many sites to display on map';
            document.getElementById('overload-table').innerHTML = 'Too many sites to display in table';
        }
    }
};