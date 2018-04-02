const { extent } = require('d3-array');
const { scaleTime, scaleLinear } = require('d3-scale');
const memoize = require('fast-memoize');
const { createSelector } = require('reselect');

const { default: scaleSymlog } = require('../../lib/symlog');
const { layoutSelector } = require('./layout');
const { timeSeriesSelector, variablesSelector, currentVariableSelector, requestTimeRangeSelector } = require('./timeseries');
const { visiblePointsSelector, pointsByTsKeySelector } = require('./drawingData');

const paddingRatio = 0.2;

// array of parameters that should use
// a symlog scale instead of a linear scale
const SYMLOG_PARMS = [
    '00060',
    '72137'
];


/**
 *  Return domain padded on both ends by paddingRatio.
 *  For positive domains, a zero-lower bound on the y-axis is enforced.
 *  @param {Array} domain - array of two numbers
 *  @return {Array} - array of two numbers
 */
function extendDomain(domain, parmCd) {
    const isPositive = domain[0] >= 0 && domain[1] >= 0;
    let extendedDomain;

    // Pad domains on both ends by paddingRatio.
    const padding = paddingRatio * (domain[1] - domain[0]);
    extendedDomain = [
        domain[0] - padding,
        domain[1] + padding
    ];

    // Log scales lower-bounded by nearest power of 10 (10, 100, 1000, etc)
    if (SYMLOG_PARMS.indexOf(parmCd) > -1) {
        extendedDomain = [
            isPositive ? Math.pow(10, Math.floor(Math.log10(domain[0]))) : domain[0],
            extendedDomain[1]
        ];
    }

    // For positive domains, a zero-lower bound on the y-axis is enforced.
    return [
        isPositive ? Math.max(0, extendedDomain[0]) : extendedDomain[0],
        extendedDomain[1]
    ];
}


/**
 * Create an x-scale oriented on the left
 * @param {Array} timeRange - Object containing the start and end times.
 * @param {Number} xSize - range of scale
 * @return {Object} d3 scale for time.
 */
function createXScale(timeRange, xSize) {
    const xExtent = timeRange ? [timeRange.start, timeRange.end] : [0, 1];

    // xScale is oriented on the left
    return scaleTime()
        .range([0, xSize])
        .domain(xExtent);
}

/**
 * Create the scale based on the parameter code
 *
 * @param {String} parmCd
 * @param {Array} extent
 * @param {Number} size
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
 * @param {String} parmCd
 * @param {Array} tsData - array of data points with time and value keys
 * @param {Number} ySize - range of the scale
 * * @return {Object} d3 scale for value.
 */
function singleSeriesYScale(parmCd, tsData, ySize) {
    let points = tsData.filter(pt => pt.value !== null);
    let yExtent = extent(points, d => d.value);
    return yScaleByParameter(parmCd, yExtent, ySize);
}


/**
 * Create an yscale oriented on the bottom
 * @param {String} parmCd
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
        yExtent = extendDomain(yExtent, parmCd);
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
    requestTimeRangeSelector,
    (layout, requestTimeRanges) => {
        return createXScale(requestTimeRanges[tsKey], layout.width - layout.margin.right);
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
        return createYScale(currentVarParmCd, pointArrays, layout.height - (layout.margin.top + layout.margin.bottom));
    }
);


/**
 * For a given tsKey, return a selector that:
 * Returns lists of time series keyed on parameter code.
 * @param  {String} tsKey             Time series key
 * @return {Object} - keys are parmCd and values are array of array of points
 */
const parmCdPointsSelector = memoize(tsKey => createSelector(
    pointsByTsKeySelector(tsKey),
    timeSeriesSelector(tsKey),
    variablesSelector,
    (tsPoints, timeSeries, variables) => {
        return Object.keys(tsPoints).reduce((byParmCd, tsID) => {
            const points = tsPoints[tsID];
            const parmCd = variables[timeSeries[tsID].variable].variableCode.value;
            byParmCd[parmCd] = byParmCd[parmCd] || [];
            byParmCd[parmCd].push(points);
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
    parmCdPointsSelector(tsKey),
    requestTimeRangeSelector,
    (pointsByParmCd, requestTimeRanges) => {
        return Object.keys(pointsByParmCd).reduce((tsScales, parmCd) => {
            const tsPoints = pointsByParmCd[parmCd];
            tsScales[parmCd] = {
                x: createXScale(requestTimeRanges[tsKey], dimensions.width),
                y: createYScale(parmCd, tsPoints, dimensions.height)
            };
            return tsScales;
        }, {});
    }
)));


module.exports = {createXScale, createYScale, xScaleSelector, yScaleSelector, singleSeriesYScale, timeSeriesScalesByParmCdSelector, extendDomain};
