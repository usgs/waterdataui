const { extent } = require('d3-array');
const { scaleTime, scaleLinear } = require('d3-scale');
const memoize = require('fast-memoize');
const { createSelector } = require('reselect');

const { default: scaleSymlog } = require('../../lib/symlog');
const { layoutSelector, MARGIN } = require('./layout');
const { flatPointsSelector, timeSeriesSelector, variablesSelector, visiblePointsSelector, currentVariableSelector } = require('./timeseries');

const paddingRatio = 0.2;

// array of parameters that should use
// a symlog scale instead of a linear scale
const SYMLOG_PARMS = ['00060'];


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
 * Create the scale based on the parameter code
 *
 * @param parmCd
 * @param extent
 * @param size
 */
function yScaleByParameter(parmCd, extent, size) {
    if (SYMLOG_PARMS.indexOf(parmCd) >= 0) {
        return scaleSymlog()
            .domain(extent)
            .range([size, 0]);
    } else {
        return scaleLinear()
            .domain(extent)
            .range([size, 0]);
    }
}


/**
 * Create a yScale for the plots where you only have a single array of data
 *
 * @param tsData - array of data points with time and value keys
 * @param ySize - range of the scale
 * * @return {Object} d3 scale for value.
 */
function singleSeriesYScale(parmCd, tsData, ySize) {
    let points = tsData.filter(pt => pt.value !== null);
    let yExtent = extent(points, d => d.value);
    return yScaleByParameter(parmCd, yExtent, ySize);
}


/**
 * Create an yscale oriented on the bottom
 * @param {Object} pointArrays - Time series points: [[point, point], ...]
 * @param {Number} ySize - range of scale
 * @return {Object} d3 scale for value.
 */
function createYScale(parmCd, pointArrays, ySize) {
    let yExtent;
    let scaleDomains = [];

    // Calculate max and min for data
    for (const points of pointArrays) {
        if (points.length === 0) {
            continue;
        }
        scaleDomains.push(singleSeriesYScale(parmCd, points, ySize).domain());
    }
    if (scaleDomains.length > 0) {
        const flatDomains = [].concat(...scaleDomains).filter(val => isFinite(val));
        if (flatDomains.length > 0) {
            yExtent = [Math.min(...flatDomains), Math.max(...flatDomains)];
        }
    }
    // Add padding to the extent and handle empty data sets.
    if (yExtent) {
        yExtent = extendDomain(yExtent);
    } else {
        yExtent = [0, 1];
    }
    return yScaleByParameter(parmCd, yExtent, ySize);
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
    currentVariableSelector,
    (layout, pointArrays, currentVar) => {
        let currentVarParmCd = currentVar && currentVar.variableCode ? currentVar.variableCode.value : null;
        return createYScale(currentVarParmCd, pointArrays, layout.height - (MARGIN.top + MARGIN.bottom));
    }
);


/**
 * For a given tsKey, return a selector that:
 * Returns lists of time series keyed on parameter code.
 * @param  {String} tsKey             Time series key
 * @return {Object}
 */
const parmCdTimeSeriesSelector = memoize(tsKey => createSelector(
    timeSeriesSelector(tsKey),
    variablesSelector,
    (timeSeries, variables) => {
        return Object.keys(timeSeries).reduce((byParmCd, sID) => {
            const series = timeSeries[sID];
            const parmCd = variables[series.variable].variableCode.value;
            byParmCd[parmCd] = byParmCd[parmCd] || [];
            byParmCd[parmCd].push(series);
            return byParmCd;
        }, {});
    }
));


/**
 * Given a dimension with width/height attributes:
 * Returns x and y scales for all "current" time series.
 * @type {Object}   Mapping of parameter code to time series list.
 */
const timeSeriesScalesByParmCdSelector = memoize(tsKey => memoize(dimensions => createSelector(
    parmCdTimeSeriesSelector(tsKey),
    (timeSeriesByParmCd) => {
        return Object.keys(timeSeriesByParmCd).reduce((tsScales, parmCd) => {
            const seriesList = timeSeriesByParmCd[parmCd];
            const allPoints = seriesList.reduce((points, series) => {
                Array.prototype.push.apply(points, series.points);
                return points;
            }, []);
            tsScales[parmCd] = {
                x: createXScale(allPoints, dimensions.width),
                y: createYScale(parmCd, seriesList.map(s => s.points), dimensions.height)
            };
            return tsScales;
        }, {});
    }
)));


module.exports = {createXScale, createYScale, xScaleSelector, yScaleSelector, singleSeriesYScale, timeSeriesScalesByParmCdSelector};
