// Creates a Leaflet legend control. If the legend contains FIM information than the expand/collapse control
// will be visible
import {select} from 'd3-selection';

import {legendControl} from 'ui/leaflet-rendering/legend-control';
import {listen} from 'ui/lib/d3-redux';

import {hasNetworkData} from 'network/selectors/network-data-selector';

import {MARKER_FILL_COLOR, MARKER_FILL_OPACITY} from './map';

/**
 * Creates the network legend if network data is available, otherwise removes the network legend if it exists.
 * @param {Redux store} - store
 * @return {Leaflet Control}
 */
export const createMapLegend = function(map, store) {
    const networkLegendControl = legendControl({
        addExpandButton: false
    });
    map.addControl(networkLegendControl);

    listen(store, hasNetworkData, (showLegend) => {
            if (showLegend) {
                const legendListContainer = select(networkLegendControl.getLegendListContainer());
                const networkLegendList = legendListContainer.append('ul')
                            .attr('id', 'network-legend-list')
                            .attr('class', 'usa-list--unstyled');

                const networkMarker = networkLegendList.append('li');
                networkMarker.append('span')
                    .attr('class', 'fas fa-circle')
                    .style('color', MARKER_FILL_COLOR)
                    .style('width', '16px')
                    .style('height', '16px')
                    .style('float', 'left')
                    .style('opacity', MARKER_FILL_OPACITY);
                networkMarker.append('span').text('Network Sites');
            } else {
                select(networkLegendControl.getContainer()).select('#network-legend-list').remove();
            }
        }
    );

    return networkLegendControl;
};

