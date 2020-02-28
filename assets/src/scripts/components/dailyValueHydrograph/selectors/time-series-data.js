import {DateTime} from 'luxon';
import isEqual from 'lodash/isEqual';
import zip from 'lodash/zip';
import zipObject from 'lodash/zipObject';
import {createSelector} from 'reselect';

import {getCurrentObservationsTimeSeries, getObservationsCursorOffset} from '../../../selectors/observations-selector';
import {getNearestTime} from '../../../utils';

import {getXScale, getYScale} from './scales';

const TWO_DAYS = 1000 * 60 * 60 * 24 * 2; // In milliseconds

/* Returns the selector function wheich returns an Array of Objects, each object representing one value, dateTime (in epoch time),
and other attributes representing metadata on the value. This will represent the time series for the current
selected time series
 */
export const getCurrentTimeSeriesPoints = createSelector(
    getCurrentObservationsTimeSeries,
    (timeSeries) => {
        if (!timeSeries) {
            return [];
        }
        return zip(
            timeSeries.properties.result,
            timeSeries.properties.timeStep.map((timeStep) => {
                return new DateTime.fromISO(timeStep, {zone: 'UTC'}).toMillis();
            }),
            timeSeries.properties.nilReason,
            timeSeries.properties.approvals,
            timeSeries.properties.qualifiers,
            timeSeries.properties.grades)
            .map((zippedStep) => {
                return zipObject([
                    'value',
                    'dateTime',
                    'nilReason',
                    'approvals',
                    'qualifiers',
                    'grades'
                ], zippedStep);
            });
    }
);

/*
 * Returns selector function which returns an array of Objects which include the data needed to render the line.
 * The time series data is broken into line segments. The points in a line segment will be shown as continuous and
 * the data has the same approvals.
 * Each Object contains the following properties
 *      @prop {Array of Object} points - each object has date (in milliseconds) and value {Number} properties
 *      @prop {Array of String} approvals - The approvals for this line segment
 *  The time series
 */
export const getCurrentTimeSeriesLineSegments = createSelector(
    getCurrentObservationsTimeSeries,
    (timeSeries) => {
        if (!timeSeries) {
            return [];
        }

        const timeStepInMillis = timeSeries.properties.timeStep.map((t) => new DateTime.fromISO(t, {zone: 'UTC'}).toMillis());

        let lineSegments = [];
        let previousDate = timeStepInMillis[0];
        let previousApprovals = timeSeries.properties.approvals[0];
        let segment = {
            points: [],
            approvals: timeSeries.properties.approvals[0]
        };
        timeStepInMillis.forEach(function(date, index) {
            const resultValue = parseFloat(timeSeries.properties.result[index]);
            const hasGap = date - previousDate >= TWO_DAYS;
            const hasDifferentApprovals = !isEqual(timeSeries.properties.approvals[index], previousApprovals);
            if (hasDifferentApprovals && !hasGap) {
                // Add the current point to the last segment so that line is continuous
                segment.points.push({
                    value: resultValue,
                    date: date
                });
            }

            if (hasGap || hasDifferentApprovals) {
                lineSegments.push(segment);
                segment = {
                    points: [],
                    approvals: timeSeries.properties.approvals[index]
                };
                previousApprovals = timeSeries.properties.approvals[index];
            }
            segment.points.push({
                value: parseFloat(resultValue),
                date: date
            });
            previousDate = date;
        });
        lineSegments.push(segment);
        return lineSegments;
    }
);

/*
 * Return a selector function that returns the epoch time for the current observations cursor offset.
 * Return null if no current observations cursor offset is set.
 */
export const getCursorEpochTime = createSelector(
    getObservationsCursorOffset,
    getXScale,
    (cursorOffset, xScale) => {
        console.log('Cursor offset is: ' + cursorOffset)
        if (!cursorOffset) {
            return null;
        }
        console.log('Epoch time is: ' + xScale.domain()[0] + cursorOffset)
        return xScale.domain()[0] + cursorOffset;
    }
);

/*
 * Return a selector which returns the points nearest the cursor's epoch time.
 */
export const getDataAtCursor = createSelector(
    getCursorEpochTime,
    getCurrentTimeSeriesPoints,
    (cursorEpochTime, points)=> {
        console.log('In getDataAtCursor ' + cursorEpochTime)
        if (!cursorEpochTime) {
            return null;
        }
        return getNearestTime(points, cursorEpochTime);
    }
);

/*
 * Return a selector which returns the x, y coordinates of the cursor
 */
export const getCursorPoint = createSelector(
    getDataAtCursor,
    getXScale,
    getYScale,
    (point, xScale, yScale) => {
        if (!point) {
            return [];
        }
        console.log(`in getCursorPoint for ${point.dateTime} and ${point.value}`);
        return [{
            x: xScale(point.dateTime),
            y: yScale(point.value)
        }];
    }
);
