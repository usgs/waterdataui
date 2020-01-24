/**
 * Hydrograph charting module.
 */
import { select } from 'd3-selection';

import { createStructuredSelector } from 'reselect';

import { link, provide } from '../../lib/redux';

import {isLoadingTS, hasAnyTimeSeries, getIanaTimeZone} from '../../selectors/time-series-selector';
import { Actions } from '../../store';
import { callIf } from '../../utils';

import { cursorSlider } from './cursor';
import { drawDateRangeControls } from './date-controls';
import { lineSegmentsByParmCdSelector } from './drawing-data';
import { drawGraphControls } from './graph-controls';
import { SPARK_LINE_DIM, layoutSelector } from './layout';
import { drawTimeSeriesLegend } from './legend';
import { drawLoadingIndicator } from '../loading-indicator';
import { drawMethodPicker } from './method-picker';
import { plotSeriesSelectTable, availableTimeSeriesSelector } from './parameters';
import { timeSeriesScalesByParmCdSelector } from './scales';
import { allTimeSeriesSelector } from './time-series';
import { drawTimeSeriesGraph } from './time-series-graph';
import {DateTime} from "luxon";


const drawMessage = function(elem, message) {
    // Set up parent element and SVG
    elem.innerHTML = '';
    const alertBox = elem
        .append('div')
            .attr('class', 'usa-alert usa-alert-warning')
            .append('div')
                .attr('class', 'usa-alert-body');
    alertBox
        .append('h3')
            .attr('class', 'usa-alert-heading')
            .html('Hydrograph Alert');
    alertBox
        .append('p')
            .html(message);
};

/**
 * Modify styling to hide or display the elem.
 *
 * @param elem
 * @param {Boolean} showElem
 */
const controlDisplay = function(elem, showElem) {
    elem.attr('hidden', showElem ? null : true);
};

const dataLoadingAlert = function(elem, message) {
    elem.select('#no-data-message').remove();
    if (message) {
        elem.append('div')
            .attr('id', 'no-data-message')
            .attr('class', 'usa-alert usa-alert-info')
            .append('div')
            .attr('class', 'usa-alert-body')
            .append('p')
            .attr('class', 'usa-alert-text')
            .text(message);
    }
};

export const attachToNode = function (store,
                                      node,
                                      {
     siteno,
     parameter,
     compare,
     period,
     startDT,
     endDT,
     cursorOffset,
     showOnlyGraph = false,
     showMLName = false
 } = {}, locationIanaTimeZone = null) {
    const nodeElem = select(node);

    if (!siteno) {
        select(node).call(drawMessage, 'No data is available.');
        return;
    }

    // Initialize hydrograph with the store and show the loading indicator
    store.dispatch(Actions.resizeUI(window.innerWidth, node.offsetWidth));
    nodeElem
        .call(provide(store))
        .select('.loading-indicator-container')
            .call(link(drawLoadingIndicator, createStructuredSelector({
                showLoadingIndicator: isLoadingTS('current', 'P7D'),
                sizeClass: () => 'fa-3x'
            })));

    // If specified, turn the visibility of the comparison time series on.
    if (compare) {
        store.dispatch(Actions.toggleTimeSeries('compare', true));
    }

    // If specified, initialize the cursorOffset
    if (cursorOffset !== undefined) {
        store.dispatch(Actions.setCursorOffset(cursorOffset));
    }

    if (startDT !==undefined && endDT !== undefined) {
        store.dispatch(Actions.retrieveDataForDateRange(siteno, startDT, endDT, parameter));
    }

    // Fetch the time series data
    if (period) {
        store.dispatch(Actions.retrieveCustomTimePeriodTimeSeries(siteno, parameter ? parameter : '00060', period))
            .catch((message) => dataLoadingAlert(select(node), message ? message : 'No data returned'));
    } else {
        store.dispatch(Actions.retrieveTimeSeries(siteno, parameter ? [parameter] : null))
            .catch(() => dataLoadingAlert((select(node), 'No current time series data available for this site')));
    }
    store.dispatch(Actions.retrieveMedianStatistics(siteno));

    // Set up rendering functions for the graph-container
    nodeElem.select('.graph-container')
        .call(link(controlDisplay, hasAnyTimeSeries))
        .call(drawTimeSeriesGraph, siteno, showMLName)
        .call(callIf(!showOnlyGraph, cursorSlider))
        .append('div')
            .classed('ts-legend-controls-container', true)
            .call(drawTimeSeriesLegend);

    // Add UI interactive elements and the provisional data alert.
    if (!showOnlyGraph) {
        nodeElem
            .call(drawMethodPicker)
            .call(drawDateRangeControls, siteno);

        nodeElem.select('.ts-legend-controls-container')
            .call(drawGraphControls);

        nodeElem.select('.select-time-series-container')
            .call(link(plotSeriesSelectTable, createStructuredSelector({
                siteno: () => siteno,
                availableTimeSeries: availableTimeSeriesSelector,
                lineSegmentsByParmCd: lineSegmentsByParmCdSelector('current', 'P7D'),
                timeSeriesScalesByParmCd: timeSeriesScalesByParmCdSelector('current', 'P7D', SPARK_LINE_DIM),
                layout: layoutSelector
            })));
        nodeElem.select('.provisional-data-alert')
            .call(link(function(elem, allTimeSeries) {
                elem.attr('hidden', Object.keys(allTimeSeries).length ? null : true);
            }, allTimeSeriesSelector));
    }

    window.onresize = function() {
        store.dispatch(Actions.resizeUI(window.innerWidth, node.offsetWidth));
    };
};
