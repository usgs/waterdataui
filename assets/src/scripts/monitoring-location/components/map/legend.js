// Creates a Leaflet legend control. If the legend contains FIM information than the expand/collapse control
// will be visible

import {select} from 'd3-selection';

import {get} from 'ui/ajax';
import config from 'ui/config';

import {link} from 'ui/lib/d3-redux';

import {hasFloodData} from 'ml/selectors/flood-data-selector';

import {DOWNSTREAM_COLOR, UPSTREAM_COLOR, FLOWLINE_OPACITY,
         BASIN_FILL_COLOR, BASIN_FILL_OPACITY} from './nldi-mapping';

export const drawMonitoringLocationMarkerLegend = function(legendListContainer) {
        const siteLegendList = legendListContainer.append('ul')
            .attr('id', 'site-legend-list')
            .classed('usa-list--unstyled', true);
        siteLegendList.append('li')
            .html(`<img src="${config.STATIC_URL}/images/marker-icon.png" alt="Map marker"/><span>Monitoring Location</span>`);

};

export const drawCircleMarkerMarkerLegend = function(legendListContainer, color, opacity, label) {
    const container = legendListContainer.append('li');
    container.append('span')
        .attr('style',
            `color: ${color}; width: 16px; height: 16px; float: left; opacity: ${opacity}; margin-right: 2px;`)
        .attr('class', 'fas fa-circle');
    container.append('span').text(label);
};


/*
 * Creates the FIM legend if FIM data is available, otherwise removes the FIM legend if it exists.
 * @param {L.Control} legendControl - Leaflet legend control
 * @param {Boolean} isFIMAvailable
 */
export const drawFIMLegend = function(legendControl, isFIMAvailable) {
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
        nldiUpstream.append('span').attr('style', `background: ${UPSTREAM_COLOR}; width: 16px; height: 16px; float: left; opacity: ${FLOWLINE_OPACITY}; margin-right: 2px;`);
        nldiUpstream.append('span').text('Upstream Flowline');

        const nldiDownstream = nldiLegendList.append('li');
        nldiDownstream.append('span').attr('style', `background: ${DOWNSTREAM_COLOR}; width: 16px; height: 16px; float: left; opacity: ${FLOWLINE_OPACITY}; margin-right: 2px;`);
        nldiDownstream.append('span').text('Downstream Flowline');

        const nldiBasin = nldiLegendList.append('li');
        nldiBasin.append('span').attr('style', `background: ${BASIN_FILL_COLOR}; width: 16px; height: 16px; float: left; opacity: ${BASIN_FILL_OPACITY}; margin-right: 2px;`);
        nldiBasin.append('span').text('Upstream Basin');

        legendControl.compressLegendOnSmallDevices();

    } else {
        select(legendControl.getContainer()).select('#nldi-legend-list').remove();
    }
};

export const drawLegend = function(elem, store) {
    elem
        .call(drawMonitoringLocationMarker)
        .call(link(store, addFIMLegend, hasFloodData));

}
