import Tabulator from 'tabulator-tables/dist/js/tabulator.js';
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
            'link': feature.properties.monitoringLocationUrl
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

        const tableEl = document.getElementById('link-list');
        const table = new Tabulator(tableEl, {
            data: listValues,
            height: '400px',
            layout: 'fitColumns',
            responsiveLayout: 'hide',
            tooltips: true,
            pagination: 'local',
            paginationSize: 30,
            movableColumns: true,
            resizableRows: true,
            initialSort: [
                {column: 'name', dir: 'asc'}
            ],
            columns: [
                {title: 'Name', field: 'name'},
                {title: 'Link', field: 'link', formatter: 'link', formatterParams:{
                    labelField:'link'
                }}
            ]
        });

        const searchValue = document.getElementById('table-search');

        searchValue.addEventListener('keyup', function() {
            table.setFilter('name', 'like', searchValue.value);
        });


    } else{
        if (networkSites.length > 0) {
            document.getElementById('overload-map').innerHTML = 'Too many sites to display on map';
            document.getElementById('overload-table').innerHTML = 'Too many sites to display in table';
        }
    }
};