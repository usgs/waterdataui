// Define constants for the time series graph's aspect ratio and margins as well as a
// selector function which will return the width/height to use.
import { createSelector } from 'reselect';

import config from '../../config';
import { mediaQuery } from '../../utils';
import { tickSelector } from './domain';



export const ASPECT_RATIO = 1 / 2;
export const ASPECT_RATIO_PERCENT = `${100 * ASPECT_RATIO}%`;
const MARGIN = {
    top: 25,
    right: 0,
    bottom: 10,
    left: 45
};
const MARGIN_SMALL_DEVICE = {
    top: 25,
    right: 0,
    bottom: 10,
    left: 0
};
export const CIRCLE_RADIUS = 4;
export const CIRCLE_RADIUS_SINGLE_PT = 1;

export const SPARK_LINE_DIM = {
    width: 60,
    height: 30
};


/*
 * @param {Object} state - Redux store
 * @return {Object} containing width and height properties.
 */
export const layoutSelector = createSelector(
    (state) => state.ui.width,
    (state) => state.ui.windowWidth,
    tickSelector,
    (width, windowWidth, tickDetails) => {
        const margin = mediaQuery(config.USWDS_SITE_MAX_WIDTH) ? MARGIN : MARGIN_SMALL_DEVICE;
        const tickLengths = tickDetails.tickValues.map(v => tickDetails.tickFormat(v).length);
        const approxLabelLength = Math.max(...tickLengths) * 10;
        return {
            width: width,
            height: width * ASPECT_RATIO,
            windowWidth: windowWidth,
            margin: {
                ...margin,
                left: margin.left + approxLabelLength,
                right: margin.right + approxLabelLength
            }
        };
    }
);
