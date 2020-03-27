// Creates a Leaflet legend control. If the legend contains FIM information than the expand/collapse control
// will be visible
import {select} from 'd3-selection';
import config from '../../config';
import {mediaQuery} from '../../utils';
import {markerFillColor, markerFillOpacity} from './network-elements';

/*
 * @param {Object} - options allowed for a standard Leaflet Control.
 * @return window.L.Control containing the legend control
 */
export const createLegendControl = function(options) {
    let legendControl = window.L.control(options);

    legendControl.onAdd = function() {
        let container = window.L.DomUtil.create('div', 'legend');

        let buttonContainer = window.L.DomUtil.create('div', 'legend-expand-container', container);
        // Only make the expand button available if FIM legends are added
        buttonContainer.setAttribute('hidden', true);
        let buttonLabel = window.L.DomUtil.create('span', '', buttonContainer);
        buttonLabel.innerHTML = 'Legend';
        let expandButton = window.L.DomUtil.create('button', 'legend-expand usa-button-secondary', buttonContainer);
        expandButton.innerHTML = '<i class="fas fa-compress"></i>';
        expandButton.title = 'Hide legend';

        let legendListContainer = window.L.DomUtil.create('div', 'legend-list-container', container);

        // Set up click handler for the expandButton
        window.L.DomEvent.on(expandButton, 'click', function() {
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


/**
 * Compresses the legend on smaller devices like phones
 * @param {window.L.Control} legendControl - Leaflet legend control
 */
const compressLegendOnSmallDevices = function(legendControl) {
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
};


/**
 * Creates the network legend if network data is available, otherwise removes the network legend if it exists.
 * @param {window.L.Control} legendControl - Leaflet legend control
 * @param {Boolean} is network available
 */
export const createNetworkLegend = function(legendControl, isNetworkAvailable) {
    if (isNetworkAvailable) {
        const legendListContainer = select(legendControl.getContainer()).select('.legend-list-container');
        const networkLegendList = legendListContainer.append('ul')
                    .attr('id', 'network-legend-list')
                    .attr('class', 'usa-list--unstyled');

        const networkMarker = networkLegendList.append('li');
        networkMarker.append('span').attr('style', `color: ${markerFillColor}; width: 16px; height: 16px; float: left; opacity: ${markerFillOpacity}; margin-right: 2px;`)
            .attr('class', 'fas fa-circle');
        networkMarker.append('span').text('Network Sites');

        compressLegendOnSmallDevices(legendControl);

    } else {
        select(legendControl.getContainer()).select('#network-legend-list').remove();
    }
};
