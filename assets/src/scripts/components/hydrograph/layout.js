// Define constants for the timeseries graph's aspect ratio and margins as well as a
// selector function which will return the width/height to use.
const { createSelector } = require('reselect');

const { mediaQuery } = require('../../utils');

const { tickSelector } = require('./domain');


// The point at which mobile/desktop layout changes take effect.
// This is defined as $site-max-width in USWDS.
const USWDS_SITE_MAX_WIDTH = 1040;

const ASPECT_RATIO = 1 / 2;
const ASPECT_RATIO_PERCENT = `${100 * ASPECT_RATIO}%`;
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
const CIRCLE_RADIUS = 4;
const CIRCLE_RADIUS_SINGLE_PT = 1;
const CIRCLE_RADIUS_SPARK_LINE = 0.5;

const SPARK_LINE_DIM = {
    width: 60,
    height: 30
};


/*
 * @param {Object} state - Redux store
 * @return {Object} containing width and height properties.
 */
const layoutSelector = createSelector(
    (state) => state.width,
    (state) => state.windowWidth,
    tickSelector,
    (width, windowWidth, tickDetails) => {
        const margin = mediaQuery(USWDS_SITE_MAX_WIDTH) ? MARGIN : MARGIN_SMALL_DEVICE;
        const tickLengths = tickDetails.tickValues.map(v => tickDetails.tickFormat(v).length);
        const approxLabelLength = Math.max(...tickLengths) * 10;
        return {
            width: width,
            height: width * ASPECT_RATIO,
            windowWidth: windowWidth,
            margin: {
                ...margin,
                left: margin.left + approxLabelLength
            }
        };
    }
);

module.exports = {ASPECT_RATIO, ASPECT_RATIO_PERCENT, CIRCLE_RADIUS, layoutSelector, SPARK_LINE_DIM,
    CIRCLE_RADIUS_SINGLE_PT, CIRCLE_RADIUS_SPARK_LINE};
