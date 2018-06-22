import { scaleLinear } from 'd3-scale';
import memoize from 'fast-memoize';
import { createSelector } from 'reselect';
import { default as scaleSymlog } from '../../lib/symlog';
import { getYDomain, SYMLOG_PARMS } from './domain';
import { layoutSelector } from './layout';
import { timeSeriesSelector } from './timeSeries';
import { visiblePointsSelector, pointsByTsKeySelector } from './drawingData';
import { getVariables, getCurrentParmCd, getRequestTimeRange } from '../../selectors/timeSeriesSelector';


/**
 * Create an x-scale oriented on the left
 * @param {Array} timeRange - Object containing the start and end times.
 * @param {Number} xSize - range of scale
 * @return {Object} d3 scale for time.
 */
export function createXScale(timeRange, xSize) {
    // xScale is oriented on the left
    let scale = scaleLinear()
        .range([0, xSize]);
    if (timeRange) {
        scale.domain([timeRange.start, timeRange.end]);
    }
    return scale;
}

/**
 * Create the scale based on the parameter code
 *
 * @param {String} parmCd
 * @param {Array} extent
 * @param {Number} size
 */
export function createYScale(parmCd, extent, size) {
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
 * Factory function creates a function that, for a given time series key:
 * Selector for x-scale
 * @param  {Object} state       Redux store
 * @return {Function}           D3 scale function
 */
export const xScaleSelector = memoize(tsKey => createSelector(
    layoutSelector,
    getRequestTimeRange(tsKey),
    (layout, requestTimeRange) => {
        return createXScale(requestTimeRange, layout.width - layout.margin.right);
    }
));


/**
 * Selector for y-scale
 * @param  {Object} state   Redux store
 * @return {Function}       D3 scale function
 */
export const yScaleSelector = createSelector(
    layoutSelector,
    visiblePointsSelector,
    getCurrentParmCd,
    (layout, pointArrays, currentVarParmCd) => {
        const yDomain = getYDomain(pointArrays, currentVarParmCd);
        return createYScale(currentVarParmCd, yDomain, layout.height - (layout.margin.top + layout.margin.bottom));
    }
);


/**
 * For a given tsKey, return a selector that:
 * Returns lists of time series keyed on parameter code.
 * @param  {String} tsKey             Time series key
 * @return {Object} - keys are parmCd and values are array of array of points
 */
const parmCdPointsSelector = memoize((tsKey, period) => createSelector(
    pointsByTsKeySelector(tsKey, period),
    timeSeriesSelector(tsKey, period),
    getVariables,
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
export const timeSeriesScalesByParmCdSelector = memoize((tsKey, period, dimensions) => createSelector(
    parmCdPointsSelector(tsKey, period),
    getRequestTimeRange(tsKey, period),
    (pointsByParmCd, requestTimeRange) => {
        return Object.keys(pointsByParmCd).reduce((tsScales, parmCd) => {
            const tsPoints = pointsByParmCd[parmCd];
            const yDomain = getYDomain(tsPoints, SYMLOG_PARMS.indexOf(parmCd) >= 0);
            tsScales[parmCd] = {
                x: createXScale(requestTimeRange, dimensions.width),
                y: createYScale(parmCd, yDomain, dimensions.height)
            };
            return tsScales;
        }, {});
    }
));
