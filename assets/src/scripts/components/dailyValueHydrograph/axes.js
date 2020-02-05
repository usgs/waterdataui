
import {axisBottom, axisLeft} from 'd3-axis';
import {format} from 'd3-format';
import { DateTime } from 'luxon';
import {createSelector} from 'reselect';

import {getXScale, getYScale} from './scales';

export const getXAxis = createSelector(
    getXScale,
    (xScale) => {
        return axisBottom()
            .scale(xScale)
            .tickSizeOuter(0)
            .tickFormat(d => DateTime.fromMillis(d).toFormat('MMM yyyy'));
    }
);

export const getYAxis = createSelector(
    getYScale,
    (yScale) => {
        return axisLeft()
            .scale(yScale)
            .tickSizeOuter(0)
            .tickFormat(format('.1f'));
    }
);