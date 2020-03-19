import memoize from 'fast-memoize';
import {axisBottom, axisLeft} from 'd3-axis';
import {format} from 'd3-format';
import {DateTime} from 'luxon';
import {createSelector} from 'reselect';

import {getMainXScale, getMainYScale} from './scales';
import {getMainLayout} from './layout';


export const getXAxis = memoize(kind =>createSelector(
    getMainXScale(),
    (xScale) => {
        return axisBottom()
            .scale(xScale)
            .tickSizeOuter(0)
            .tickFormat(d => DateTime.fromMillis(d).toFormat('yyyy-LL-dd'));
    }
));


export const getYAxis = memoize(kind =>createSelector(
    getMainYScale(),
    getMainLayout,
    (yScale, layout) => {
        return axisLeft()
            .scale(yScale)
            .tickSizeOuter(0)
            .tickSizeInner(-layout.width + layout.margin.right)
            .tickFormat(format('.1f'));
    }
));
