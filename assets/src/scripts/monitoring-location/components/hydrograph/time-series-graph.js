import {line as d3Line, curveStepAfter} from 'd3-shape';
import {createStructuredSelector} from 'reselect';

import config from '../../../config';
import {addSVGAccessibility} from '../../../d3-rendering/accessibility';
import {appendAxes} from '../../../d3-rendering/axes';
import {renderMaskDefs} from '../../../d3-rendering/data-masks';
import {link} from '../../../lib/d3-redux';
import {mediaQuery}  from '../../../utils';

import {getAgencyCode, getMonitoringLocationName} from '../../selectors/time-series-selector';
import {isWaterwatchVisible, getWaterwatchFloodLevels} from '../../selectors/flood-data-selector';

import {getAxes}  from './selectors/axes';
import {
    getCurrentVariableLineSegments,
    getCurrentVariableMedianStatPoints,
    HASH_ID
} from './selectors/drawing-data';
import {getMainLayout} from './selectors/layout';
import {getMainXScale, getMainYScale, getBrushXScale} from './selectors/scales';
import {getDescription, isVisible, getTitle} from './selectors/time-series-data';
import {drawDataLines} from './time-series-lines';
import {drawTooltipFocus, drawTooltipText}  from './tooltip';

const addDefsPatterns = function(elem) {
    const patterns = [{
        patternId: HASH_ID.current,
        patternTransform: 'rotate(45)'
    }, {
        patternId: HASH_ID.compare,
        patternTransform: 'rotate(135)'
    }];
    const defs = elem.append('defs');
    renderMaskDefs(defs, 'iv-graph-pattern-mask', patterns);
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
 * @param  {Array} seriesPoints
 * @param {Boolean} enableClip
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

/**
 * Plots the Waterwatch flood level points for a multiple time series.
 * @param  {Object} elem
 * @param  {Function} xscale
 * @param  {Function} yscale
 * @param  {Number} modulo
 * @param  {Array} points
 */
const plotFloodLevelPoints = function(elem, {xscale, yscale, points, classes}) {
    const stepFunction = d3Line()
        .x(function (_,i) {
            return xscale(xscale.domain()[i]);
        })
        .y(function (d) {
            return yscale(d);
        });
    const floodLevelGrp = elem.append('g');
    floodLevelGrp.append('path')
        .datum(points)
        .classed(classes[0], true)
        .classed(classes[1], true)
        .attr('d', stepFunction);
};

/**
 * Plots the Waterwatch points for all flood levels for the current variable.
 * @param  {Object} elem
 * @param  {Boolean} visible
 * @param  {Function} xscale
 * @param  {Function} yscale
 * @param  {Array} seriesPoints
 * @param {Boolean} enableClip
 */
const plotAllFloodLevelPoints = function(elem, {visible, xscale, yscale, seriesPoints, enableClip}) {
    elem.select('#flood-level-points').remove();
    if (!visible) {
        return;
    }
    const container = elem
        .append('g')
        .lower()
            .attr('id', 'flood-level-points');
    if (enableClip) {
        container.attr('clip-path', 'url(#graph-clip');
    }
    const keys = ['actionStage', 'floodStage', 'moderateFloodStage', 'majorFloodStage'];
    const classes = [['waterwatch-data-series','action-stage'],
        ['waterwatch-data-series','flood-stage'],
        ['waterwatch-data-series','moderate-flood-stage'],
        ['waterwatch-data-series','major-flood-stage']];

    keys.forEach((key, index) => {
        plotFloodLevelPoints(container, {xscale, yscale, points: Array(2).fill(seriesPoints[key]),
            classes: classes[index]});
    });
};


const createTitle = function(elem, store, siteNo, showMLName) {
    let titleDiv = elem.append('div')
        .classed('time-series-graph-title', true);

    if (showMLName) {
        titleDiv.append('div')
            .call(link(store,(elem, {mlName, agencyCode}) => {
                elem.attr('class', 'monitoring-location-name-div')
                    .html(`${mlName}, ${agencyCode} ${siteNo}`);
            }, createStructuredSelector({
                mlName: getMonitoringLocationName(siteNo),
                agencyCode: getAgencyCode(siteNo)
            })));
    }
    titleDiv.append('div')
        .call(link(store,(elem, title) => {
            elem.html(title);
        }, getTitle));
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

/*
 * Renders the IV time series graph with the D3 elem using the state information in store.
 * @param {D3 selection} elem
 * @param {Redux store} store
 * @param {String} siteNo
 * @param {Boolean} showMLName - If true add the monitoring location name to the top of the graph
 * @param {Boolean} showTooltip - If true render the tooltip text and add the tooltip focus element
 */
export const drawTimeSeriesGraph = function(elem, store, siteNo, showMLName, showTooltip) {
    let graphDiv;

    graphDiv = elem.append('div')
        .attr('class', 'hydrograph-container')
        .call(watermark, store)
        .call(createTitle, store, siteNo, showMLName);
    if (showTooltip) {
        graphDiv.call(drawTooltipText, store);
    }
    const graphSvg = graphDiv.append('svg')
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .classed('hydrograph-svg', true)
        .call(link(store,(elem, layout) => {
            elem.select('#graph-clip').remove();
            elem.attr('viewBox', `0 0 ${layout.width + layout.margin.left + layout.margin.right} ${layout.height + layout.margin.top + layout.margin.bottom}`)
                .append('clipPath')
                    .attr('id', 'graph-clip')
                    .append('rect')
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('width', layout.width - layout.margin.right)
                        .attr('height', layout.height - layout.margin.bottom);
            }, getMainLayout))
        .call(link(store, addSVGAccessibility, createStructuredSelector({
            title: getTitle,
            description: getDescription,
            isInteractive: () => true,
            idPrefix: () => 'hydrograph'
        })))
        .call(addDefsPatterns);

    const dataGroup = graphSvg.append('g')
        .attr('class', 'plot-data-lines-group')
        .call(link(store, (group, layout) => {
            group.attr('transform', `translate(${layout.margin.left},${layout.margin.top})`);
        }, getMainLayout))
        .call(link(store, appendAxes, getAxes()))
        .call(link(store, drawDataLines, createStructuredSelector({
            visible: isVisible('current'),
            tsLinesMap: getCurrentVariableLineSegments('current'),
            xScale: getMainXScale('current'),
            yScale: getMainYScale,
            tsKey: () => 'current',
            enableClip: () => true
        })))
        .call(link(store, drawDataLines, createStructuredSelector({
            visible: isVisible('compare'),
            tsLinesMap: getCurrentVariableLineSegments('compare'),
            xScale: getMainXScale('compare'),
            yScale: getMainYScale,
            tsKey: () => 'compare',
            enableClip: () => true
        })))
        .call(link(store, plotAllMedianPoints, createStructuredSelector({
            visible: isVisible('median'),
            xscale: getMainXScale('current'),
            yscale: getMainYScale,
            seriesPoints: getCurrentVariableMedianStatPoints,
            enableClip: () => true
        })))
       .call(link(store, plotAllFloodLevelPoints, createStructuredSelector({
            visible: isWaterwatchVisible,
            xscale: getBrushXScale('current'),
            yscale: getMainYScale,
            seriesPoints: getWaterwatchFloodLevels
        })));
    if (showTooltip) {
        dataGroup.call(drawTooltipFocus, store);
    }
};