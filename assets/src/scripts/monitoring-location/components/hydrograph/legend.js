import {createStructuredSelector} from 'reselect';

import {drawSimpleLegend} from '../../../d3-rendering/legend';
import {link} from '../../../lib/d3-redux';

import {getMainLayout} from './selectors/layout';
import {getLegendMarkerRows} from './selectors/legend-data';


export const drawTimeSeriesLegend = function(elem, store) {
    elem.append('div').attr('id', 'test-div').append('span').classed('usa-tag', true).text('important - graph data may be provisional')
        ;
    elem.append('div')
        .classed('hydrograph-container', true)
        .call(link(store, drawSimpleLegend, createStructuredSelector({
            legendMarkerRows: getLegendMarkerRows,
            layout: getMainLayout
        })));
};

