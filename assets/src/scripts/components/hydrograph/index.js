/**
 * Hydrograph charting module.
 */
import { extent } from 'd3-array';
import { line as d3Line, curveStepAfter } from 'd3-shape';
import { select } from 'd3-selection';

import { createStructuredSelector } from 'reselect';

import { link, provide } from '../../lib/redux';

import { addSVGAccessibility } from '../../accessibility';
import config from '../../config';
import {isLoadingTS, hasAnyTimeSeries, getMonitoringLocationName,
    getAgencyCode} from '../../selectors/time-series-selector';
import { Actions } from '../../store';
import { callIf, mediaQuery } from '../../utils';

import { appendAxes, axesSelector } from './axes';
import { cursorSlider } from './cursor';
import { drawDateRangeControls } from './date-controls';
import { lineSegmentsByParmCdSelector, currentVariableLineSegmentsSelector, MASK_DESC, HASH_ID,
    getCurrentVariableMedianStatPoints } from './drawing-data';
import { drawGraphControls } from './graph-controls';
import { CIRCLE_RADIUS_SINGLE_PT, SPARK_LINE_DIM, layoutSelector } from './layout';
import { drawSimpleLegend, legendMarkerRowsSelector } from './legend';
import { drawMethodPicker } from './method-picker';
import { plotSeriesSelectTable, availableTimeSeriesSelector } from './parameters';
import { xScaleSelector, yScaleSelector, timeSeriesScalesByParmCdSelector } from './scales';
import { allTimeSeriesSelector, isVisibleSelector, titleSelector, descriptionSelector } from './time-series';
import { createTooltipFocus, createTooltipText } from './tooltip';


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


const plotDataLine = function(elem, {visible, lines, tsKey, xScale, yScale}) {
    if (!visible) {
        return;
    }

    const tsKeyClass = `ts-${tsKey}`;

    for (let line of lines) {
        if (line.classes.dataMask === null) {
            // If this is a single point line, then represent it as a circle.
            // Otherwise, render as a line.
            if (line.points.length === 1) {
                elem.append('circle')
                    .data(line.points)
                    .classed('line-segment', true)
                    .classed('approved', line.classes.approved)
                    .classed('estimated', line.classes.estimated)
                    .classed('not-current-method', !line.classes.currentMethod)
                    .classed(tsKeyClass, true)
                    .attr('r', CIRCLE_RADIUS_SINGLE_PT)
                    .attr('cx', d => xScale(d.dateTime))
                    .attr('cy', d => yScale(d.value));
            } else {
                const tsLine = d3Line()
                    .x(d => xScale(d.dateTime))
                    .y(d => yScale(d.value));
                elem.append('path')
                    .datum(line.points)
                    .classed('line-segment', true)
                    .classed('approved', line.classes.approved)
                    .classed('estimated', line.classes.estimated)
                    .classed('not-current-method', !line.classes.currentMethod)
                    .classed(`ts-${tsKey}`, true)
                    .attr('d', tsLine);
            }
        } else {
            const maskCode = line.classes.dataMask.toLowerCase();
            const maskDisplayName = MASK_DESC[maskCode].replace(' ', '-').toLowerCase();
            const [xDomainStart, xDomainEnd] = extent(line.points, d => d.dateTime);
            const [yRangeStart, yRangeEnd] = yScale.domain();
            let maskGroup = elem.append('g')
                .attr('class', `${tsKey}-mask-group`);
            const xSpan = xScale(xDomainEnd) - xScale(xDomainStart);
            const rectWidth = xSpan > 1 ? xSpan : 1;

            maskGroup.append('rect')
                .attr('x', xScale(xDomainStart))
                .attr('y', yScale(yRangeEnd))
                .attr('width', rectWidth)
                .attr('height', Math.abs(yScale(yRangeEnd) - yScale(yRangeStart)))
                .attr('class', `mask ${maskDisplayName}-mask`)
                .classed(`ts-${tsKey}`, true);


            const patternId = HASH_ID[tsKey] ? `url(#${HASH_ID[tsKey]})` : '';

            maskGroup.append('rect')
                .attr('x', xScale(xDomainStart))
                .attr('y', yScale(yRangeEnd))
                .attr('width', rectWidth)
                .attr('height', Math.abs(yScale(yRangeEnd) - yScale(yRangeStart)))
                .attr('fill', patternId);
        }
    }
};


