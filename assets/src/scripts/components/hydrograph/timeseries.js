const { timeFormat } = require('d3-time-format');
const { createSelector, defaultMemoize: memoize } = require('reselect');

// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');


/**
 * Returns the points for a given timeseries.
 * @param  {Object} state     Redux store
 * @param  {String} tsDataKey Timeseries key
 * @return {Array}            Array of points.
 */
const pointsSelector = memoize(tsDataKey => createSelector(
    state => state.tsData,
    state => state.currentParameterCode,
    (tsData, parmCd) => {
        if (tsData[tsDataKey] && tsData[tsDataKey][parmCd]) {
            return tsData[tsDataKey][parmCd].values;
        } else {
            return [];
        }
    }
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
 * Returns all points in a timeseries grouped into line segments.
 * @param  {Object} state     Redux store
 * @param  {String} tsDataKey Timeseries key
 * @return {Array}            Array of points.
 */
const lineSegmentsSelector = memoize(tsDataKey => createSelector(
    pointsSelector(tsDataKey),
    (points) => {
        // Accumulate data into line groups, splitting on the estimated and
        // approval status.
        let lines = [];
        let lastClasses = {};
        console.log(tsDataKey, points);
        for (let pt of points) {
            // Ignored masked data
            if (pt.value === null) {
                lastClasses = {};
                continue;
            }

            // Classes to put on the line with this point.
            const lineClasses = {
                approved: pt.approved,
                estimated: pt.estimated
            };

            // If this point doesn't have the same classes as the last point,
            // create a new line for it.
            if (lastClasses.approved !== lineClasses.approved ||
                    lastClasses.estimated !== lineClasses.estimated) {
                lines.push({
                    classes: lineClasses,
                    points: []
                });
            }

            // Add this point to the current line.
            lines[lines.length - 1].points.push(pt);

            // Cache the classes for the next loop iteration.
            lastClasses = lineClasses;
        }

        return lines;
    }
));


/**
 * Returns the first valid timeseries for the currently selected parameter
 * code, to be used for reference data like plot title, description, etc.
 * @type {Object}   Timeseries, or empty object.
 */
const referenceSeriesSelector = createSelector(
    state => state.tsData['current'][state.currentParameterCode],
    state => state.tsData['compare'][state.currentParameterCode],
    (current, compare) => current || compare || {}
);


const yLabelSelector = createSelector(
    referenceSeriesSelector,
    series => series.description || ''
);


const titleSelector = createSelector(
    referenceSeriesSelector,
    series => series.name || ''
);


const descriptionSelector = createSelector(
    referenceSeriesSelector,
    series => series.description + ' from ' +
        formatTime(series.startTime) + ' to ' +
        formatTime(series.endTime)
);


module.exports = { pointsSelector, lineSegmentsSelector, isVisibleSelector,
    yLabelSelector, titleSelector, descriptionSelector };
