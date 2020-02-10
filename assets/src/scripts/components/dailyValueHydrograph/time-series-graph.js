import { line as d3Line } from 'd3-shape';
import includes from 'lodash/includes';
import {createStructuredSelector} from 'reselect';

import {addSVGAccessibility} from '../../d3-rendering/accessibility';
import {link} from '../../lib/d3-redux';

import {appendAxes} from '../../d3-rendering/axes';

import {getXAxis, getYAxis} from './selectors/axes';
import {getCurrentTimeSeriesDescription, getCurrentTimeSeriesTitle, getCurrentTimeSeriesYTitle} from './selectors/labels';
import {getLayout} from './selectors/layout';
import {getXScale, getYScale} from './selectors/scales';
import {getCurrentTimeSeriesLineSegments} from './selectors/time-series-lines';

const APPROVED = 'Approved';
const ESTIMATED = 'Estimated';
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

const drawDataLines = function (elem, {lines, xScale, yScale, layout}) {
    elem.select('#daily-values-lines-group').remove();

    const linesGroup = elem.append('g')
        .attr('id', 'daily-values-lines-group')
        .attr('x', layout.margin.left)
        .attr('y', layout.margin.top)
        .attr('width', layout.width - layout.margin.right)
        .attr('height', layout.height - layout.margin.bottom);
    lines.forEach((lineSegment) => {
        drawDataLine(linesGroup, {lineSegment, xScale, yScale});
    });
};

export const drawTimeSeriesGraph = function(elem, store) {

    const svg = elem.append('div')
        .attr('class', 'hydrograph-container')
        .call(createTitle, store)
        .append('svg')
            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .classed('hydrograph-svg', true)
            .call(link(store,(elem, layout) => {
                elem.attr('viewBox', `0 0 ${layout.width + layout.margin.left + layout.margin.right} ${layout.height + layout.margin.top + layout.margin.bottom}`);
                elem.attr('width', layout.width);
                elem.attr('height', layout.height);
            }, getLayout))
            .call(link(store, addSVGAccessibility, createStructuredSelector({
                title: getCurrentTimeSeriesTitle,
                description: getCurrentTimeSeriesDescription,
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
            yTitle: getCurrentTimeSeriesYTitle
        })))
        .call(link(store, drawDataLines, createStructuredSelector({
            lines: getCurrentTimeSeriesLineSegments,
            xScale: getXScale,
            yScale: getYScale,
            layout: getLayout
        })));
};