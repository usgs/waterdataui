import { extent } from 'd3-array';
import { line as d3Line, curveStepAfter } from 'd3-shape';

import {link} from '../../lib/redux';

import {addSVGAccessibility} from '../../accessibility';
import {appendAxes, axesSelector} from './axes';
import config from '../../config';
import {
    currentVariableLineSegmentsSelector,
    getCurrentVariableMedianStatPoints,
    HASH_ID,
    MASK_DESC
} from './drawing-data';
import {CIRCLE_RADIUS_SINGLE_PT, layoutSelector} from './layout';
import {createStructuredSelector} from 'reselect';
import {xScaleSelector, yScaleSelector} from './scales';
import {descriptionSelector, isVisibleSelector, titleSelector} from './time-series';
import {getAgencyCode, getMonitoringLocationName} from '../../selectors/time-series-selector';
import {createTooltipFocus, createTooltipText} from './tooltip';
import {mediaQuery} from '../../utils';


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

export const drawTimeSeriesGraph = function(elem, siteNo, showMLName) {
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