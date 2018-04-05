const { extent, ticks } = require('d3-array');
const { format } = require('d3-format');
const { createSelector } = require('reselect');

const { mediaQuery } = require('../../utils');
const config = require('../../config');

const { currentVariableSelector } = require('./timeseries');
const { visiblePointsSelector } = require('./drawingData');


const PADDING_RATIO = 0.2;
const Y_TICK_COUNT = 5;
const Y_TICK_COUNT_SMALL_LOG = 2;
// array of parameters that should use
// a symlog scale instead of a linear scale
export const SYMLOG_PARMS = [
    '00060',
    '72137'
];

/**
 *  Return domain padded on both ends by paddingRatio.
 *  For positive domains, a zero-lower bound on the y-axis is enforced.
 *  @param {Array} domain - array of two numbers
 *  @return {Array} - array of two numbers
 */
export const extendDomain = function (domain, lowerBoundPOW10) {
    const isPositive = domain[0] >= 0 && domain[1] >= 0;
    let extendedDomain;

    // Pad domains on both ends by PADDING_RATIO.
    const padding = PADDING_RATIO * (domain[1] - domain[0]);
    extendedDomain = [
        domain[0] - padding,
        domain[1] + padding
    ];

    // Log scales lower-bounded by nearest power of 10 (10, 100, 1000, etc)
    if (lowerBoundPOW10) {
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
};


export const getYDomain = function (pointArrays, currentVar) {
    let yExtent;
    let scaleDomains = [];

    let currentVarParmCd = currentVar && currentVar.variableCode ? currentVar.variableCode.value : null;

    // Calculate max and min for data
    for (const points of pointArrays) {
        if (points.length === 0) {
            continue;
        }
        const finitePts = points.map(pt => pt.value).filter(val => isFinite(val));
        let ptExtent = extent(finitePts);
        if (ptExtent[0] === ptExtent[1]) {
            // when both the lower and upper values of
            // extent are the same, the domain of the
            // extent is from -Infinity to +Infinity;
            // this isn't useful for creation of data
            // points, so add this broadens the extent
            // a bit for single point series
            ptExtent = [ptExtent[0] - ptExtent[0]/2, ptExtent[0] + ptExtent[0]/2];
        }
        scaleDomains.push(ptExtent);
    }
    if (scaleDomains.length > 0) {
        const flatDomains = [].concat(...scaleDomains).filter(val => isFinite(val));
        if (flatDomains.length > 0) {
            yExtent = [Math.min(...flatDomains), Math.max(...flatDomains)];
        }
    }
    // Add padding to the extent and handle empty data sets.
    if (yExtent) {
        yExtent = extendDomain(yExtent, SYMLOG_PARMS.indexOf(currentVarParmCd) > -1);
    } else {
        yExtent = [0, 1];
    }

    return yExtent;
};


export const yDomainSelector = createSelector(
    visiblePointsSelector,
    currentVariableSelector,
    getYDomain
);


/**
 * Helper function which generates y tick values for a scale
 * @param {Object} yScale - d3 scale
 * @returns {Array} of tick values
 */
export const getYTickDetails = function (yDomain, parmCd) {
    const isSymlog = SYMLOG_PARMS.indexOf(parmCd) > -1;
    let tickCount = Y_TICK_COUNT;
    if (isSymlog) {
        tickCount = Y_TICK_COUNT_SMALL_LOG;
        if (mediaQuery(config.USWDS_SMALL_SCREEN)) {
            tickCount++;
        }
        if (mediaQuery(config.USWDS_MEDIUM_SCREEN)) {
            tickCount++;
        }
        if (mediaQuery(config.USWDS_LARGE_SCREEN)) {
            tickCount++;
        }
    }

    const tickValues = ticks(yDomain[0], yDomain[1], tickCount);
    // If all ticks are integers, don't display right of the decimal place.
    // Otherwise, format with two decimal points.
    const tickFormat = tickValues.filter(t => !Number.isInteger(t)).length ? '.2f' : 'd';
    return {
        tickValues,
        tickFormat: format(tickFormat)
    };
};


export const tickSelector = createSelector(
    visiblePointsSelector,
    currentVariableSelector,
    (pointArrays, currentVariable) => {
        const yDomain = getYDomain(pointArrays, currentVariable);
        const parmCd = currentVariable ? currentVariable.variableCode.value : null;
        return getYTickDetails(yDomain, parmCd);
    }
);
