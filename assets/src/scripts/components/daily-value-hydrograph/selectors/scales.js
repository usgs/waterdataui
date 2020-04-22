import memoize from 'fast-memoize';
import {scaleLinear} from 'd3-scale';
import {createSelector} from 'reselect';

import {
    getDVGraphBrushOffset,
    getCurrentDVTimeSeriesTimeRange,
    getCurrentDVTimeSeriesValueRange
} from '../../../selectors/daily-value-time-series-selector';

import {getLayout} from './layout';

/*
 * Returns a selector function which returns a d3 scale for either the brush,
 * kind = 'BRUSH' or the main xscale for the dv graph.
 */
export const getXScale = memoize((kind) =>createSelector(
    getLayout(kind),
    getCurrentDVTimeSeriesTimeRange,
    getDVGraphBrushOffset,
    (layout, timeRange,dvGraphBrushOffset) => {
        let xScale = scaleLinear()
            .range([0, layout.width - layout.margin.right]);

        if (kind !== 'BRUSH' && timeRange && dvGraphBrushOffset) {
            xScale.domain([timeRange.startTime + dvGraphBrushOffset.start, timeRange.endTime - dvGraphBrushOffset.end]);
        } else if (timeRange) {
            xScale.domain([timeRange.startTime, timeRange.endTime]);
        }
        return xScale;
    }
));

export const getMainXScale = getXScale();
export const getBrushXScale = getXScale('BRUSH');

/*
 * Returns a selector function which will return the yScale for the given kind ('BRUSH' or other).
 */
export const getYScale = memoize((kind) =>createSelector(
    getLayout(kind),
    getCurrentDVTimeSeriesValueRange,
    (layout, valueRange) => {
        const PADDING_RATIO = 0.2;
        let yScale = scaleLinear();
        if (valueRange) {
            const isPositive = valueRange.min > 0 && valueRange.max > 0;

            // If the min and max are the same just divide the min by 2 for the padding
            const padding = valueRange.min === valueRange.max ? valueRange.min / 2 : PADDING_RATIO * (valueRange.max - valueRange.min);
            let extendedRange = {
                min: valueRange.min - padding,
                max: valueRange.max + padding
            };
            // Positive ranges should not be extended below zero.
            extendedRange.min = isPositive ? Math.max(0, extendedRange.min) : extendedRange.min;

            // Defaulting to descending scale (min at top)
            yScale
                .range([layout.height - layout.margin.top - layout.margin.bottom, 0])
                .domain([extendedRange.max, extendedRange.min]);
        }
        return yScale;
    }
));

export const getMainYScale = getYScale();
export const getBrushYScale = getYScale('BRUSH');