// functions to facilitate DV legend creation for a d3 plot
import {createStructuredSelector} from 'reselect';
import {getLayout} from './selectors/layout';
import {getLegendMarkerRows} from './selectors/legend-data';
import {drawSimpleLegend} from '../../d3-rendering/legend';
import {link} from '../../lib/d3-redux';

export const drawTimeSeriesLegend = function(elem, store) {
    elem.append('div')
        .classed('hydrograph-container', true)
        .call(link(store, drawSimpleLegend, createStructuredSelector({
            legendMarkerRows: getLegendMarkerRows,
            layout: getLayout
        })));
};

