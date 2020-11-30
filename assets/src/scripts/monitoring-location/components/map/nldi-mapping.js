
const DOWNSTREAM_COLOR = '#41b6c4';
const UPSTREAM_COLOR = '#253494';
const FLOWLINE_OPACITY = 0.65;
const BASIN_COLOR = '#c0c1c2';
const BASIN_FILL_COLOR = '#d9d9d9';
const BASIN_FILL_OPACITY = .5;

const DOWNSTREAM_LINE_STYLE = {
        'color': DOWNSTREAM_COLOR,
        'weight': 5,
        'opacity': FLOWLINE_OPACITY
    };

    const UPSTREAM_LINE_STYLE = {
        'color': UPSTREAM_COLOR,
        'weight': 5,
        'opacity':FLOWLINE_OPACITY
    };

    const BASIN_STYLE = {
        'color': BASIN_COLOR,
        'fill': true,
        'fillFolor': BASIN_FILL_COLOR,
        'fillOpacity': BASIN_FILL_OPACITY
    };


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

    const getNldiLinesLayer = function(nldiData, style) {
        return getLineDataLayer(nldiData, style);
    };

    const getNldiUpstreamBasinLayer = function(nldiData, style) {
        return getPolygonLayer(nldiData, style);
    };

    map.addLayer(getNldiUpstreamBasinLayer(upstreamBasin, BASIN_STYLE));
    map.addLayer(getNldiLinesLayer(upstreamFlows, UPSTREAM_LINE_STYLE));
    map.addLayer(getNldiLinesLayer(downstreamFlows, DOWNSTREAM_LINE_STYLE));
};

export const drawNldiLegend = function(legendListContainer, isNldiAvailable) {
    if (isNldiAvailable) {
        const nldiLegendList = legendListContainer.append('ul')
                    .attr('id', 'nldi-legend-list')
                    .attr('class', 'usa-list--unstyled');

        const nldiUpstream = nldiLegendList.append('li');
        nldiUpstream.append('span').attr('style', `background: ${UPSTREAM_COLOR}; width: 16px; height: 16px; float: left; opacity: ${FLOWLINE_OPACITY}; margin-right: 2px;`);
        nldiUpstream.append('span').text('Upstream Flowline');

        const nldiDownstream = nldiLegendList.append('li');
        nldiDownstream.append('span').attr('style', `background: ${DOWNSTREAM_COLOR}; width: 16px; height: 16px; float: left; opacity: ${FLOWLINE_OPACITY}; margin-right: 2px;`);
        nldiDownstream.append('span').text('Downstream Flowline');

        const nldiBasin = nldiLegendList.append('li');
        nldiBasin.append('span').attr('style', `background: ${BASIN_FILL_COLOR}; width: 16px; height: 16px; float: left; opacity: ${BASIN_FILL_OPACITY}; margin-right: 2px;`);
        nldiBasin.append('span').text('Upstream Basin');
    } else {
        legendListContainer.select('#nldi-legend-list').remove();
    }
};

