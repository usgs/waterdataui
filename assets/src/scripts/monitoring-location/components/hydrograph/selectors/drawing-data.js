/*
 * One helper function is exported and used in some of the rendering code.
 * It would be good to refactor this but I think ultimately it will likely wait until
 * we have a new IV data service that follows similar patterns to what is returned by
 * the daily value statistical service.
 */
import {format} from 'd3-format';
import memoize from 'fast-memoize';
import find from 'lodash/find';
import {DateTime} from 'luxon';
import {createSelector} from 'reselect';

import {getCurrentVariableMedianStatistics} from 'ml/selectors/median-statistics-selector';
import {
    getVariables, getCurrentMethodID, getTimeSeries, getCurrentVariableTimeSeries, getTimeSeriesForTsKey,
    getTsRequestKey, getRequestTimeRange, getCurrentVariable
} from 'ml/selectors/time-series-selector';
import {getIanaTimeZone} from 'ml/selectors/time-zone-selector';

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

/*
 * Helper function that returns an object which identifies which classes to use for the point.
 * This is used within a few of the rendering modules.
 * @param {Object} point
 * @return {Object}
 */
export const classesForPoint = function(point) {
    return {
        approved: point.qualifiers.indexOf('A') > -1,
        estimated: point.qualifiers.indexOf('e') > -1 || point.qualifiers.indexOf('E') > -1
    };
};


/* Factory function that returns a function that returns an object where the properties are ts IDs and the values
 * are array of point objects that can be used to render a time series graph.
 * @param {Object} state
 * @return {Object} where the keys are ts ids and the values are an Array of point Objects.
 */
