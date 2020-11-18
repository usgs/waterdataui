// Creates a Leaflet legend control. If the legend contains FIM information than the expand/collapse control
// will be visible

import {select} from 'd3-selection';

import {get} from 'ui/ajax';
import config from 'ui/config';

import {markerFillColor, markerFillOpacity, downStreamColor, upstreamColor, flowLineOpacity,
         basinFillColor, basinFillOpacity} from './nldi-mapping';


const fetchLayerLegend = function(layer, defaultName) {
    return get(`${config.FIM_GIS_ENDPOINT}${layer}/MapServer/legend?f=json`)
        .then((responseText) => {
            const resp = JSON.parse(responseText);
            if (resp.error) {
                console.error(resp.error.message);
                return [];
            }
            return resp.layers.map((layer) => {
                const legendImages = layer.legend.map((legend) => {
                    return {
                        imageData: legend.imageData,
                        name: layer.layerName && layer.layerName !== '.' ? layer.layerName : defaultName
                    };
                });
                return [].concat(...legendImages);
            });
        })
        .catch(reason => {
            console.error(reason);
            return [];
        });
};

export const addMonitoringLocationMarker = function(legendControl) {
        const siteLegendList = select(legendControl.getLegendListContainer()).append('ul')
            .attr('id', 'site-legend-list')
            .classed('usa-list--unstyled', true);
        siteLegendList.append('li')
            .html(`<img src="${config.STATIC_URL}/images/marker-icon.png" alt="Map marker"/><span>Monitoring Location</span>`);

};

/*
 * Creates the FIM legend if FIM data is available, otherwise removes the FIM legend if it exists.
 * @param {L.Control} legendControl - Leaflet legend control
 * @param {Boolean} isFIMAvailable
 */
export const createFIMLegend = function(legendControl, isFIMAvailable) {
    if (isFIMAvailable) {
        // Fetch the images
        let fetchFloodExtentLegend = fetchLayerLegend('floodExtents', 'Flood-inundation area');
        let fetchBreachLegend = fetchLayerLegend('breach', 'Area of uncertainty');
        let fetchSuppLyrs = fetchLayerLegend('suppLyrs', 'supply layers');

        legendControl.compressLegendOnSmallDevices();

        let legendListContainer = select(legendControl.getContainer()).select('.legend-list-container');
        let fimLegendList = legendListContainer.append('ul')
                    .attr('id', 'fim-legend-list')
                    .classed('usa-list--unstyled', true);


        Promise.all([fetchFloodExtentLegend, fetchBreachLegend, fetchSuppLyrs])
            .then(([floodExtentLegends, breachLegend, suppLyrsLegend]) => {
                const legendImages = [].concat(...floodExtentLegends, ...breachLegend, ...suppLyrsLegend);
                fimLegendList.selectAll('li')
                    .data(legendImages)
                    .enter().append('li')
                        .classed('fim-legend', true)
                        .html(function(d) {
                            return `<img src="data:image/png;base64,${d.imageData}" alt="Legend icon - ${d.name}"/><span>${d.name}</span>`;
                        });
            });
    } else {
        select(legendControl.getContainer()).select('#fim-legend-list').remove();
    }
};

/**
 * Creates the NLDI legend if NLDI data is available, otherwise removes the NLDI legend if it exists.
 * @param {L.Control} legendControl - Leaflet legend control
 * @param {Boolean} is NLDI available
 */
export const createNldiLegend = function(legendControl, isNldiAvailable) {
    if (isNldiAvailable) {
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

        const nldiBasin = nldiLegendList.append('li');
        nldiBasin.append('span').attr('style', `background: ${basinFillColor}; width: 16px; height: 16px; float: left; opacity: ${basinFillOpacity}; margin-right: 2px;`);
        nldiBasin.append('span').text('Upstream Basin');

        legendControl.compressLegendOnSmallDevices();

    } else {
        select(legendControl.getContainer()).select('#nldi-legend-list').remove();
    }
};
