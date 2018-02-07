// Define width, height and margin for the SVG.
// Use a fixed size, and scale to device width using CSS.
const { createSelector } = require('reselect');

const ASPECT_RATIO = 1 / 2;
const ASPECT_RATIO_PERCENT = `${100 * ASPECT_RATIO}%`;
const MARGIN = {
    top: 20,
    right: 100,
    bottom: 45,
    left: 50
};

/*
 * @param {Object} state - Redux store
 * @return {Object} containing width and height properties.
 */
const layoutSelector = createSelector(
    (state) => state.width,
    (width) => {
        return {
            width: width,
            height: width * ASPECT_RATIO
        };
    }
);

module.exports = {ASPECT_RATIO_PERCENT, MARGIN, layoutSelector, ASPECT_RATIO}


