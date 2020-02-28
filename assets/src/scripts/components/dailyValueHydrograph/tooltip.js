import {createStructuredSelector} from 'reselect';

import {drawFocusCircles, drawFocusOverlay} from '../../d3-rendering/graph-tooltip';
import {link} from '../../lib/d3-redux';
import {Actions} from '../../store';

import {getLayout} from './selectors/layout';
import {getXScale} from './selectors/scales';

import {getCursorPoint} from './selectors/time-series-data';

export const createTooltipFocus = function(elem, store) {
    elem
        .call(link(store, drawFocusCircles, getCursorPoint))
        .call(link(
            store,
            drawFocusOverlay,
            createStructuredSelector({
                xScale: getXScale,
                layout: getLayout
            }),
            store,
            Actions.setDailyValueCursorOffset)
    );
};