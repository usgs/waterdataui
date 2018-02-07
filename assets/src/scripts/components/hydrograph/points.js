const { createSelector, defaultMemoize: memoize } = require('reselect');


/**
 * Returns the points for a given timeseries.
 * @param  {Object} state     Redux store
 * @param  {String} tsDataKey Timeseries key
 * @return {Array}            Array of points.
 */
const pointsSelector = memoize((tsDataKey) => createSelector(
    state => state.tsData,
    tsData => tsData[tsDataKey]
));

/**
 * Factory function creates a function that:
 * Returns the current show state of a timeseries.
 * @param  {Object}  state     Redux store
 * @param  {String}  tsDataKey Timeseries key
 * @return {Boolean}           Show state of the timeseries
 */
const isVisibleSelector = memoize(tsDataKey => (state) => {
    return state.showSeries[tsDataKey];
});


/**
 * Factory function creates a function that:
 * Returns all points in a timeseries with valid data points.
 * @param  {Object} state     Redux store
 * @param  {String} tsDataKey Timeseries key
 * @return {Array}            Array of points.
 */
const validPointsSelector = memoize(tsDataKey => createSelector(
    pointsSelector(tsDataKey),
    (points) => points.filter(pt => pt.value !== undefined)
));


module.exports = { pointsSelector, validPointsSelector, isVisibleSelector };
