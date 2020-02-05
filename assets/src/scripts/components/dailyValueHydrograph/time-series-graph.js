import {createSelector, createStructuredSelector} from 'reselect';

import {addSVGAccessibility} from '../../d3-rendering/accessibility';
import {link} from '../../lib/d3-redux';
import {getCurrentObservationsTimeSeries} from '../../selectors/observations-selector';

import {appendAxes} from '../../d3-rendering/axes';

import {getLayout} from './layout';
import {getXAxis, getYAxis} from './axes';
import {getMainLayout} from "../hydrograph/layout";

const getTimeSeriesTitle = createSelector(
    getCurrentObservationsTimeSeries,
    (timeSeries) => {
        return timeSeries && timeSeries.properties && timeSeries.properties.observedPropertyName ?
            timeSeries.properties.observedPropertyName : '';
    }
);

const getTimeSeriesDescription = createSelector(
    getCurrentObservationsTimeSeries,
    (timeSeries) => {
        return timeSeries && timeSeries.properties && timeSeries.properties.observedPropertyName ?
            `${timeSeries.properties.observedPropertyName} for ${timeSeries.properties.samplingFeatureName}` : '';
    }
);

const getYTitle = createSelector(
    getCurrentObservationsTimeSeries,
    (timeSeries) => {
        return timeSeries ?
            `${timeSeries.properties.observedPropertyName}, ${timeSeries.properties.unitOfMeasureName}` : '';
    }
);

export const drawTimeSeriesGraph = function(elem, store) {

    const svg = elem.append('div')
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
                title: getTimeSeriesTitle,
                description: getTimeSeriesDescription,
                isInteractive: () => true,
                idPrefix: () => 'dv-hydrograph'
            })));
    svg.append('g')
        .attr('class', 'daily-values-graph-group')
        .call(link(store, (elem, layout) => elem.attr('transform', `translate(${layout.margin.left},${layout.margin.top})`), getLayout))
        .call(link(store, appendAxes, createStructuredSelector({
            xAxis: getXAxis,
            yAxis: getYAxis,
            layout: getLayout,
            yTitle: getYTitle
        })));
};