const plotDataLines = function(elem, {visible, tsLinesMap, tsKey, xScale, yScale}, container) {
    container = container || elem.append('g');

    const elemId = `ts-${tsKey}-group`;
    container.selectAll(`#${elemId}`).remove();
    const tsLineGroup = container
        .append('g')
            .attr('id', elemId)
            .classed('tsKey', true);

    for (const lines of Object.values(tsLinesMap)) {
        plotDataLine(tsLineGroup, {visible, lines, tsKey, xScale, yScale});
    }

    return container;
};


const plotSvgDefs = function(elem) {

    let defs = elem.append('defs');

    defs.append('mask')
        .attr('id', 'display-mask')
        .attr('maskUnits', 'userSpaceOnUse')
        .append('rect')
            .attr('x', '0')
            .attr('y', '0')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', '#0000ff');

    defs.append('pattern')
        .attr('id', HASH_ID.current)
        .attr('width', '8')
        .attr('height', '8')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('patternTransform', 'rotate(45)')
        .append('rect')
            .attr('width', '4')
            .attr('height', '8')
            .attr('transform', 'translate(0, 0)')
            .attr('mask', 'url(#display-mask)');

    defs.append('pattern')
        .attr('id', HASH_ID.compare)
        .attr('width', '8')
        .attr('height', '8')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('patternTransform', 'rotate(135)')
        .append('rect')
            .attr('width', '4')
            .attr('height', '8')
            .attr('transform', 'translate(0, 0)')
            .attr('mask', 'url(#display-mask)');
};


export const timeSeriesLegend = function(elem) {
    elem.append('div')
        .classed('hydrograph-container', true)
        .call(link(drawSimpleLegend, createStructuredSelector({
            legendMarkerRows: legendMarkerRowsSelector,
            layout: layoutSelector
        })));
};


/**
 * Plots the median points for a single median time series.
 * @param  {Object} elem
 * @param  {Function} xscale
 * @param  {Function} yscale
 * @param  {Number} modulo
 * @param  {Array} points
 */
const plotMedianPoints = function(elem, {xscale, yscale, modulo, points}) {
    const stepFunction = d3Line()
        .curve(curveStepAfter)
        .x(function(d) {
            return xscale(d.date);
        })
        .y(function(d) {
            return yscale(d.value);
        });
    let medianGrp = elem.append('g');
    medianGrp.append('path')
        .datum(points)
        .classed('median-data-series', true)
        .classed('median-step', true)
        .classed(`median-step-${modulo}`, true)
        .attr('d', stepFunction);
};

/**
 * Plots the median points for all median time series for the current variable.
 * @param  {Object} elem
 * @param  {Boolean} visible
 * @param  {Function} xscale
 * @param  {Function} yscale
 * @param  {Array} pointsList
 */
const plotAllMedianPoints = function (elem, {visible, xscale, yscale, seriesPoints}) {
    elem.select('#median-points').remove();
    if (!visible) {
        return;
    }
    const container = elem
        .append('g')
            .attr('id', 'median-points');
    seriesPoints.forEach((points, index) => {
        plotMedianPoints(container, {xscale, yscale, modulo: index % 6, points: points});
    });
};


const createTitle = function(elem, siteNo, showMLName) {
    let titleDiv = elem.append('div')
        .classed('time-series-graph-title', true);

    if (showMLName) {
        titleDiv.append('div')
            .call(link((elem, {mlName, agencyCode}) => {
                elem.html(`${mlName}, ${agencyCode} ${siteNo}`);
            }, createStructuredSelector({
                mlName: getMonitoringLocationName(siteNo),
                agencyCode: getAgencyCode(siteNo)
            })));
    }
    titleDiv.append('div')
        .call(link((elem, title) => {
            elem.html(title);
        }, titleSelector));
};

