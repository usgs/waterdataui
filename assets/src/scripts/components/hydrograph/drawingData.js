const memoize = require('fast-memoize');
const { createSelector } = require('reselect');
const { format } = require('d3-format');

const {allTimeSeriesSelector, currentVariableTimeSeriesSelector, timeSeriesSelector, variablesSelector } = require('./timeseries');


export const MASK_DESC = {
    ice: 'Ice Affected',
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

export const HASH_ID = {
    current: 'hash-45',
    compare: 'hash-135'
};

// Lines will be split if the difference exceeds 72 minutes.
export const MAX_LINE_POINT_GAP = 60 * 1000 * 72;

const PARM_CODES_TO_ACCUMULATE = ['00045'];

const toNumberString = format('.2f');


/*
 * @param {Array} points - Array of point objects
 * @return {Array} - Returns the array of points accumulated. If a null value is found,
 * the accumulator is set back to zero.
 */
const transformToCumulative = function(points) {
    let accumulatedValue = 0;
    return points.map((point) => {
        let result = {...point};
        if (point.value !== null) {
            accumulatedValue += point.value;
            result.value = parseFloat(toNumberString(accumulatedValue));
        } else {
            accumulatedValue = 0;
        }
        return result;
    });
};

/* Factory function that returns a function that returns an object where the properties are ts IDs and the values
 * are array of point objects that can be used to render a time series graph.
 * @param {Object} state
 * @return {Object} where the keys are ts ids and the values are an Array of point Objects.
 */
export const allPointsSelector = createSelector(
    allTimeSeriesSelector,
    state => state.series.variables,
    (timeSeries, variables) => {
        let allPoints = {};
        Object.keys(timeSeries).forEach((tsId) => {
            const ts = timeSeries[tsId];
            const variableId = ts.variable;
            const parmCd = variables[variableId].variableCode.value;
            if (ts.tsKey !== 'median' && PARM_CODES_TO_ACCUMULATE.includes(parmCd)) {
                allPoints[tsId] = transformToCumulative(ts.points);
            } else {
                allPoints[tsId] = ts.points;
            }
        });
        return allPoints;
    }
);

/* Factory function that for a given tsKey returns an object with keys that are the tsID and values an array of point objects
 * @param {Object} state
 * @param {String} tsKey
 * @return {Object} of keys are tsId, values are Array of point Objects
 */
export const pointsByTsKeySelector = memoize(tsKey => createSelector(
    allPointsSelector,
    state => state.series.timeSeries,
    (points, timeSeries) => {
        let result = {};
        Object.keys(points).forEach((tsId) => {
            if (timeSeries[tsId].tsKey === tsKey) {
                result[tsId] = points[tsId];
            }
        });
        return result;
    }));

/* Returns a select that returns all time series point for the ccurrent variable and in the select series, tsKey
 * by tsId.
 * @param {Object} state
 * @param {String} tsKey
 * @return Object
 */
export const currentVariablePointsByTsIdSelector = memoize(tsKey => createSelector(
    pointsByTsKeySelector(tsKey),
    currentVariableTimeSeriesSelector(tsKey),
    (points, timeSeries) => {
        let result = {};
        if (points) {
            result = Object.keys(timeSeries).reduce((data, tsId) => {
                data[tsId] = points[tsId];
                return data;
            }, {});
        }
        return result;
    }
));

/* Returns a selector that returns all time series points for the current variable and in the selected series, tsKey.
 * @param {Object} state
 * @param {String} tsKey
 * @return Array of Array of points
 */
export const currentVariablePointsSelector = memoize(tsKey => createSelector(
    pointsByTsKeySelector(tsKey),
    currentVariableTimeSeriesSelector(tsKey),
    (points, timeSeries) => {
        return timeSeries ? Object.keys(timeSeries).map((tsId) => points[tsId]) : [];
    }
));


/**
 * Returns a selector that, for a given tsKey:
 * Returns an array of time points for all time series.
 * @param  {Object} state     Redux store
 * @param  {String} tsKey     Timeseries key
 * @return {Array}            Array of array of points.
 */
export const pointsSelector = memoize((tsKey) => createSelector(
    pointsByTsKeySelector(tsKey),
    (points) => {
        return Object.values(points);
    }
));


/**
 * Factory function that returns a selector for a given tsKey, that:
 * Returns a single array of all points.
 * @param  {Object} state       Redux state
 * @return {Array}              Array of points.
 */
export const flatPointsSelector = memoize(tsKey => createSelector(
    pointsSelector(tsKey),
    tsPointsList => tsPointsList.reduce((finalPoints, points) => {
        Array.prototype.push.apply(finalPoints, points);
        return finalPoints;
    }, [])
));


/*
 * Returns an object which identifies which classes to use for the point
 * @param {Object} point
 * @return {Object}
 */
export const classesForPoint = point => {
    return {
        approved: point.qualifiers.indexOf('A') > -1,
        estimated: point.qualifiers.indexOf('E') > -1
    };
};



/**
 * Factory function create a function that
 * returns an array of points for each visible timeseries.
 * @param  {Object} state     Redux store
 * @return {Array}            Array of point arrays.
 */
export const visiblePointsSelector = createSelector(
    currentVariablePointsSelector('current'),
    currentVariablePointsSelector('compare'),
    currentVariablePointsSelector('median'),
    (state) => state.timeseriesState.showSeries,
    (current, compare, median, showSeries) => {
        const pointArray = [];
        if (showSeries['current']) {
            Array.prototype.push.apply(pointArray, current);

        }
        if (showSeries['compare']) {
            Array.prototype.push.apply(pointArray, compare);
        }
        if (showSeries['median']) {
            Array.prototype.push.apply(pointArray, median);
        }
        return pointArray;
    }
);


/**
 * Factory function creates a function that, for a given tsKey:
 * Returns all point data as an array of [value, time, qualifiers].
 * @param {Object} state - Redux store
 * @param {String} tsKey - timeseries key
 * @param {Object} - keys are ts id, values are an array of points where each point is an Array as follows:  [value, time, qualifiers].
 */
export const pointsTableDataSelector = memoize(tsKey => createSelector(
    pointsByTsKeySelector(tsKey),
    (allPoints) => {
        return Object.keys(allPoints).reduce((databyTsId, tsId) => {
            databyTsId[tsId] = allPoints[tsId].map((value) => {
                return [
                    value.value || '',
                    value.dateTime || '',
                    value.qualifiers && value.qualifiers.length > 0 ? value.qualifiers.join(', ') : ''
                ];
            });
            return databyTsId;
        }, {});
    }
));

const getLineClasses = function(pt) {
    let dataMask = null;
    if (pt.value === null) {
        let qualifiers = new Set(pt.qualifiers.map(q => q.toLowerCase()));

        // current business rules specify that a particular data point
        // will only have at most one masking qualifier
        let maskIntersection = Object.keys(MASK_DESC).filter(x => qualifiers.has(x));
        dataMask = maskIntersection[0];
    }
    return {
        ...classesForPoint(pt),
        dataMask
    };
};


/**
 * Factory function creates a function that:
 * Returns all points in a timeseries grouped into line segments, for each time series.
 * @param  {Object} state     Redux store
 * @param  {String} tsKey Timeseries key
 * @return {Object}  Keys are ts Ids, values are  of array of line segments.
 */
export const lineSegmentsSelector = memoize(tsKey => createSelector(
    pointsByTsKeySelector(tsKey),
    (tsPoints) => {
        let seriesLines = {};
        Object.keys(tsPoints).forEach((tsId) => {
            const points = tsPoints[tsId];
            let lines = [];

            // Accumulate data into line groups, splitting on the estimated and
            // approval status.
            let lastClasses = {};

            for (let pt of points) {
                // Classes to put on the line with this point.
                let lineClasses = getLineClasses(pt);

                // If this is a non-masked data point, split lines if the gap
                // from the period point exceeds MAX_LINE_POINT_GAP.
                let splitOnGap = false;
                if (!lineClasses.dataMask && lines.length > 0) {
                    const lastPoints = lines[lines.length - 1].points;
                    const lastPtDateTime = lastPoints[lastPoints.length - 1].dateTime;
                    if (pt.dateTime - lastPtDateTime > MAX_LINE_POINT_GAP) {
                        splitOnGap = true;
                    }
                }

                // If this point doesn't have the same classes as the last point,
                // create a new line for it.
                if (lastClasses.approved !== lineClasses.approved ||
                    lastClasses.estimated !== lineClasses.estimated ||
                    lastClasses.dataMask !== lineClasses.dataMask ||
                    splitOnGap) {
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
            seriesLines[tsId] = lines;
        });
        return seriesLines;
    }
));


/**
 * Factory function creates a function that, for a given tsKey:
 * @return {Object} - Mapping of parameter code Array of line segments.
 */
export const lineSegmentsByParmCdSelector = memoize(tsKey => createSelector(
    lineSegmentsSelector(tsKey),
    timeSeriesSelector(tsKey),
    variablesSelector,
    (lineSegmentsBySeriesID, timeSeriesMap, variables) => {
        return Object.keys(lineSegmentsBySeriesID).reduce((byVarID, sID) => {
            const series = timeSeriesMap[sID];
            const parmCd = variables[series.variable].variableCode.value;
            byVarID[parmCd] = byVarID[parmCd] || [];
            byVarID[parmCd].push(lineSegmentsBySeriesID[sID]);
            return byVarID;
        }, {});
    }
));


/**
 * Factory function creates a function that, for a given tsKey:
 * Returns mapping of series ID to line segments for the currently selected variable.
 * @return {Object} - Keys are time series ids and values are the line segment arrays
 */
export const currentVariableLineSegmentsSelector = memoize(tsKey => createSelector(
    currentVariableTimeSeriesSelector(tsKey),
    lineSegmentsSelector(tsKey),
    (seriesMap, linesMap) => {
        return Object.keys(seriesMap).reduce((visMap, sID) => {
                visMap[sID] = linesMap[sID];
                return visMap;
            }, {});

    }
));

