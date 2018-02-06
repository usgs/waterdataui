const { extent } = require('d3-array');
const { scaleLinear, scaleTime } = require('d3-scale');
const { createSelector, defaultMemoize: memoize } = require('reselect');

const { layoutSelector, MARGIN } = require('./layout');

const paddingRatio = 0.2;


/**
 *  Return domainExtent padded on both ends by paddingRatio
 *  @param {Array} domainExtent - array of two numbers
 *  @return {Array} - array of two numbers
 */
function extendDomain(domainExtent) {
    const padding = paddingRatio * (domainExtent[1] - domainExtent[0]);
    return [domainExtent[0] - padding, domainExtent[1] + padding];
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
 * Create an yscale oriented on the bottom
 * @param {Array} tsData - Array contains {value, ...}
 * @param {Number} ySize - range of scale
 * @eturn {Object} d3 scale for value.
 */
function createYScale(tsData, showSeries, ySize) {
    let yExtent;

    // Calculate max and min for data
    for (let key of Object.keys(tsData)) {
        if (!showSeries[key] || tsData[key].length === 0) {
            continue;
        }

        const thisExtent = extent(tsData[key], d => d.value);
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

    // yScale is oriented on the bottom
    return scaleLinear()
        .range([ySize, 0])
        .domain(yExtent);
}

/**
 * Create scales for hydrograph charts. X is linear to time and Y is logarithmic.
 * @param  {Array} tsData    Array containing {time, value} items
 * @param  {Number} xSize X range of scale
 * @param  {Number} ySize Y range of scale
 * @return {Object}        {xScale, yScale}
 */
function createScales(tsData, showSeries, xSize, ySize) {
    const xScale = createXScale(tsData.current, xSize);
    const yScale = createYScale(tsData, showSeries, ySize);

    return {xScale, yScale};
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
    (state) => state.tsData,
    (layout, tsData) => {
        if (tsData[tsDataKey]) {
            return createXScale(tsData[tsDataKey], layout.width - MARGIN.right);
        } else {
            return null;
        }
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
    (layout, tsData, showSeries) => createYScale(tsData, showSeries, layout.height - (MARGIN.top + MARGIN.bottom))
);


module.exports = {createScales, xScaleSelector, yScaleSelector};
