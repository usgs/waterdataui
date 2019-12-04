// Creates a Leaflet legend control. If the legend contains FIM information than the expand/collapse control
// will be visible

import { select } from 'd3-selection';

import { control as createControl, DomUtil, DomEvent } from 'leaflet';
import { get } from '../../ajax';
import config from '../../config';
import { mediaQuery } from '../../utils';


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
 * @param {Object} - options allowed for a standard Leaflet Control.
 * @return L.Control containing the legend control
 */
export const createLegendControl = function(options) {
    let legendControl = createControl(options);

    legendControl.onAdd = function() {
        let container = DomUtil.create('div', 'legend');

        let buttonContainer = DomUtil.create('div', 'legend-expand-container', container);
        // Only make the expand button available if FIM legends are added
        buttonContainer.setAttribute('hidden', true);
        let buttonLabel = DomUtil.create('span', '', buttonContainer);
        buttonLabel.innerHTML = 'Legend';
        let expandButton = DomUtil.create('button', 'legend-expand usa-button-secondary', buttonContainer);
        expandButton.innerHTML = '<i class="fas fa-compress"></i>';
        expandButton.title = 'Hide legend';

        let legendListContainer = DomUtil.create('div', 'legend-list-container', container);
        let legendList = DomUtil.create('ul', 'usa-list--unstyled', legendListContainer);
        legendList.id = 'site-legend-list';
        legendList.innerHTML = `<li><img src="${config.STATIC_URL}/images/marker-icon.png" alt="Map marker"/><span>Monitoring Location</span> </li>`;

        // Set up click handler for the expandButton
        DomEvent.on(expandButton, 'click', function() {
            if (expandButton.title === 'Hide legend') {
                expandButton.innerHTML = '<i class="fas fa-expand"></i>';
                expandButton.title = 'Show legend';
                legendListContainer.setAttribute('hidden', true);
            } else {
                expandButton.innerHTML = '<i class="fas fa-compress"></i>';
                expandButton.title = 'Hide legend';
                legendListContainer.removeAttribute('hidden');
            }
        });

        return container;
    };

    return legendControl;
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

        const legendContainer = select(legendControl.getContainer());
        // Make expand button visible
        legendContainer.select('.legend-expand-container').attr('hidden', null);

        // Set legend to be compressed if on medium or small device, otherwise show.
        let button = legendContainer.select('.legend-expand');
        if (mediaQuery(config.USWDS_MEDIUM_SCREEN)) {
            if (button.attr('title') === 'Show legend') {
                button.dispatch('click');
            }
        } else {
            if (button.attr('title') === 'Hide legend') {
                button.dispatch('click');
            }
        }

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
