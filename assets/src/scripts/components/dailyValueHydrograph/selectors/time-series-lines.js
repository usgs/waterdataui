import {DateTime} from 'luxon';
import isEqual from 'lodash/isEqual';
import {createSelector} from 'reselect';

import {getCurrentObservationsTimeSeries} from '../../../selectors/observations-selector';

const TWO_DAYS = 1000 * 60 * 60 * 24 * 2; // In milliseconds

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