export const getAllPoints = createSelector(
    getTimeSeries,
    getVariables,
    (timeSeries, variables) => {
        let allPoints = {};
        Object.keys(timeSeries).forEach((tsId) => {
            const ts = timeSeries[tsId];
            const variableId = ts.variable;
            const parmCd = variables[variableId].variableCode.value;
            if (PARM_CODES_TO_ACCUMULATE.includes(parmCd)) {
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
export const getPointsByTsKey = memoize((tsKey, period) => createSelector(
    getTsRequestKey(tsKey, period),
    getAllPoints,
    getTimeSeries,
    (tsRequestKey, points, timeSeries) => {
        let result = {};
        Object.keys(points).forEach((tsId) => {
            if (timeSeries[tsId].tsKey === tsRequestKey) {
                result[tsId] = points[tsId];
            }
        });
        return result;
    }));

/* Returns a select that returns all time series points for the current variable and in the select series, tsKey
 * by tsId.
 * @param {Object} state
 * @param {String} tsKey
 * @return Object
 */
export const getCurrentVariablePointsByTsId = memoize(tsKey => createSelector(
    getPointsByTsKey(tsKey),
    getCurrentVariableTimeSeries(tsKey),
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
export const getCurrentVariablePoints = memoize(tsKey => createSelector(
    getPointsByTsKey(tsKey),
    getCurrentVariableTimeSeries(tsKey),
    (points, timeSeries) => {
        return timeSeries ? Object.keys(timeSeries).map((tsId) => points[tsId]) : [];
    }
));

/*
 * @ return {Array of Arrays of Objects} where the properties are date (universal), and value
*/
export const getCurrentVariableMedianStatPoints = createSelector(
    getCurrentVariableMedianStatistics,
    getRequestTimeRange('current'),
    getIanaTimeZone,
    (stats, timeRange, ianaTimeZone) => {
        if (!stats || !timeRange) {
            return [];
        }

        // From the time range and time zone, determine the dates that we need to create the points arrays.
        // Note that the first and last dates should match the time range's start and end time
        let datesOfInterest = [];
        let nextDateTime = DateTime.fromMillis(timeRange.start, {zone: ianaTimeZone});
        datesOfInterest.push({
            year: nextDateTime.year,
            month: nextDateTime.month.toString(),
            day: nextDateTime.day.toString(),
            utcDate: timeRange.start
        });
        nextDateTime = nextDateTime.startOf('day').plus({days: 1});
        while (nextDateTime.valueOf() <= timeRange.end) {
            datesOfInterest.push({
                year: nextDateTime.year,
                month: nextDateTime.month.toString(),
                day: nextDateTime.day.toString(),
                utcDate: nextDateTime.toMillis()
            });
            nextDateTime = nextDateTime.plus({days: 1});
        }
        nextDateTime = DateTime.fromMillis(timeRange.end, {zone: ianaTimeZone});
        datesOfInterest.push({
            year: nextDateTime.year,
            month: nextDateTime.month.toString(),
            day: nextDateTime.day.toString(),
            utcDate: timeRange.end
        });

        // Retrieve the median data matching the datesOfInterest and then create points arrays suitable for plotting.
        return Object.values(stats).map((seriesStats) => {
            return datesOfInterest
                .map((date) => {
                    let stat = find(seriesStats, {'month_nu': date.month, 'day_nu': date.day});
                    return {
                        value: stat && stat.p50_va ? parseFloat(stat.p50_va) : null,
                        date: date.utcDate
                    };
                })
                .filter((point) => {
                    return point.value !== null;
                });
        });
    });

/**
 * Factory function create a function that
 * returns an array of points for each visible time series.
 * @param  {Object} state     Redux store
 * @return {Array}            Array of point arrays.
 */
export const getVisiblePoints = createSelector(
    getCurrentVariablePoints('current'),
    getCurrentVariablePoints('compare'),
    getCurrentVariableMedianStatPoints,
    (state) => state.ivTimeSeriesState.showIVTimeSeries,
    (current, compare, median, showSeries) => {
        const pointArray = [];
        if (showSeries['current']) {
            Array.prototype.push.apply(pointArray, current);

        }
        if (showSeries['compare']) {
            Array.prototype.push.apply(pointArray, compare);
        }
        if (showSeries['median']) {
            Array.prototype.push.apply(pointArray, Object.keys(median).map(tsId => median[tsId] ?  median[tsId] : []));
        }
        return pointArray;
    }
);


const getLineClasses = function(pt, isCurrentMethod) {
    let maskIntersection = [];
    if (pt.value === null) {
        const qualifiers = pt.qualifiers.map((q) => {
            return q.toLowerCase();
        });

        // current business rules specify that a particular data point
        // will only have at most one masking qualifier
        maskIntersection = Object.keys(MASK_DESC).filter(x => qualifiers.includes(x));
    }
    return {
        ...classesForPoint(pt),
        currentMethod: isCurrentMethod,
        dataMask: maskIntersection
    };
};

/*
 * Returns a selector function which returns an array of Objects that represent
 * the current IV data for the current time range.
 * @return {Function} which returns an array of objects.
 */
export const getCurrentPointData = createSelector(
    getCurrentVariablePointsByTsId('current'),
    getCurrentMethodID,
    getCurrentVariable,
    getIanaTimeZone,
    (pointsByTsId, currentMethodId, currentVariable, timeZone) => {
        const pointsKey = Object.keys(pointsByTsId).find((tsId) => {
            return parseInt(tsId.split(':')[0]) === currentMethodId;
        });

        if (!pointsKey) {
            return [];
        }
        return pointsByTsId[pointsKey].map((point) => {
            const lineClasses = getLineClasses(point, false);
            const masks = lineClasses.dataMask.map(key => MASK_DESC[key]);
            let approvals = [];
            if (lineClasses.approved) {
                approvals.push('Approved');
            }
            if (lineClasses.estimated) {
                approvals.push('Estimated');
            }

            if (approvals.length === 0) {
                approvals.push('Provisional');
            }
            return {
                parameterName: currentVariable.variableName,
                result: point.value === null ? '' : point.value.toString(),
                dateTime: DateTime.fromMillis(point.dateTime, {zone: timeZone}).toISO({
                    suppressMilliseconds: true,
                    suppressSeconds: true
                }),
                approvals: approvals.join(','),
                masks: masks.join(',')
            };
        });
    }
);


/**
 * Factory function creates a function that:
 * Returns all points in a time series grouped into line segments, for each time series.
 * @param  {Object} state     Redux store
 * @param  {String} tsKey Time series key
 * @return {Object}  Keys are ts Ids, values are  of array of line segments.
 */
export const getLineSegments = memoize((tsKey, period) => createSelector(
    getPointsByTsKey(tsKey, period),
    getCurrentMethodID,
    (tsPoints, currentMethodID) => {
        let seriesLines = {};
        Object.keys(tsPoints).forEach((tsId) => {
            const methodID = tsId.split(':')[0];
            const points = tsPoints[tsId];
            let lines = [];

            // Accumulate data into line groups, splitting on the estimated and
            // approval status.
            let lastClasses = {};

            for (let pt of points) {
                // Classes to put on the line with this point.
                let lineClasses = getLineClasses(pt, !currentMethodID || currentMethodID === parseInt(methodID));
                lineClasses.dataMask = lineClasses.dataMask.length ? lineClasses.dataMask[0] : null;
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
                    lastClasses.currentMethod !== lineClasses.currentMethod ||
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
export const getLineSegmentsByParmCd = memoize((tsKey, period) => createSelector(
    getLineSegments(tsKey, period),
    getTimeSeriesForTsKey(tsKey, period),
    getVariables,
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
export const getCurrentVariableLineSegments = memoize(tsKey => createSelector(
    getCurrentVariableTimeSeries(tsKey),
    getLineSegments(tsKey),
    (seriesMap, linesMap) => {
        return Object.keys(seriesMap).reduce((visMap, sID) => {
                visMap[sID] = linesMap[sID];
                return visMap;
            }, {});

    }
));



