import { line as d3Line } from 'd3-shape';
import {createStructuredSelector} from 'reselect';

import {addSVGAccessibility} from '../../d3-rendering/accessibility';
import {appendAxes} from '../../d3-rendering/axes';
import {renderMaskDefs} from '../../d3-rendering/data-masks';
import {link} from '../../lib/d3-redux';

import {getXAxis, getYAxis} from './selectors/axes';
import {getCurrentTimeSeriesDescription, getCurrentTimeSeriesTitle, getCurrentTimeSeriesYTitle} from './selectors/labels';
import {getMainLayout} from './selectors/layout';
import {getMainXScale, getMainYScale} from './selectors/scales';
import {getCurrentTimeSeriesSegments} from './selectors/time-series-data';

import {drawTooltipFocus, drawTooltipText} from './tooltip';

const CIRCLE_RADIUS_SINGLE_PT = 1;

const STROKE_DASH_ARRAY = {
    min: '4,4',
    median: '',
    max: '5,5,2,2,2,2'
};

const MASK_PATTERN_ID = {
    min: 'dv-min-masked-pattern',
    median: 'dv-median-masked-pattern',
    max: 'dv-max-masked-pattern'
};

const createTitle = function(elem, store) {
    elem.append('div')
        .classed('time-series-graph-title', true)
        .call(link(store, (elem, title) => {
            elem.html(title);
        }, getCurrentTimeSeriesYTitle));
};

const addDefsPatterns = function(elem) {
    const patterns = [{
        patternId: 'dv-min-masked-pattern',
        patternTransform: 'rotate(45)'
    }, {
        patternId: 'dv-median-masked-pattern',
        patternTransform: 'skewX(30)'
    }, {
        patternId: 'dv-max-masked-pattern',
        patternTransform: 'rotate(135)'
    }];

    const defs = elem.append('defs');
    renderMaskDefs(defs, 'dv-graph-pattern-mask', patterns);
};

const drawLineSegment = function (group, {segment, tsKey, xScale, yScale}) {
    let lineElem;
    if (segment.points.length === 1) {
        lineElem = group.append('circle')
            .data(segment.points)
            .attr('r', CIRCLE_RADIUS_SINGLE_PT)
            .attr('cx', d => xScale(d.dateTime))
            .attr('cy', d => yScale(d.value));
    } else {
        const dvLine = d3Line()
            .x(d => xScale(d.dateTime))
            .y(d => yScale(d.value))
            .style('stroke-dasharray', STROKE_DASH_ARRAY[tsKey]);
        lineElem = group.append('path')
            .datum(segment.points)
            .attr('d', dvLine);
    }
    lineElem
        .classed('line-segment', true)
        .classed(segment.class, true);
};

const drawMaskSegment = function(group, {segment, tsKey, xScale, yScale}) {
    const [yRangeStart, yRangeEnd] = yScale.range();
    const xRangeStart = xScale(segment.points[0].dateTime);
    const xRangeEnd = xScale(segment.points[segment.points.length - 1].dateTime);

    // Some data is shown with the yAxis decreasing from top top bottom
    const yTop = yRangeEnd > yRangeStart ? yRangeStart : yRangeEnd;

    const xSpan = xRangeEnd - xRangeStart;
    const rectWidth = xSpan > 1 ? xSpan : 1;
    const rectHeight = Math.abs(yRangeEnd - yRangeStart);

    const maskGroup = group.append('g')
        .attr('class', 'dv-mask-group');

    maskGroup.append('rect')
        .attr('x', xRangeStart)
        .attr('y', yTop)
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .classed('mask', true)
        .classed(segment.class, true);
    maskGroup.append('rect')
        .attr('x', xRangeStart)
        .attr('y', yRangeEnd)
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .attr('fill', `url(#${MASK_PATTERN_ID[tsKey]})`);
};

const drawDataSegment = function(group, {segment, tsKey, xScale, yScale}) {
    if (segment.isMasked) {
        drawMaskSegment(group, {segment, tsKey, xScale, yScale});
    } else {
        drawLineSegment(group, {segment, tsKey, xScale, yScale});
    }
};

/*
 * Renders the segments  using the D3 scales on the svg or group, elem, adding
 * the clip rectangle if enableClip
 * @param {D3 selection for svg or group} elem
 * @param {Array of Object} segments
 * @param {D3 scale} xScale
 * @param {D3 scale} yScale
 * @param {Boolean} enableClip
 */
export const drawDataSegments = function (elem, {segments, xScale, yScale, enableClip}) {
    elem.select('#daily-values-lines-group').remove();

    const drawingGroup = elem.append('g')
        .attr('id', 'daily-values-lines-group');
    if (enableClip) {
        drawingGroup.attr('clip-path', 'url(#dv-graph-clip)');
    }

    Object.keys(segments).forEach((tsKey) => {
        segments[tsKey].forEach((segment) => {
            drawDataSegment(drawingGroup, {segment, tsKey, xScale, yScale});
        });
    });
};

/*
 * Renders the time series graph and tooltip
 * @param {D3 selection} elem
 * @param {Redux store} store
 */
export const drawTimeSeriesGraph = function(elem, store) {
    const svg = elem.append('div')
        .attr('class', 'hydrograph-container')
        .call(createTitle, store)
        .call(drawTooltipText, store)
        .append('svg')
            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .classed('hydrograph-svg', true)
            .call(link(store,(elem, layout) => {
                elem.select('#dv-graph-clip').remove();
                elem.attr('viewBox', `0 0 ${layout.width + layout.margin.left + layout.margin.right} ${layout.height + layout.margin.top + layout.margin.bottom}`)
                    .append('clipPath')
                    .attr('id', 'dv-graph-clip')
                    .append('rect')
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('width', layout.width - layout.margin.right)
                        .attr('height', layout.height - layout.margin.bottom);
            }, getMainLayout))
            .call(link(store, addSVGAccessibility, createStructuredSelector({
                title: getCurrentTimeSeriesTitle,
                description: getCurrentTimeSeriesDescription,
                isInteractive: () => true,
                idPrefix: () => 'dv-hydrograph'
            })))
            .call(addDefsPatterns);
    svg.append('g')
        .attr('class', 'daily-values-graph-group')
        .call(link(store, (elem, layout) => elem.attr('transform', `translate(${layout.margin.left},${layout.margin.top})`), getMainLayout))
        .call(link(store, appendAxes, createStructuredSelector({
            xAxis: getXAxis(),
            yAxis: getYAxis(),
            layout: getMainLayout,
            yTitle: getCurrentTimeSeriesYTitle
        })))
        .call(link(store, drawDataSegments, createStructuredSelector({
            segments: getCurrentTimeSeriesSegments,
            xScale: getMainXScale,
            yScale: getMainYScale,
            layout: getMainLayout,
            enableClip: () => true
        })))
        .call(drawTooltipFocus, store);
};