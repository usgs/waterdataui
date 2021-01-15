import {axisBottom, axisLeft, axisRight} from 'd3-axis';
import memoize from 'fast-memoize';
import {createSelector} from 'reselect';

import {convertCelsiusToFahrenheit, convertFahrenheitToCelsius} from 'ui/utils';

import {generateTimeTicks} from 'd3render/tick-marks';

import {getCurrentParmCd} from 'ml/selectors/time-series-selector';

import {getYTickDetails} from './domain';
import {getLayout} from './layout';
import {getXScale, getBrushXScale, getYScale, getSecondaryYScale} from './scales';
import {getCurrentVariableUnitCode, getSecondaryYLabel, getTsTimeZone} from './time-series-data';


const createXAxis = function(xScale, ianaTimeZone) {
    const [startMillis, endMillis] = xScale.domain();
    const ticks = generateTimeTicks(startMillis, endMillis, ianaTimeZone);

    return axisBottom()
        .scale(xScale)
        .tickValues(ticks.dates)
        .tickSizeOuter(0)
        .tickFormat(ticks.format);
};

/**
 * Create an x and y axis for hydrograph
 * @param {Object} xScale      D3 Scale object for the x-axis
 * @param {Object} yScale      D3 Scale object for the y-axis
 * @param {Object} secondaryYScale - D3 Scale object for the secondary y-axis
 * @param {Object} yTickDetails - Object which has information about tick values and ormat.
 * @param {Number} yTickSize   Size of inner ticks for the y-axis
 * @param {String} parmCd - parameter code of time series to be shown on the graph.
 * @param {String} ianaTimeZone - Internet Assigned Numbers Authority designation for a time zone
 * @return {Object} {xAxis, yAxis, secondardYaxis} - D3 Axis
 */
const createAxes = function(xScale, yScale, secondaryYScale, yTickDetails, yTickSize, parmCd, ianaTimeZone) {
    // Create x-axis
    const xAxis = createXAxis(xScale, ianaTimeZone);

    // Create y-axis
    const yAxis = axisLeft()
        .scale(yScale)
        .tickValues(yTickDetails.tickValues)
        .tickFormat(yTickDetails.tickFormat)
        .tickSizeInner(yTickSize)
        .tickPadding(3)
        .tickSizeOuter(0);

    let secondaryYAxis = null;

    const createSecondaryYAxis = function(tickValues, scale) {
        return axisRight()
            .scale(scale)
            .tickValues(tickValues)
            .tickFormat(t => t.toFixed(1))
            .tickSizeInner(yTickSize)
            .tickPadding(3)
            .tickSizeOuter(0);
    };

    if (secondaryYScale !== null) {
        let secondaryAxisTicks;
        const primaryAxisTicks = yTickDetails.tickValues;

        secondaryYAxis = createSecondaryYAxis(secondaryAxisTicks, secondaryYScale);
    }
    return {xAxis, yAxis, secondaryYAxis};
};

/**
 * Returns a Redux selector function that returns the brush x axis
 */
export const getBrushXAxis = createSelector(
    getBrushXScale('current'),
    getTsTimeZone,
    (xScale, ianaTimeZone) => createXAxis(xScale, ianaTimeZone)
);

/**
 * Returns a Redux Selection that returns an object with xAxis, yAxis, and secondaryYAxis properties
 */
export const getAxes = memoize(kind => createSelector(
    getXScale(kind, 'current'),
    getYScale(kind),
    getSecondaryYScale(kind),
    getYTickDetails,
    getLayout(kind),
    getCurrentVariableUnitCode,
    getTsTimeZone,
    getCurrentParmCd,
    getSecondaryYLabel,
    (xScale, yScale, secondaryYScale, yTickDetails, layout, plotYLabel, ianaTimeZone, parmCd, plotSecondaryYLabel) => {
        return {
            ...createAxes(
                xScale,
                yScale,
                secondaryYScale,
                yTickDetails,
                -layout.width + layout.margin.right,
                parmCd,
                ianaTimeZone
            ),
            layout: layout,
            yTitle: plotYLabel,
            secondaryYTitle: plotSecondaryYLabel
        };
    }
));