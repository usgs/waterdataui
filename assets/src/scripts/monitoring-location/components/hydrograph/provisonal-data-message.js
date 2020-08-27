import {createStructuredSelector} from 'reselect';

import {createProvisionalDataMessage} from '../../../d3-rendering/provisional-data-message';
import {link} from '../../../lib/d3-redux';

import {getMainLayout} from './selectors/layout';
import {getLegendMarkerRows} from './selectors/legend-data';


export const renderProvisionalDataMessage = function(elem, store) {
    elem.append('div')
        .classed('hydrograph-container', true)
        .call(link(store, createProvisionalDataMessage, createStructuredSelector({
            legendMarkerRows: getLegendMarkerRows,
            layout: getMainLayout
        })));
};