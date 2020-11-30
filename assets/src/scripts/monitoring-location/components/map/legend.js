
import {get} from 'ui/ajax';
import config from 'ui/config';

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

/*
 * Draws a monitoring location marker within the legendListContainer
 * @param {D3 selection} legendListContainer
 */
export const drawMonitoringLocationMarkerLegend = function(legendListContainer) {
        const siteLegendList = legendListContainer.append('ul')
            .attr('id', 'site-legend-list')
            .classed('usa-list--unstyled', true);
        siteLegendList.append('li')
            .html(`<img src="${config.STATIC_URL}/images/marker-icon.png" alt="Map marker"/><span>Monitoring Location</span>`);

};

/*
 * Draws a circle marker legend within legencListContainer with color, opacity, and label
 * @param {D3 selection} legendlistContainer
 * @param {String} color
 * @param {String} opacity
 * @param {String} label
 */
export const drawCircleMarkerLegend = function(legendListContainer, color, opacity, label) {
    const container = legendListContainer.append('ul')
        .classed('usa-list--unstyled', true);
    container.append('li')
        .append('span')
        .attr('style',
            `color: ${color}; width: 16px; height: 16px; float: left; opacity: ${opacity}; margin-right: 2px;`)
        .attr('class', 'fas fa-circle');
    container.append('span').text(label);
};


/*
 * Creates the FIM legend if FIM data is available, otherwise removes the FIM legend if it exists.
 * @param {D3 selection} legendListConatiner - Leaflet legend control
 * @param {Boolean} isFIMAvailable
 */
export const drawFIMLegend = function(legendListContainer, isFIMAvailable) {
    if (isFIMAvailable) {
        // Fetch the images
        let fetchFloodExtentLegend = fetchLayerLegend('floodExtents', 'Flood-inundation area');
        let fetchBreachLegend = fetchLayerLegend('breach', 'Area of uncertainty');
        let fetchSuppLyrs = fetchLayerLegend('suppLyrs', 'supply layers');

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
        legendListContainer.select('#fim-legend-list').remove();
    }
};
