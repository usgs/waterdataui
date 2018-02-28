const { timeFormat } = require('d3-time-format');
const memoize = require('fast-memoize');
const { createSelector } = require('reselect');


// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');

export const MASK_DESC = {
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


export const requestSelector = memoize(tsKey => state => {
    return state.series.requests && state.series.requests[tsKey] ? state.series.requests[tsKey] : null;
});


export const collectionsSelector = memoize(tsKey => createSelector(
    requestSelector(tsKey),
    state => state.series.timeSeriesCollections,
    (request, collections) => {
        if (!request || !request.timeSeriesCollections || !collections) {
            return [];
        } else {
            return request.timeSeriesCollections.map(colID => collections[colID]);
        }
    }
));


export const currentVariableSelector = createSelector(
    state => state.series.variables,
    state => state.currentVariableID,
    (variables, variableID) => {
        return variableID ? variables[variableID] : null;
    }
);


export const methodsSelector = state => state.series.methods;


/**
 * Returns a selector that, for a given tsKey:
 * Selects all time series.
 * @param  {String} tsKey       Time-series key
 * @param  {String} hasPoints   Only return time series that have point data
 * @param  {Object} state       Redux state
 * @return {Object}             Time-series data
 */
export const timeSeriesSelector = memoize((tsKey, hasPoints=true) => createSelector(
    state => state.series.timeSeries,
    collectionsSelector(tsKey),
    (timeSeries, collections) => {
        const series = collections.reduce((seriesList, collection) => {
            const colSeries = collection.timeSeries.map(sID => timeSeries[sID]);
            Array.prototype.push.apply(seriesList, colSeries);
            return seriesList;
        }, []);
        if (hasPoints) {
            return series.filter(ts => ts.points.length > 0);
        } else {
            return series;
        }
    }
));


/**
 * Returns a selector that, for a given tsKey:
 * Selects all time series for the current time series variable.
 * @param  {String} tsKey   Time-series key
 * @param  {Object} state   Redux state
 * @return {Object}         Time-series data
 */
export const currentTimeSeriesSelector = memoize(tsKey => createSelector(
    state => state.series.timeSeries,
    collectionsSelector(tsKey),
    currentVariableSelector,
    (timeSeries, collections, variable) => {
        return collections.filter(c => c.variable === variable.oid).reduce((seriesList, collection) => {
            const colSeries = collection.timeSeries.map(sID => timeSeries[sID]);
            Array.prototype.push.apply(seriesList, colSeries);
            return seriesList;
        }, []);
    }
));


/**
 * Returns the points for a given timeseries.
 * @param  {Object} state     Redux store
 * @param  {String} tsKey     Timeseries key
 * @return {Array}            Array of points.
 */
export const pointsSelector = memoize(tsKey => createSelector(
    currentTimeSeriesSelector(tsKey),
    (timeSeries) => {
        // FIXME: Return all points, not just those from the first time series.
        const pointsList = timeSeries.map(series => series.points);
        return pointsList[0] || [];
    }
));


export const classesForPoint = point => {
    return {
        approved: point.qualifiers.indexOf('A') > -1,
        estimated: point.qualifiers.indexOf('E') > -1
    };
};


/**
 * Returns an array of points for each visible timeseries.
 * @param  {Object} state     Redux store
 * @return {Array}            Array of point arrays.
 */
export const visiblePointsSelector = createSelector(
    pointsSelector('current'),
    pointsSelector('compare'),
    pointsSelector('median'),
    (state) => state.showSeries,
    (current, compare, median, showSeries) => {
        const pointArray = [];
        if (showSeries['current']) {
            pointArray.push(current);
        }
        if (showSeries['compare']) {
            pointArray.push(compare);
        }
        if (showSeries['median']) {
            pointArray.push(median);
        }
        return pointArray;
    }
);


/**
 * Factory function creates a function that:
 * Returns the current show state of a timeseries.
 * @param  {Object}  state     Redux store
 * @param  {String}  tsDataKey Timeseries key
 * @return {Boolean}           Show state of the timeseries
 */
export const isVisibleSelector = memoize(tsDataKey => (state) => {
    return state.showSeries[tsDataKey];
});


/**
 * Factory function creates a function that:
 * Returns all points in a timeseries grouped into line segments.
 * @param  {Object} state     Redux store
 * @param  {String} tsDataKey Timeseries key
 * @return {Array}            Array of points.
 */
export const lineSegmentsSelector = memoize(tsDataKey => createSelector(
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


export const yLabelSelector = createSelector(
    currentVariableSelector,
    variable => variable ? variable.variableDescription : ''
);


export const titleSelector = createSelector(
    currentVariableSelector,
    variable => variable ? variable.variableName : ''
);


export const descriptionSelector = createSelector(
    currentVariableSelector,
    currentTimeSeriesSelector('current'),
    (variable, timeSeriesList) => {
        const desc = variable ? variable.variableDescription : '';
        const startTime = Math.max.apply(timeSeriesList.map(ts => ts.startTime));
        const endTime = Math.max.apply(timeSeriesList.map(ts => ts.startTime));
        return `${desc} from ${formatTime(startTime)} to ${formatTime(endTime)}`;
    }
);
