import {DateTime} from 'luxon';
import findIndex from 'lodash/findIndex';
import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';
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
    'BACKWATER': {label: 'Backwater'},
    'DISCONTINUED': {label: 'Discontinued'},
    'DRY': {label: 'Dry'},
    'EQUIP': {label: 'Equipment malfunction'},
    'FLOOD': {label: 'Flood'},
    'ICE': {label: 'Ice affected'},
    'MAINT': {label: 'Maintenance'},
    'PARTIAL_RECORD': {label: 'Partial record'},
    'PUMP': {label: 'Pump'},
    'RATINGDEV': {label: 'Rating revelopment'},
    'SEASONAL': {label: 'Seasonal'},
    'TEST': {label: 'Test'},
    'UNAVAIL': {label: 'Unavailable'},
    'ZEROFLOW': {label: 'Zero flow'}
};

const MASK_CLASSES = ['mask-0', 'mask-1', 'mask-2', 'mask-3', 'mask-4', 'mask-5',
    'mask-6', 'mask-7', 'mask-8', 'mask-9', 'mask-10', 'mask-11', 'mask-12',  'mask-13'];

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
 *      @prop {Array of Object} maskSegments - is an array Objects which include properties: startTime and endTime (both Numbers
 *          in epoch milliseconds and qualifiers which is an array of masked qualifiers that apply to this section.
 * Assumes that a change from masked qualifier to none (or vice versa) or different set of qualifiers starts a new segment and for lines a data gap
 * of two days also creates a new segment.
 */
export const getCurrentTimeSeriesSegments = createSelector(
    getCurrentTimeSeriesPoints,
    (timeSeries) => {
        const getMaskedQualifiers = function(point) {
            if (point.qualifiers) {
                return point.qualifiers
                    .filter(qualifier => qualifier in MASKED_QUALIFIERS)
                    .sort();
            } else {
                return [];
            }
        };

        const getClass = function(point) {
            if (!point.approvals) {
                return 'PROVISIONAL';
            } else if (point.approvals.includes('Approved')) {
                return point.qualifiers && point.qualifiers.includes('ESTIMATED') ? 'ESTIMATED' : 'APPROVED';
            } else {
                return 'PROVISIONAL';
            }
        };

        const getNewMaskedSegment = function(qualifiers, startTime) {
            return {
                startTime,
                qualifiers
            };
        };

        const getNewLineSegment = function(pointClass) {
            return {
                points: [],
                class: pointClass
            };
        };

        if (timeSeries.length === 0) {
            return {
                lineSegments: [],
                maskSegments: []
            };
        }

        let lineSegments = [];
        let maskSegments = [];

        let previousDate = timeSeries[0].dateTime;
        let newMaskedQualifiers = getMaskedQualifiers(timeSeries[0]);
        let isNewSegmentMasked = newMaskedQualifiers.length > 0;
        let newSegment = isNewSegmentMasked ?
            getNewMaskedSegment(newMaskedQualifiers, timeSeries[0].dateTime) :
            getNewLineSegment(getClass(timeSeries[0]), timeSeries[0]);

        timeSeries.forEach((point) => {
            const nextMaskedQualifiers = getMaskedQualifiers(point);
            const nextClass = getClass(point);
            const hasGap = point.dateTime - previousDate >= TWO_DAYS;
            if (!isNewSegmentMasked && !nextMaskedQualifiers.length && hasGap) {
                // there is a gap between two line segments so start a new segment
                lineSegments.push(newSegment);
                newSegment = getNewLineSegment(nextClass);

            } else if (isNewSegmentMasked && !isEqual(newSegment.qualifiers, nextMaskedQualifiers)) {
                // end previous masked segment where the next segment starts
                newSegment.endTime = point.dateTime;
                maskSegments.push(newSegment);

                isNewSegmentMasked = nextMaskedQualifiers.length > 0;
                if (isNewSegmentMasked) {
                    newSegment = getNewMaskedSegment(nextMaskedQualifiers, point.dateTime);
                } else  {
                    newSegment = getNewLineSegment(nextClass);
                }

            } else if (!isNewSegmentMasked && (nextMaskedQualifiers.length || newSegment.class != nextClass)) {
                // end previous line segment and start the next segment where the previous line ends
                const lastPoint = newSegment.points[newSegment.points.length - 1];
                lineSegments.push(newSegment);

                isNewSegmentMasked = nextMaskedQualifiers.length > 0;
                if (isNewSegmentMasked) {
                    newSegment = getNewMaskedSegment(nextMaskedQualifiers, lastPoint.dateTime);
                } else {
                    newSegment = getNewLineSegment(nextClass);
                    newSegment.points.push({
                        value: lastPoint.value,
                        dateTime: lastPoint.dateTime
                    });
                }
            }

            if (!isNewSegmentMasked) {
                newSegment.points.push({
                    value: point.value,
                    dateTime: point.dateTime
                });
            }
            previousDate = point.dateTime;
        });

        if (isNewSegmentMasked) {
            newSegment.endTime = timeSeries[timeSeries.length - 1].dateTime;
            maskSegments.push(newSegment);
        } else {
            lineSegments.push(newSegment);
        }
        // Add in full info for qualifiers and class in segments

        const finalLineSegments = lineSegments.map((segment) => {
            return {
                points: segment.points,
                class: LINE_CLASSES[segment.class]
            };
        });

        // For qualifiers, we color each unique combination of qualifiers. In the unlikely
        // event that we exceed 14 different unique combinations we will start over. The
        // label is always formed by combining the labels for all of the qualifiers for a
        // segment

        const uniqueMaskCombos = uniqWith(maskSegments.map(segment => segment.qualifiers));


        const finalMaskedSegments = maskSegments.map((segment) => {
            const maskToUse = findIndex(uniqueMaskCombos, (qualifiers) => isEqual(qualifiers, segment.qualifiers)) % 14;
            return {
                startTime: segment.startTime,
                endTime: segment.endTime,
                qualifiers: {
                    label: segment.qualifiers.map(qualifier => MASKED_QUALIFIERS[qualifier].label).join(', '),
                    class: MASK_CLASSES[maskToUse]
                }
            };
        });
        return {
            lineSegments: finalLineSegments,
            maskSegments: finalMaskedSegments
        };
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
