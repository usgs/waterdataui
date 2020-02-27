import {createStructuredSelector} from 'reselect';

import {drawFocusOverlay} from '../../d3-rendering/graph-tooltip';
import {link} from '../../lib/d3-redux';
import {Actions} from '../../store';

import {getXScale} from './selectors/scales';
import {getLayout} from './selectors/layout';

export const createTooltipFocus = function(elem, store) {
    elem.call(link(
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