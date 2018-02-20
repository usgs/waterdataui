const { timeFormat } = require('d3-time-format');
const memoize = require('fast-memoize');
const { createSelector } = require('reselect');


// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');

const MASK_DESC = {
    ice: 'Ice',
    fld: 'Flood',
    bkw: 'Backwater',
    zfl: 'Zeroflow',
    dry: 'Dry',
    ssn: 'Seasonal',
    pr: 'Partial Record',
    rat: 'Rating Development',
    eqp: 'Equipment Malfunction',
    mnt: 'Maintenance',
    dis: 'Discontinued',
    tst: 'Test',
    pmp: 'Pump',
    '***': 'Unavailable'
};

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
        const masks = new Set(Object.keys(MASK_DESC));

        for (let pt of points) {
            // Classes to put on the line with this point.
            let lineClasses = {
                approved: pt.approved,
                estimated: pt.estimated,
                dataMask: null
            };
            if (pt.value === null) {
                let qualifiers = new Set(pt.qualifiers.map(q => q.toLowerCase()));
                // current business rules specify that a particular data point
                // will only have at most one masking qualifier
                let maskIntersection = new Set([...masks].filter(x => qualifiers.has(x)));
                lineClasses.dataMask = [...maskIntersection][0];
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


module.exports = {
    pointsSelector, lineSegmentsSelector, isVisibleSelector, yLabelSelector,
    titleSelector, descriptionSelector, MASK_DESC
};
