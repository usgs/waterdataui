import { extent, ticks } from 'd3-array';
import { format } from 'd3-format';
import { createSelector } from 'reselect';
import { mediaQuery } from '../../utils';
import config from '../../config';
import { visiblePointsSelector } from './drawingData';
import { getCurrentParmCd } from '../../selectors/timeSeriesSelector';



const PADDING_RATIO = 0.2;
const Y_TICK_COUNT = 5;
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
 *  @param {Boolean} lowerBoundPOW10 - using log scale
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


export const getYDomain = function (pointArrays, currentVarParmCd) {
    let yExtent;
    let scaleDomains = [];

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


/**
 * Helper function which generates y tick values for a scale
 * @param {Array} yDomain - Two element array representing the domain on the yscale.
 * @param {Array} parmCd - parameter code for time series that is being generated.
 * @returns {Array} of tick values
 */
export const getYTickDetails = function (yDomain, parmCd) {
    const isSymlog = SYMLOG_PARMS.indexOf(parmCd) > -1;

    let tickValues = ticks(yDomain[0], yDomain[1], Y_TICK_COUNT);

    // add additional ticks and labels to log scales as needed
    if (isSymlog) {
      tickValues = addAdditionalTicksForLogScales(tickValues);
    }

    // On small screens, log scale ticks are too close together, so only use every other one.
    if (isSymlog && tickValues.length > 3 && !mediaQuery(config.USWDS_MEDIUM_SCREEN)) {
        tickValues = tickValues.filter((_, index) => index % 2);
    }

    // If all ticks are integers, don't display right of the decimal place.
    // Otherwise, format with two decimal points.
    const tickFormat = tickValues.filter(t => !Number.isInteger(t)).length ? '.2f' : 'd';
    return {
        tickValues,
        tickFormat: format(tickFormat)
    };
};

/**
 * Function adds additional tick marks with labels to fill gaps in tick labels in log scales caused by data
 * sets with variance
 * @param tickValues
 * @returns {array} 
 */
export const addAdditionalTicksForLogScales = function(tickValues) {
    let lowestAbsoluteValueOfTicks;
    
    // check if tickValues has any negative numbers
    let doesTickValuesHaveNegatives = tickValues.some(value => value < 0);

    // if tickValues have negative numbers, pull them out and test them to find the (largest negative) smallest absolute value
    if (doesTickValuesHaveNegatives) {
        lowestAbsoluteValueOfTicks = getLowestAbsoluteValueOfNegativeTickValues(tickValues);
    }

    // create the new set of tick values that will fill in gaps in log scale ticks, then combine this new set with the
    // original set of tick marks.
    tickValues = getFullArrayOfTickMarks(tickValues, lowestAbsoluteValueOfTicks, doesTickValuesHaveNegatives);

    return tickValues;
};

/**
 * Function finds highest negative value in array of tick values, then returns that number's absolute value
 * @param {array} tickValues
 * @returns {number} the lowest absolute value (of negative numbers) of the tick values
 */
export const getLowestAbsoluteValueOfNegativeTickValues= function(tickValues) {
    let negativeTickValues = tickValues.filter(value => value < 0);
    let highestNegativeValueOfTicks = Math.max(...negativeTickValues);
    let lowestAbsoluteValueOfNegativeTicks = Math.abs(highestNegativeValueOfTicks);

    return lowestAbsoluteValueOfNegativeTicks;
};

/**
 * Function creates a new set of tick values that will fill in gaps in log scale ticks, then combines this new set with the
 * original set of tick marks.
 * @param {array} tickValues
 * @returns {array} fullArrayOfTickMarks, the new full array of tick marks for log scales
 */
export const getFullArrayOfTickMarks = function(tickValues, lowestAbsoluteValueOfTicks, doesTickValuesHaveNegatives) {
    let testValueArray = [];
    let testValueArrayWithNegativeValues = [];

    let testValue = tickValues[0];
    let fullArrayOfTickMarks;

    // check if lowest tick value is integer
    if (lowestAbsoluteValueOfTicks.isInteger) {
        while (Math.abs(testValue) > 2) {
            testValue = testValue / 2;
            testValueArray.push(testValue);
        }
    } else {
        while (Math.abs(testValue) > 2) {
            testValue = Math.ceil(testValue / 2);
            testValueArray.push(testValue);
        }
    }
    // check if the log scale has negative values, if so add additional negative ticks with negative lables
    if (doesTickValuesHaveNegatives) {
        testValueArrayWithNegativeValues = testValueArray.map(x => x * -1);
        testValueArray = testValueArrayWithNegativeValues.concat(testValueArray);
    }

    fullArrayOfTickMarks = testValueArray.concat(tickValues);

   return fullArrayOfTickMarks;
};



const yDomainSelector = createSelector(
    visiblePointsSelector,
    getCurrentParmCd,
    getYDomain
);


export const tickSelector = createSelector(
    yDomainSelector,
    getCurrentParmCd,
    getYTickDetails
);