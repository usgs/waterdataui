import {line as d3Line, curveStepAfter} from 'd3-shape';

import config from '../../config';

import {addSVGAccessibility} from '../../d3-rendering/accessibility';
import {appendAxes} from '../../d3-rendering/axes';
import {link} from '../../lib/d3-redux';
import {getAgencyCode, getMonitoringLocationName} from '../../selectors/time-series-selector';

import {getAxes}  from './axes';
import {
    currentVariableLineSegmentsSelector,
    getCurrentVariableMedianStatPoints,
    HASH_ID
} from './drawing-data';
import {getMainLayout} from './layout';
import {createStructuredSelector} from 'reselect';
import {getMainXScale, getMainYScale} from './scales';
import {descriptionSelector, isVisibleSelector, titleSelector} from './time-series';
import {drawDataLines} from './time-series-data';
import {drawTooltipFocus, drawTooltipText}  from './tooltip';
import {mediaQuery}  from '../../utils';

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
        .x(function (d) {
            return xscale(d.date);
        })
        .y(function (d) {
            return yscale(d.value);
        });
    const medianGrp = elem.append('g');
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
const plotAllMedianPoints = function (elem, {visible, xscale, yscale, seriesPoints, enableClip}) {
    elem.select('#median-points').remove();
    if (!visible) {
        return;
    }
    const container = elem
        .append('g')
            .attr('id', 'median-points');
    if (enableClip) {
        container.attr('clip-path', 'url(#graph-clip');
    }
    seriesPoints.forEach((points, index) => {
        plotMedianPoints(container, {xscale, yscale, modulo: index % 6, points: points});
    });
};

const createTitle = function(elem, store, siteNo, showMLName) {
    let titleDiv = elem.append('div')
        .classed('time-series-graph-title', true);

    if (showMLName) {
        titleDiv.append('div')
            .call(link(store,(elem, {mlName, agencyCode}) => {
                elem.attr('class', 'monitoring-location-name-div')
                elem.html(`${mlName}, ${agencyCode} ${siteNo}`);
            }, createStructuredSelector({
                mlName: getMonitoringLocationName(siteNo),
                agencyCode: getAgencyCode(siteNo)
            })));
    }
    titleDiv.append('div')
        .call(link(store,(elem, title) => {
            elem.html(title);
        }, titleSelector));
};

const watermark = function (elem, store) {
    // These constants will need to change if the watermark svg is updated
    const watermarkHalfHeight = 87 / 2;
    const watermarkHalfWidth = 235 / 2;
    elem.append('img')
        .classed('watermark', true)
        .attr('alt', 'USGS - science for a changing world')
        .attr('src', config.STATIC_URL + '/img/USGS_green_logo.svg')
        .call(link(store, function(elem, layout) {
            const centerX = layout.margin.left + (layout.width - layout.margin.right - layout.margin.left) / 2;
            const centerY = layout.margin.top + (layout.height - layout.margin.bottom - layout.margin.top) / 2;
            const scale = !mediaQuery(config.USWDS_MEDIUM_SCREEN) ? 0.5 : 1;
            const translateX = centerX - watermarkHalfWidth;
            const translateY = centerY - watermarkHalfHeight;
            const transform = `matrix(${scale}, 0, 0, ${scale}, ${translateX}, ${translateY})`;

            elem.style('transform', transform);
            // for Safari browser
            elem.style('-webkit-transform', transform);

        }, getMainLayout));
};

export const drawTimeSeriesGraph = function(elem, store, siteNo, showMLName, showTooltip) {
    let graphDiv;

    graphDiv = elem.append('div')
        .attr('class', 'hydrograph-container')
        .call(watermark, store)
        .call(createTitle, store, siteNo, showMLName);
    if (showTooltip) {
        graphDiv.call(drawTooltipText, store);
    }
    graphDiv.append('svg')
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .classed('hydrograph-svg', true)
        .call(link(store,(elem, layout) => {
            elem.attr('viewBox', `0 0 ${layout.width + layout.margin.left + layout.margin.right} ${layout.height + layout.margin.top + layout.margin.bottom}`);
            elem.attr('width', layout.width);
            elem.attr('height', layout.height);
        }, getMainLayout))
        .call(link(store, addSVGAccessibility, createStructuredSelector({
            title: titleSelector,
            description: descriptionSelector,
            isInteractive: () => true,
            idPrefix: () => 'hydrograph'
        })))
        .call(plotSvgDefs)
        .call(link(store, (svg, layout) => {
            svg.select('#graph-clip').remove();
            svg.select('.plot-data-lines-group').remove();

            svg.append('clipPath')
                .attr('id', 'graph-clip')
                .append('rect')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width', layout.width - layout.margin.right)
                    .attr('height', layout.height - layout.margin.bottom);
            const dataGroup = svg.append('g')
                .attr('class', 'plot-data-lines-group')
                .call(link(store, (elem, layout) => elem.attr('transform', `translate(${layout.margin.left},${layout.margin.top})`), getMainLayout))
                .call(link(store, appendAxes, getAxes()))
                .call(link(store, drawDataLines, createStructuredSelector({
                    visible: isVisibleSelector('current'),
                    tsLinesMap: currentVariableLineSegmentsSelector('current'),
                    xScale: getMainXScale('current'),
                    yScale: getMainYScale,
                    tsKey: () => 'current',
                    layout: getMainLayout,
                    enableClip: () => true
                })))
                .call(link(store, drawDataLines, createStructuredSelector({
                    visible: isVisibleSelector('compare'),
                    tsLinesMap: currentVariableLineSegmentsSelector('compare'),
                    xScale: getMainXScale('compare'),
                    yScale: getMainYScale,
                    tsKey: () => 'compare',
                    layout: getMainLayout,
                    enableClip: () => true
                })))
                .call(link(store, plotAllMedianPoints, createStructuredSelector({
                    visible: isVisibleSelector('median'),
                    xscale: getMainXScale('current'),
                    yscale: getMainYScale,
                    seriesPoints: getCurrentVariableMedianStatPoints,
                    enableClip: () => true
                })));
            if (showTooltip) {
                dataGroup.call(drawTooltipFocus, store);
            }
        }, getMainLayout));
};