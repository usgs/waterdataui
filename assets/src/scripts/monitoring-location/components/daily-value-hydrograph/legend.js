// functions to facilitate DV legend creation for a d3 plot
import {createStructuredSelector} from 'reselect';

import {link} from 'ui/lib/d3-redux';

import {drawSimpleLegend} from 'd3render/legend';

import {getMainLayout} from './selectors/layout';
import {getLegendMarkers} from './selectors/legend-data';

/*
 * Renders the legend on elem using information in the Redux store
 * @param {D3 selection} elem
 * @param {Redux store} store
 */
export const drawTimeSeriesLegend = function(elem, store) {
    elem.append('div')
        .classed('hydrograph-container', true)
        .call(link(store, drawSimpleLegend, createStructuredSelector({
            legendMarkerRows: (state) => getLegendMarkers(state),
            layout: getMainLayout
        })));
};