const watermark = function (elem) {
    // These constants will need to change if the watermark svg is updated
    const watermarkHalfHeight = 87 / 2;
    const watermarkHalfWidth = 235 / 2;
    elem.append('img')
        .classed('watermark', true)
        .attr('alt', 'USGS - science for a changing world')
        .attr('src', config.STATIC_URL + '/img/USGS_green_logo.svg')
        .call(link(function(elem, layout) {
            const centerX = layout.margin.left + (layout.width - layout.margin.right - layout.margin.left) / 2;
            const centerY = layout.margin.top + (layout.height - layout.margin.bottom - layout.margin.top) / 2;
            const scale = !mediaQuery(config.USWDS_MEDIUM_SCREEN) ? 0.5 : 1;
            const translateX = centerX - watermarkHalfWidth;
            const translateY = centerY - watermarkHalfHeight;
            const transform = `matrix(${scale}, 0, 0, ${scale}, ${translateX}, ${translateY})`;

            elem.style('transform', transform);
            // for Safari browser
            elem.style('-webkit-transform', transform);

        }, layoutSelector));
};

export const timeSeriesGraph = function(elem, siteNo, showMLName) {
    elem.append('div')
        .attr('class', 'hydrograph-container')
        .call(watermark)
        .call(createTitle, siteNo, showMLName)
        .call(createTooltipText)
        .append('svg')
            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .classed('hydrograph-svg', true)
            .call(link((elem, layout) => {
                elem.attr('viewBox', `0 0 ${layout.width + layout.margin.left + layout.margin.right} ${layout.height + layout.margin.top + layout.margin.bottom}`);
                elem.attr('width', layout.width);
                elem.attr('height', layout.height);
            }, layoutSelector))
            .call(link(addSVGAccessibility, createStructuredSelector({
                title: titleSelector,
                description: descriptionSelector,
                isInteractive: () => true,
                idPrefix: () => 'hydrograph'
            })))
            .call(plotSvgDefs)
            .call(svg => {
                svg.append('g')
                    .call(link((elem, layout) => elem.attr('transform', `translate(${layout.margin.left},${layout.margin.top})`), layoutSelector))
                    .call(link(appendAxes, axesSelector))
                    .call(link(plotDataLines, createStructuredSelector({
                        visible: isVisibleSelector('current'),
                        tsLinesMap: currentVariableLineSegmentsSelector('current'),
                        xScale: xScaleSelector('current'),
                        yScale: yScaleSelector,
                        tsKey: () => 'current'
                    })))
                    .call(link(plotDataLines, createStructuredSelector({
                        visible: isVisibleSelector('compare'),
                        tsLinesMap: currentVariableLineSegmentsSelector('compare'),
                        xScale: xScaleSelector('compare'),
                        yScale: yScaleSelector,
                        tsKey: () => 'compare'
                    })))
                    .call(createTooltipFocus)
                    .call(link(plotAllMedianPoints, createStructuredSelector({
                        visible: isVisibleSelector('median'),
                        xscale: xScaleSelector('current'),
                        yscale: yScaleSelector,
                        seriesPoints: getCurrentVariableMedianStatPoints
                    })));
        });
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

export const loadingIndicator = function(elem, {showLoadingIndicator, sizeClass}) {
    elem.select('.loading-indicator').remove();
    if (showLoadingIndicator) {
        elem.append('i')
            .attr('class', `loading-indicator fas ${sizeClass} fa-spin fa-spinner`);
    }
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
                                          cursorOffset,
                                          showOnlyGraph = false,
                                          showMLName = false
                                      } = {}) {
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
            .call(link(loadingIndicator, createStructuredSelector({
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

    // Fetch the time series data
    if (period) {
        store.dispatch(Actions.retrieveCustomTimePeriodTimeSeries(siteno, '00060', period))
            .catch((message) => dataLoadingAlert(select(node), message ? message : 'No data returned'));
    } else {
        store.dispatch(Actions.retrieveTimeSeries(siteno, parameter ? [parameter] : null))
            .catch(() => dataLoadingAlert((select(node), 'No current time series data available for this site')));
    }
    store.dispatch(Actions.retrieveMedianStatistics(siteno));

    // Set up rendering functions for the graph-container
    nodeElem.select('.graph-container')
        .call(link(controlDisplay, hasAnyTimeSeries))
        .call(timeSeriesGraph, siteno, showMLName)
        .call(callIf(!showOnlyGraph, cursorSlider))
        .append('div')
            .classed('ts-legend-controls-container', true)
            .call(timeSeriesLegend);

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
