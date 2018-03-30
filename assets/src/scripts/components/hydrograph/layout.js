// Define constants for the timeseries graph's aspect ratio and margins as well as a
// selector function which will return the width/height to use.
const { createSelector } = require('reselect');

const ASPECT_RATIO = 1 / 2;
const ASPECT_RATIO_PERCENT = `${100 * ASPECT_RATIO}%`;
const MARGIN = {
    top: 40,
    right: 75,
    bottom: 40,
    left: 50
};
const CIRCLE_RADIUS = 4;
const CIRCLE_RADIUS_SINGLE_PT = 1;

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
    (width, windowWidth) => {
        return {
            width: width,
            height: width * ASPECT_RATIO,
            windowWidth: windowWidth
        };
    }
);

module.exports = {ASPECT_RATIO, ASPECT_RATIO_PERCENT, MARGIN, CIRCLE_RADIUS, layoutSelector, SPARK_LINE_DIM,
    CIRCLE_RADIUS_SINGLE_PT};
