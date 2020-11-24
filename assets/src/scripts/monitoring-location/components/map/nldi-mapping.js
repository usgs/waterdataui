
export const markerFillColor = '#ff7800';
export const markerFillOpacity = 0.8;
export const downStreamColor = '#41b6c4';
export const upstreamColor = '#253494';
export const flowLineOpacity = 0.65;
export const basinColor = '#c0c1c2';
export const basinFillColor = '#d9d9d9';
export const basinFillOpacity = .5;

/**
 * Add NLDI layer overlays to a leaflet map. An overlay is added for the flowlines
 * upstream and downstream of a site; another overlay is added to upstream and
 * downstream NWIS sites. Pop-ups are created for each feature in the overlay
 * layers.
 *
 * @param {L.map} map The leaflet map to which the overlay should be added
 * @param upstreamFlows nldi upstream flow geojson data
 * @param downstreamFlows nldi downstream flow geojson data
 * @param upstreamBasin geojson data
 * */
export const addNldiLayers = function(map, upstreamFlows, downstreamFlows, upstreamBasin) {
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

    const basinStyle = {
        'color': basinColor,
        'fill': true,
        'fillFolor': basinFillColor,
        'fillOpacity': basinFillOpacity
    };

    const onEachPointFeatureAddPopUp = function(feature, layer) {
        const url = feature.properties.monitoringLocationUrl;
        const name = feature.properties.monitoringLocationName;
        const id = feature.properties.monitoringLocationNumber;
        const popupText = `Monitoring Location: <a href="${url}">${name}</a>
            <br>ID: ${id}`;
        layer.bindPopup(popupText);
    };


    const getLineDataLayer = function(data, style) {
        return L.geoJson(data, {
            style: style
        });
    };

    const getPolygonLayer = function(data, style) {
      return L.geoJson(data, {
          style: style
      });
    };

    const fetchNldiLinesLayer = function(nldiData, style) {
        return getLineDataLayer(nldiData, style);
    };

    const fetchNldiUpstreamBasin = function(nldiData, style) {
        return getPolygonLayer(nldiData, style);
    };

    map.addLayer(fetchNldiUpstreamBasin(upstreamBasin, basinStyle));
    map.addLayer(fetchNldiLinesLayer(upstreamFlows, upstreamLineStyle));
    map.addLayer(fetchNldiLinesLayer(downstreamFlows, downstreamLineStyle));
};