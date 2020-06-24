import {axisBottom, axisLeft} from 'd3-axis';
import {format} from 'd3-format';
import memoize from 'fast-memoize';
import {DateTime} from 'luxon';
import {createSelector} from 'reselect';

import {getXScale, getYScale} from './scales';
import {getLayout} from './layout';


export const getXAxis = memoize(kind =>createSelector(
    getXScale(kind),
    (xScale) => {
        return axisBottom()
            .scale(xScale)
            .tickSizeOuter(0)
            .tickFormat(d => DateTime.fromMillis(d).toFormat('yyyy-LL-dd'));
    }
));

export const getYAxis = memoize(kind =>createSelector(
    getYScale(kind),
    getLayout(kind),
    (yScale, layout) => {
        return axisLeft()
            .scale(yScale)
            .tickSizeOuter(0)
            .tickSizeInner(-layout.width + layout.margin.right)
            .tickFormat(format('.1f'));
    }
));
