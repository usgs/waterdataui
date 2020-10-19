import memoize from 'fast-memoize';
import {createSelector} from 'reselect';

import config from '../../../../config';
import {mediaQuery} from 'ui/utils';

export const ASPECT_RATIO = 1 / 2;
export const ASPECT_RATIO_PERCENT = `${100 * ASPECT_RATIO}%`;
const MARGIN = {
    top: 25,
    right: 25,
    bottom: 10,
    left: 65
};
const MARGIN_SMALL_DEVICE = {
    top: 25,
    right: 10,
    bottom: 10,
    left: 30
};
export const BRUSH_HEIGHT = 100;
export const BRUSH_MOBILE_HEIGHT = 50;

/*
 * Returns a selector function. This function returns an object containing the following properties:
 *  @prop {Number} - height - This is the height of the svg containing DV graph
 *  @prop {Number} - width - This is the width of the svg containing DV graph
 *  @prop {Object} - margin - Has top, bottom, left, right Number properties which define the margins
 *      with the enclosing svg for the hydrograph. Typically the area in the margins are used for axis
 *      labels and graph titles.
 * @param {String} kind - Type of Layout, either BRUSH or nothing
 * @return {Selector function}
 */
export const getLayout = memoize(kind => createSelector(
    (state) => state.ui.width,
    (state) => state.ui.windowWidth,
    (width, windowWidth) => {
        const isDesktop = mediaQuery(config.USWDS_SITE_MAX_WIDTH);
        const height = kind === 'BRUSH' ? isDesktop ? BRUSH_HEIGHT : BRUSH_MOBILE_HEIGHT : width * ASPECT_RATIO;
        const margin = isDesktop ? MARGIN : MARGIN_SMALL_DEVICE;
        return {
            width: width,
            height: height,
            windowWidth: windowWidth,
            margin: {
                top: kind === 'BRUSH' ? 13 : margin.top,
                right: margin.right,
                bottom: margin.bottom,
                left: margin.left
            }
        };
    }
));

export const getMainLayout = getLayout();
export const getBrushLayout = getLayout('BRUSH');