import memoize from 'fast-memoize';
import {scaleLinear} from 'd3-scale';
import {createSelector} from 'reselect';

import {
    getCurrentObservationsTimeSeriesTimeRange,
    getCurrentObservationsTimeSeriesValueRange
} from '../../../selectors/observations-selector';

import {getMainLayout} from './layout';

export const getXScale = memoize((kind) =>createSelector(
    getMainLayout(),
    getCurrentObservationsTimeSeriesTimeRange,
    state => state.timeSeriesState.hydrographBrushOffset,
    (layout, timeRange,hydrographBrushOffset) => {
        let xScale = scaleLinear();
        console.log('margin.right:'+layout.margin.right);
        if (timeRange) {
            xScale
                .range([0, layout.width - layout.margin.right])
                .domain([timeRange.startTime, timeRange.endTime]);
        }
        return xScale;
    }
));

export const getMainXScale = getXScale();
export const getBrushXScale = getXScale('BRUSH');

export const getYScale = memoize((kind) =>createSelector(
    getMainLayout(),
    getCurrentObservationsTimeSeriesValueRange,
    (layout, valueRange) => {
        const PADDING_RATIO = 0.2;
        let yScale = scaleLinear();
        if (valueRange) {
            const isPositive = valueRange.min > 0 && valueRange.max > 0;

            // if the min and max are the same just divide the min by 2 for the padding
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