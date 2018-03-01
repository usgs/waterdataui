const { extent } = require('d3-array');
const { scaleTime } = require('d3-scale');
const memoize = require('fast-memoize');
const { createSelector } = require('reselect');

const { default: scaleSymlog } = require('../../lib/symlog');
const { layoutSelector, MARGIN } = require('./layout');
const { pointsSelector } = require('./timeseries');

const paddingRatio = 0.2;


/**
 *  Return domain padded on both ends by paddingRatio.
 *  For positive domains, a zero-lower bound on the y-axis is enforced.
 *  @param {Array} domain - array of two numbers
 *  @return {Array} - array of two numbers
 */
function extendDomain(domain) {
    const padding = paddingRatio * (domain[1] - domain[0]);
    const isPositive = domain[0] >= 0 && domain[1] >= 0;
    return [
        // If all values are above zero, make a-axis zero the lower bound
        isPositive ? Math.max(0, domain[0] - padding) : domain[0] - padding,
        domain[1] + padding
    ];
}


/**
 * Create an x-scale oriented on the left
 * @param {Array} values - Array contains {time, ...}
 * @param {Number} xSize - range of scale
 * @return {Object} d3 scale for time.
 */
function createXScale(values, xSize) {
    // Calculate max and min for values
    const xExtent = values.length ? extent(values, d => d.time) : [0, 1];

    // xScale is oriented on the left
    return scaleTime()
        .range([0, xSize])
        .domain(xExtent);
}


/**
 * Create a yScale for the plots where you only have a single array of data
 *
 * @param tsData - array of data points with time and value keys
 * @param ySize - range of the scale
 * * @return {Object} d3 scale for value.
 */
function singleSeriesYScale(tsData, ySize) {
    let points = tsData.filter(pt => pt.value !== null);
    let yExtent = extent(points, d => d.value);
    return scaleSymlog()
        .domain(yExtent)
        .range([ySize, 0]);
}


/**
 * Create an yscale oriented on the bottom
 * @param {Array} tsData - where xScale are Array contains {value, ...}
 * @param {Object} showSeries  - keys match keys in tsData and values are Boolean
 * @param {Number} ySize - range of scale
 * @return {Object} d3 scale for value.
 */
function createYScale(tsData, parmCd, showSeries, ySize) {
    let yExtent;
    let scaleDomains = [];

    // Calculate max and min for data
    for (let key of Object.keys(tsData)) {
        if (!tsData[key][parmCd]) {
            continue;
        }

        let points = tsData[key][parmCd].values.filter(pt => pt.value !== null);
        if (!showSeries[key] || points.length === 0) {
            continue;
        }
        scaleDomains.push(singleSeriesYScale(points, ySize).domain());
    }
    if (scaleDomains) {
        const flatDomains = [].concat(...scaleDomains);
        yExtent = Math.min(...flatDomains) && Math.max(...flatDomains) ? [Math.min(...flatDomains), Math.max(...flatDomains)] : undefined;
    }
    // Add padding to the extent and handle empty data sets.
    if (yExtent) {
        yExtent = extendDomain(yExtent);
    } else {
        yExtent = [0, 1];
    }
    return scaleSymlog()
        .domain(yExtent)
        .range([ySize, 0]);
}


/**
 * Factory function creates a function that is:
 * Selector for x-scale
 * @param  {Object} state       Redux store
 * @param  {String} tsDataKey   Timeseries key
 * @return {Function}           D3 scale function
 */
const xScaleSelector = memoize(tsDataKey => createSelector(
    layoutSelector,
    pointsSelector(tsDataKey),
    (layout, points) => {
        return createXScale(points, layout.width - MARGIN.right);
    }
));


/**
 * Selector for y-scale
 * @param  {Object} state   Redux store
 * @return {Function}       D3 scale function
 */
const yScaleSelector = createSelector(
    layoutSelector,
    (state) => state.tsData,
    (state) => state.showSeries,
    state => state.currentParameterCode,
    (layout, tsData, showSeries, parmCd) => createYScale(tsData, parmCd, showSeries, layout.height - (MARGIN.top + MARGIN.bottom))
);


module.exports = {createXScale, createYScale, xScaleSelector, yScaleSelector, singleSeriesYScale};
