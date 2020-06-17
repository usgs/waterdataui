import memoize from 'fast-memoize';
import {scaleLinear} from 'd3-scale';
import {createSelector} from 'reselect';

import {
    getDVGraphBrushOffset,
    getCurrentDVTimeSeriesTimeRange,
    getCurrentDVTimeSeriesValueRange
} from '../../../selectors/daily-value-time-series-selector';

import {getLayout} from './layout';
import {getCurrentTimeSeriesData} from './time-series-data';

/*
 * Returns a selector function which returns a d3 scale for either the brush,
 * kind = 'BRUSH' or the main xscale for the dv graph.
 */
export const getXScale = memoize((kind) => createSelector(
    getLayout(kind),
    getCurrentDVTimeSeriesTimeRange,
    getDVGraphBrushOffset,
    (layout, timeRange, dvGraphBrushOffset) => {
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

const createYScale = function (layout, valueRange) {
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
};

/*
 * Returns a selector which returns the YScale to be used for the main hydrograph
 */
export const getMainYScale = createSelector(
    getLayout('MAIN'),
    getCurrentTimeSeriesData,
    getXScale('MAIN'),
    (layout, allTSData, xScale) => {
        const [startTime, endTime] = xScale.domain();
        let minValues = [];
        let maxValues = [];

        Object.values(allTSData).forEach((tsData) => {
            const tsValues = tsData
                .filter(point => point.dateTime >= startTime && point.dateTime <= endTime)
                .map(point => parseFloat(point.value));
            minValues.push(Math.min(...tsValues));
            maxValues.push(Math.max(...tsValues));
        });

        let valueRange;
        if (minValues.length && maxValues.length) {
            valueRange = {
                min: Math.min(...minValues),
                max: Math.max(...maxValues)
            };
        }

        return createYScale(layout, valueRange);
    }
);

/*
 * Returns a selector which returns the YScale to be used for the brush hydrograph
 */
export const getBrushYScale = createSelector(
    getLayout('BRUSH'),
    getCurrentDVTimeSeriesValueRange,
    (layout, valueRange) => {
        return createYScale(layout, valueRange);
    }
);

/*
 * Returns a selector which returns the YScale to be used for the  hydrograph of kind
 */
export const getYScale = memoize((kind) => {
    switch (kind) {
        case 'BRUSH':
            return getBrushYScale;
        default:
            return getMainYScale;
    }
});
