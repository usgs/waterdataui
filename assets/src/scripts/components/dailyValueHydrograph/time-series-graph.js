import memoize from 'fast-memoize';
import {createSelector, createStructuredSelector} from 'reselect';

import {addSVGAccessibility} from '../../d3-utils/accessibility';
import {link} from '../../lib/d3-redux';
import {getTimeSeries} from '../../selectors/observations-selector';

import {getLayout} from './layout';

const getTimeSeriesTitle = memoize((timeSeriesId) => createSelector(
    getTimeSeries(timeSeriesId),
    (timeSeries) => {
        return timeSeries.properties && timeSeries.properties.observedPropertyName ?
            timeSeries.properties.observedPropertyName : '';
    }
));

const getTimeSeriesDescription = memoize((timeSeriesId) => createSelector(
    getTimeSeries(timeSeriesId),
    (timeSeries) => {
        return timeSeries.properties && timeSeries.properties.observedPropertyName ?
            `${timeSeries.properties.observedPropertyName} for ${timeSeries.properties.samplingFeatureName}` : '';
    }
));

export const drawTimeSeriesGraph = function(elem, store, timeSeriesId) {

    elem.append('div')
        .attr('class', 'hydrograph-container')
        .append('svg')
            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .classed('hydrograph-svg', true)
            .call(link(store,(elem, layout) => {
                elem.attr('viewBox', `0 0 ${layout.width + layout.margin.left + layout.margin.right} ${layout.height + layout.margin.top + layout.margin.bottom}`);
                elem.attr('width', layout.width);
                elem.attr('height', layout.height);
            }, getLayout))
            .call(link(store, addSVGAccessibility, createStructuredSelector({
            title: getTimeSeriesTitle(timeSeriesId),
            description: getTimeSeriesDescription(timeSeriesId),
            isInteractive: () => true,
            idPrefix: () => 'dv-hydrograph'
        })));
};