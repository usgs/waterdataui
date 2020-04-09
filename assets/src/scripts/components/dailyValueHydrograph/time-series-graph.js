import { line as d3Line } from 'd3-shape';
import includes from 'lodash/includes';
import {createStructuredSelector} from 'reselect';

import {addSVGAccessibility} from '../../d3-rendering/accessibility';
import {appendAxes} from '../../d3-rendering/axes';
import {link} from '../../lib/d3-redux';

import {getXAxis, getYAxis} from './selectors/axes';
import {getCurrentTimeSeriesDescription, getCurrentTimeSeriesTitle, getCurrentTimeSeriesYTitle} from './selectors/labels';
import {getMainLayout} from './selectors/layout';
import {getMainXScale, getMainYScale} from './selectors/scales';
import {getCurrentTimeSeriesLineSegments, APPROVED, ESTIMATED} from './selectors/time-series-data';

import {drawTooltipFocus, drawTooltipText} from './tooltip';

const CIRCLE_RADIUS_SINGLE_PT = 1;

const createTitle = function(elem, store) {
    elem.append('div')
        .classed('time-series-graph-title', true)
        .call(link(store, (elem, title) => {
            elem.html(title);
        }, getCurrentTimeSeriesYTitle));
};

const drawDataLine = function (group, {lineSegment, xScale, yScale}) {
    let lineElem;
    if (lineSegment.points.length === 1) {
        lineElem = group.append('circle')
            .data(lineSegment.points)
            .attr('r', CIRCLE_RADIUS_SINGLE_PT)
            .attr('cx', d => xScale(d.date))
            .attr('cy', d => yScale(d.value));
    } else {
        const dvLine = d3Line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.value));
        lineElem = group.append('path')
            .datum(lineSegment.points)
            .attr('d', dvLine);
    }
    lineElem
        .classed('line-segment', true)
        .classed('approved', includes(lineSegment.approvals, APPROVED))
        .classed('estimated', includes(lineSegment.approvals, ESTIMATED));
};

/*
 * Renders the line segments in lines using the D3 scales on the svg or group, elem, adding
 * the clip rectangle if enableClip
 * @param {D3 selection for svg or group} elem
 * @param {Array of Object} lines
 * @param {D3 scale} xScale
 * @param {D3 scale} yScale
 * @param {Boolean} enableClip
 */
export const drawDataLines = function (elem, {lines, xScale, yScale, enableClip}) {
    elem.select('#daily-values-lines-group').remove();

    const allLinesGroup = elem.append('g')
        .attr('id', 'daily-values-lines-group');
    if (enableClip) {
        allLinesGroup.attr('clip-path', 'url(#dv-graph-clip)');
    }

    lines.forEach((lineSegment) => {
        drawDataLine(allLinesGroup, {lineSegment, xScale, yScale});
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
            })));
    svg.append('g')
        .attr('class', 'daily-values-graph-group')
        .call(link(store, (elem, layout) => elem.attr('transform', `translate(${layout.margin.left},${layout.margin.top})`), getMainLayout))
        .call(link(store, appendAxes, createStructuredSelector({
            xAxis: getXAxis(),
            yAxis: getYAxis(),
            layout: getMainLayout,
            yTitle: getCurrentTimeSeriesYTitle
        })))
        .call(link(store, drawDataLines, createStructuredSelector({
            lines: getCurrentTimeSeriesLineSegments,
            xScale: getMainXScale,
            yScale: getMainYScale,
            layout: getMainLayout,
            enableClip: () => true
        })))
        .call(drawTooltipFocus, store);
};