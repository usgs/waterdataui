import {DateTime} from 'luxon';
import isEqual from 'lodash/isEqual';
import zip from 'lodash/zip';
import zipObject from 'lodash/zipObject';
import {createSelector} from 'reselect';

import {getCurrentDVTimeSeries, getDVGraphCursorOffset} from '../../../selectors/daily-value-time-series-selector';
import {getNearestTime} from '../../../utils';

import {getXScale, getMainXScale, getMainYScale} from './scales';

const TWO_DAYS = 1000 * 60 * 60 * 24 * 2; // In milliseconds

export const APPROVED = 'Approved';
export const ESTIMATED = 'Estimated';

const MASKED_QUALIFIERS = {
    'BACKWATER': {label: 'Backwater', class: 'backwater-mask'},
    'DISCONTINUED': {label: 'Discontinued', class: 'discontinued-mask'},
    'DRY': {label: 'Dry', class: 'dry-mask'},
    'EQUIP': {label: 'Equipment malfunction', class: 'equip-mask'},
    'FLOOD': {label: 'Flood', class: 'flood-mask'},
    'ICE': {label: 'Ice Affected', class: 'ice-mask'},
    'MAINT': {label: 'Maintenance', class: 'maint-mask'},
    'PARTIAL_RECORD': {label: 'Partial Record', class: 'partial-record-mask'},
    'PUMP': {label: 'Pump', class: 'pump-mask'},
    'RATINGDEV': {label: 'Rating Development', class: 'ratingdev-mask'},
    'SEASONAL': {label: 'Seasonal', class: 'seasonal-mask'},
    'TEST': {label: 'Test', class: 'test-mask'},
    'UNAVAIL': {label: 'Unavailable', class: 'unavail-mask'},
    'ZEROFLOW': {label: 'Zero flow', class: 'zeroflow-mask'}
};

const LINE_CLASSES = {
    'APPROVED': {label: 'Approved', class: 'approved'},
    'ESTIMATED': {label: 'Estimated', class: 'estimated'},
    'PROVISIONAL': {label: 'Provisional', class: 'provisional'}
};

/* Returns the selector function which returns an Array of Objects, each object representing one value, dateTime (in epoch time),
and other attributes representing metadata on the value. This will represent the time series for the current
selected time series and is in increasing date order.
 */
export const getCurrentTimeSeriesPoints = createSelector(
    getCurrentDVTimeSeries,
    (timeSeries) => {
        if (!timeSeries) {
            return [];
        }
        let result =  zip(
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

        return result.sort((first, second) => {
            if (first.dateTime < second.dateTime) {
                return -1;
            } else if (first.dateTime > second.dateTime) {
                return 1;
            } else {
                return 0;
            }
        });
    }
);

/*
 * Returns selector function which returns an Object. The object has two properties
 *      @prop {Array of Objects} lineSegments - is an array of
 *          Objects which include points (Array of value and date properties) and a class property which is a
 *          determined from the approvals and default qualifiers.
 *      @prop {Array of Object} maskedDataSegments - is an array Objects which include properties: startTime and endTime (both Numbers
 *          in epoch milliseconds and qualifiers which is an array of masked qualifiers that apply to this section.
 * Assumes that a change from masked qualifier to none (or vice versa) or different set of qualifiers starts a new segment and for lines a data gap
 * of two days also creates a new segment.
 */
export const getCurrentTimeSeriesSegments = createSelector(
    getCurrentTimeSeriesPoints,
    (timeSeries) => {
        const getMaskedQualifiers = function(point) {
            return point.qualifiers
                .filter(qualifier => qualifier in Object.Keys(MASKED_QUALIFIERS))
                .sort()
        };

        const getClass = function(point) {
            if (point.approvals.contains('Approved')) {
                return point.qualifiers.contains('ESTIMATED') ? 'ESTIMATED' : 'APPROVED'
            } else {
                return 'PROVISIONAL'
            }
        };

        if (timeSeries.length === 0) {
            return {};
        }

        let lineSegments = [];
        let maskSegments = [];

        let previousDate = timeSeries[0].dateTime;
        let previousMaskedQualifiers = getMaskedQualifiers(timeSeries[0]);
        let previousClass = getClass(timeSeries[0]);
        let previousSegmentKind = previousMaskedQualifiers.length ? 'MASKED' : 'LINE';
        let previousSegment = previousMaskedQualifiers.length ?
            {startTime: timeSeries[0].dateTime, qualifiers: previousMaskedQualifiers} : {points: [], class: previousClass};


        timeSeries.forEach((point) => {
            const nextMaskedQualifiers = getMaskedQualifiers(point);
            const nextClass = getClass(point);
                        const hasGap = point.dateTime - previousDate >= TWO_DAYS;
            if (previousMaskedQualifiers != nextMaskedQualifiers) {
                // Previous segment should be ended
                switch (previousSegmentKind) {
                    case 'MASKED':
                        previousSegment.endTime = point.dateTime;
                    case 'LINE':
                        previousSegment.points.push(point);
                }
                // if a line segment check to see if there is a gap
            } else if (nextMaskedQualifier.length === 0 && point.dateTime - previousDate >= TWO_DAYS) {

            }

        })



        let lineSegments = [];
        let previousDate = timeSeries[0].dateTime;
        let previousApprovals = timeSeries[0].approvals;
        let segment = {
            points: [],
            approvals: previousApprovals
        };
        timeSeries.forEach((point) => {
            const resultValue = parseFloat(point.value);
            const hasGap = point.dateTime - previousDate >= TWO_DAYS;
            const hasDifferentApprovals = !isEqual(point.approvals, previousApprovals);
            if (hasDifferentApprovals && !hasGap) {
                // Add the current point to the last segment so that line is continous
                segment.points.push({
                    value: resultValue,
                    date: point.dateTime
                });
            }

            if (hasGap || hasDifferentApprovals) {
                lineSegments.push(segment);
                segment = {
                    points: [],
                    approvals: point.approvals
                };
                previousApprovals = point.approvals;
            }
            segment.points.push({
                value: resultValue,
                date: point.dateTime
            });
            previousDate = point.dateTime;
        });

        lineSegments.push(segment);
        return lineSegments;
    }
);

/*
 * Return a selector function that returns the epoch time for the current daily value cursor offset.
 * Return null if no current daily value cursor offset is set.
 */
export const getCursorEpochTime = createSelector(
    getDVGraphCursorOffset,
    getXScale(),
    (cursorOffset, xScale) => {

        if (!cursorOffset) {
            return xScale.domain()[1];
        }
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
        if (!points.length) {
            return null;
        }
        return getNearestTime(points, cursorEpochTime);
    }
);

/*
 * Return a selector which returns an array of objects with x, y coordinates, that represent
 * the position of the line(s) at the cursor offset. Currently this is a single element array.
 */
export const getCursorPoint = createSelector(
    getDataAtCursor,
    getMainXScale,
    getMainYScale,
    (point, xScale, yScale) => {
        if (!point) {
            return [];
        }
        const result = [{
            x: xScale(point.dateTime),
            y: yScale(point.value)
        }];
        return result;
    }
);
