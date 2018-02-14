const { createSelector, defaultMemoize: memoize } = require('reselect');
const { setEquality } = require('../../utils');


/**
 * Returns the points for a given timeseries.
 * @param  {Object} state     Redux store
 * @param  {String} tsDataKey Timeseries key
 * @return {Array}            Array of points.
 */
const pointsSelector = memoize(tsDataKey => createSelector(
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

        const masks = new Set([
            'ICE',
            'FLD',
            'BKW',
            'ZFL',
            'DRY',
            'SSN',
            'PR',
            'RAT',
            'EQP',
            'MNT',
            'DIS',
            '***',
            'TST',
            'PMP'
        ]);

        for (let pt of points) {
            // Classes to put on the line with this point.
            let lineClasses = {
                approved: pt.approved,
                estimated: pt.estimated,
                dataMask: null
            };
            if (pt.value === null) {
                let qualifiers = new Set(pt.qualifiers.map(q => q.toUpperCase()));
                // current business rules specify that a particular data point
                // will only have at most one masking qualifier
                let maskIntersection = new Set([...masks].filter(x => qualifiers.has(x)));
                lineClasses.dataMask = [...maskIntersection][0]
            }
            else if (pt.value !== null) {
                // Temporary check to help detect test sites.
                if (pt.qualifiers.length > 1) {
                    /*eslint no-console: "allow"*/
                    console.error('Point has multiple qualifiers', pt.qualifiers);
                }
            }
            // If this point doesn't have the same classes as the last point,
            // create a new line for it.
            if (lastClasses.approved !== lineClasses.approved ||
                    lastClasses.estimated !== lineClasses.estimated ||
                    lastClasses.dataMask !== lineClasses.dataMask) {
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


module.exports = { pointsSelector, lineSegmentsSelector, isVisibleSelector };
