const { createSelector } = require('reselect');

const { xScaleSelector, yScaleSelector } = require('./scales');

/**
 * Returns the points for a given timeseries.
 * @param  {Object} state     Redux store
 * @param  {String} tsDataKey Timeseries key
 * @return {Array}            Array of points.
 */
const pointsSelector = function (state, tsDataKey) {
    if (state.tsData[tsDataKey]) {
        return state.tsData[tsDataKey].data;
    }
    return [];
};


/**
 * Returns the current show state of a timeseries.
 * @param  {Object}  state     Redux store
 * @param  {String}  tsDataKey Timeseries key
 * @return {Boolean}           Show state of the timeseries
 */
const isVisibleSelector = function (state, tsDataKey) {
    if (state.tsData[tsDataKey]) {
        return state.tsData[tsDataKey].show;
    }
    return false;
};


/**
 * Returns all points in a timeseries with valid data points.
 * @param  {Object} state     Redux store
 * @param  {String} tsDataKey Timeseries key
 * @return {Array}            Array of points.
 */
const validPointsSelector = createSelector(
    pointsSelector,
    xScaleSelector,
    yScaleSelector,
    (tsData, xScale, yScale) => {
        let a = tsData
            .filter(d => d.value !== undefined)
            .map(d => {
                return {
                    x: xScale(d.time),
                    y: yScale(d.value)
                };
            });
        return a;
    }
);


module.exports = { pointsSelector, validPointsSelector, isVisibleSelector };
