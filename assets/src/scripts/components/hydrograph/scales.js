const { extent } = require('d3-array');
const { scaleTime } = require('d3-scale');
const memoize = require('fast-memoize');
const { createSelector } = require('reselect');

const { default: scaleSymlog } = require('../../lib/symlog');
const { layoutSelector, MARGIN } = require('./layout');
const { flatPointsSelector, visiblePointsSelector } = require('./timeseries');

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
    const xExtent = values.length ? extent(values, d => d.dateTime) : [0, 1];

    // xScale is oriented on the left
    return scaleTime()
        .range([0, xSize])
        .domain(xExtent);
}

/**
 * Create an yscale oriented on the bottom
 * @param {Object} pointArrays - Time series points: [[point, point], ...]
 * @param {Number} ySize - range of scale
 * @eturn {Object} d3 scale for value.
 */
function createYScale(pointArrays, ySize) {
    let yExtent;

    // Calculate max and min for data
    for (const points of pointArrays) {
        if (points.length === 0) {
            continue;
        }

        const thisExtent = extent(points, d => d.value);
        if (yExtent !== undefined) {
            yExtent = [
                Math.min(thisExtent[0], yExtent[0]),
                Math.max(thisExtent[1], yExtent[1])
            ];
        } else {
            yExtent = thisExtent;
        }
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
 * Factory function creates a function that, for a given time series key:
 * Selector for x-scale
 * @param  {Object} state       Redux store
 * @return {Function}           D3 scale function
 */
const xScaleSelector = memoize(tsKey => createSelector(
    layoutSelector,
    flatPointsSelector(tsKey),
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
    visiblePointsSelector,
    (layout, pointArrays) => createYScale(pointArrays, layout.height - (MARGIN.top + MARGIN.bottom))
);


module.exports = {createXScale, createYScale, xScaleSelector, yScaleSelector};
