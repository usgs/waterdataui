import {scaleLinear} from 'd3-scale';
import {createSelector} from 'reselect';

import {
    getCurrentObservationsTimeSeriesTimeRange,
    getCurrentObservationsTimeSeriesValueRange
} from '../../selectors/observations-selector';

import {getLayout} from './layout';

export const getXScale = createSelector(
    getLayout,
    getCurrentObservationsTimeSeriesTimeRange,
    (layout, timeRange) => {
        let xScale = scaleLinear();
        if (timeRange) {
            xScale
                .range([0, layout.width - layout.margin.right - layout.margin.left])
                .domain([timeRange.startTime, timeRange.endTime]);
        }
        return xScale;
    }
);

export const getYScale = createSelector(
    getLayout,
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
            // Positve ranges should not be extended below zero.
            extendedRange.min = isPositive ? Math.max(0, extendedRange.min) : extendedRange.min;

            yScale
                .range([layout.height - layout.margin.top - layout.margin.bottom, 0])
                .domain([extendedRange.min, extendedRange.max]);
        }
        return yScale;
    }
);