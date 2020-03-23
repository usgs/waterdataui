// Creates a Leaflet legend control. If the legend contains FIM information than the expand/collapse control
// will be visible

import { select } from 'd3-selection';
import { control as createControl, DomUtil, DomEvent } from 'leaflet';
// import { get } from '../ajax';
import config from '../../config';
import { mediaQuery } from '../../utils';
import { markerFillColor, markerFillOpacity} from './network-mapping';


// const fetchLayerLegend = function(layer, defaultName) {
//     return get(`${config.FIM_GIS_ENDPOINT}${layer}/MapServer/legend?f=json`)
//         .then((responseText) => {
//             const resp = JSON.parse(responseText);
//             if (resp.error) {
//                 console.error(resp.error.message);
//                 return [];
//             }
//             return resp.layers.map((layer) => {
//                 const legendImages = layer.legend.map((legend) => {
//                     return {
//                         imageData: legend.imageData,
//                         name: layer.layerName && layer.layerName !== '.' ? layer.layerName : defaultName
//                     };
//                 });
//                 return [].concat(...legendImages);
//             });
//         })
//         .catch(reason => {
//             console.error(reason);
//             return [];
//         });
// };


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
        legendList.id = 'network-legend-list';
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


/**
 * Compresses the legend on smaller devices like phones
 * @param {L.Control} legendControl - Leaflet legend control
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
 * @param {L.Control} legendControl - Leaflet legend control
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
