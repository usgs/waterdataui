import {axisBottom, axisLeft} from 'd3-axis';
import memoize from 'fast-memoize';
import {createSelector} from 'reselect';

import config from 'ui/config';

import {generateTimeTicks} from 'd3render/tick-marks';

import {getPrimaryParameter} from 'ml/selectors/hydrograph-data-selector';

import {getYTickDetails} from './domain';
import {getLayout} from './layout';
import {getXScale, getBrushXScale, getYScale} from './scales';


const createXAxis = function(xScale) {
    const [startMillis, endMillis] = xScale.domain();
    const ticks = generateTimeTicks(startMillis, endMillis, config.locationTimeZone);

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
 * @param {Object} yTickDetails - Object which has information about tick values and format.
 * @param {Number} yTickSize   Size of inner ticks for the y-axis
 * @return {Object} {xAxis, yAxis} - D3 Axis
 */
const createAxes = function(xScale, yScale, yTickDetails, yTickSize) {
    // Create x-axis
    const xAxis = createXAxis(xScale);

    // Create y-axis
    const yAxis = axisLeft()
        .scale(yScale)
        .tickValues(yTickDetails.tickValues)
        .tickFormat(yTickDetails.tickFormat)
        .tickSizeInner(yTickSize)
        .tickPadding(3)
        .tickSizeOuter(0);

    return {xAxis, yAxis};
};

/**
 * Returns a Redux selector function that returns the brush x axis
 */
export const getBrushXAxis = createSelector(
    getBrushXScale,
    xScale => createXAxis(xScale)
);

/**
 * Returns a Redux Selection that returns an object with xAxis, yAxis, and secondaryYAxis properties
 */
export const getAxes = memoize(graphKind => createSelector(
    getXScale(graphKind, 'current'),
    getYScale(graphKind),
    getYTickDetails,
    getLayout(graphKind),
    getPrimaryParameter,
    (xScale, yScale, yTickDetails, layout, parameter) => {
        return {
            ...createAxes(
                xScale,
                yScale,
                yTickDetails,
                -layout.width + layout.margin.right
            ),
            layout: layout,
            yTitle: parameter.unit
        };
    }
));
