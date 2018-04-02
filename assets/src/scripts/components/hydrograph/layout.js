// Define constants for the timeseries graph's aspect ratio and margins as well as a
// selector function which will return the width/height to use.
const { createSelector } = require('reselect');

const { mediaQuery } = require('../../utils');

// The point at which mobile/desktop layout changes take effect.
// This is defined as $site-max-width in USWDS.
const USWDS_SITE_MAX_WIDTH = 1040;

const ASPECT_RATIO = 1 / 2;
const ASPECT_RATIO_PERCENT = `${100 * ASPECT_RATIO}%`;
const MARGIN = {
    top: 25,
    right: 0,
    bottom: 10,
    left: 65
};
const MARGIN_SMALL_DEVICE = {
    top: 25,
    right: 0,
    bottom: 10,
    left: 35
};
const CIRCLE_RADIUS = 4;
const CIRCLE_RADIUS_SINGLE_PT = 1;

const SPARK_LINE_DIM = {
    width: 50,
    height: 30
};


/*
 * @param {Object} state - Redux store
 * @return {Object} containing width and height properties.
 */
const layoutSelector = createSelector(
    (state) => state.width,
    (state) => state.windowWidth,
    (width, windowWidth) => {
        return {
            width: width,
            height: width * ASPECT_RATIO,
            windowWidth: windowWidth,
            margin: mediaQuery(USWDS_SITE_MAX_WIDTH) ? MARGIN : MARGIN_SMALL_DEVICE
        };
    }
);

module.exports = {ASPECT_RATIO, ASPECT_RATIO_PERCENT, CIRCLE_RADIUS, layoutSelector, SPARK_LINE_DIM,
    CIRCLE_RADIUS_SINGLE_PT};
