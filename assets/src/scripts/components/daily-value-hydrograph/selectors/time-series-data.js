import {DateTime} from 'luxon';
import findIndex from 'lodash/findIndex';
import isEqual from 'lodash/isEqual';
import uniq from 'lodash/uniq';
import uniqWith from 'lodash/uniqWith';
import zip from 'lodash/zip';
import zipObject from 'lodash/zipObject';
import {createSelector} from 'reselect';

import {getCurrentDVTimeSeries, getDVGraphCursorOffset} from '../../../selectors/daily-value-time-series-selector';
import {getNearestTime} from '../../../utils';

import {getXScale, getMainXScale, getMainYScale} from './scales';

const TWO_DAYS = 1000 * 60 * 60 * 24 * 2; // In milliseconds

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
    'RATINGDEV': {label: 'Rating development'},
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


/*
 * Returns the selector function which returns an Array of Objects, each object representing
 * one value, dateTime (in epoch time), approvals, nilReason, qualifiers, and grades
 * This will represent the time series for the current selected time series and is in increasing date order.
 */
export const getCurrentTimeSeriesData = createSelector(
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
 * Returns a selector function function returns an Array of Object that can be used to visualize the
 * currently selected time series data.
 * Each object has the following properties:
 *      @prop {String} value
 *      @prop {Number} dateTime - in epoch milliseconds
 *      @prop {Boolean} isMasked
 *      @prop {String} label - human readable label
 *      @prop {String} class - can be used to style the data
 */
export const getCurrentTimeSeriesPoints = createSelector(
    getCurrentTimeSeriesData,
    (tsData) => {
        const getLineClass = function(point) {
            if (!point.approvals) {
                return 'PROVISIONAL';
            } else if (point.approvals.includes('Approved')) {
                return point.qualifiers && point.qualifiers.includes('ESTIMATED') ? 'ESTIMATED' : 'APPROVED';
            } else {
                return 'PROVISIONAL';
            }
        };

        const points = tsData.map((point) => {
            const maskedQualifierLabels = (point.qualifiers ? point.qualifiers : [])
                    .filter(qualifier => qualifier in MASKED_QUALIFIERS)
                    .sort()
                    .map(qualifier => MASKED_QUALIFIERS[qualifier].label);
            const isMasked = maskedQualifierLabels.length > 0;
            const lineClass = getLineClass(point);
            return {
                value : point.value,
                dateTime: point.dateTime,
                isMasked: isMasked,
                label: isMasked ? maskedQualifierLabels.join(', ') : LINE_CLASSES[lineClass].label,
                class: isMasked ? '' : LINE_CLASSES[lineClass].class
            };
        });

        // For masked data, find all unique combinations and then assign each unique combination a mask
        // If in the unlikely case that there are more the 14 combinations, the class name will be repeated.
        const allMaskLabels = points
            .filter(point => point.isMasked)
            .map(point => point.label);
        const uniqueMaskLabels = uniq(allMaskLabels);

        return points.map((point) => {
            if (point.isMasked) {
                const maskToUse = findIndex(uniqueMaskLabels, (label) => label === point.label);
                return {
                    ...point,
                    class: MASK_CLASSES[maskToUse]
                };
            } else {
                return {
                    ...point
                };
            }
        });
    }
);

/*
 * Returns selector function which returns an Array of Objects. Each object has four properties and
 * represents a segment
 *      @prop {Boolean} isMasked
 *      @prop {Array of Object} points - Each point has {Number} value and {Number in milliseconds} dateTime
 *      @prop {String} label
 *      @prop {String} class
 *
 * A new segment is started when there is a change from masked to non-masked (or vice versa),
 * if a segment has a different label, or if two line segments are separated by more than two days.
 * The returned segments represent the currently selected time series
 */
export const getCurrentTimeSeriesSegments = createSelector(
    getCurrentTimeSeriesPoints,
    (points) => {
        const getNewSegment = function(point) {
            return {
                isMasked: point.isMasked,
                points: [],
                label: point.label,
                class: point.class
            };
        };

        if (points.length === 0) {
            return [];
        }

        let segments = [];
        let previousDate = points[0].dateTime;
        let newSegment = getNewSegment(points[0]);

        points.forEach((point) => {
            const resultValue = parseFloat(point.value);
            const hasGap = point.dateTime - previousDate >= TWO_DAYS;
            const pointLabelHasChanged = newSegment.label !== point.label;

            if (!newSegment.isMasked && !point.isMasked && hasGap) {
                // there is a gap between two line segments so start a new segment
                segments.push(newSegment);
                newSegment = getNewSegment(point);

            } else if (newSegment.isMasked && pointLabelHasChanged) {
                // end previous masked segment where the next segment starts
                newSegment.points.push({
                    value: resultValue,
                    dateTime: point.dateTime
                });
                segments.push(newSegment);

                newSegment = getNewSegment(point);

            } else if (!newSegment.isMasked && pointLabelHasChanged) {
                // end previous line segment and start the next segment where the previous line ends
                const lastPoint = newSegment.points[newSegment.points.length - 1];
                segments.push(newSegment);

                newSegment = getNewSegment(point);
                newSegment.points.push(lastPoint);
            }

            newSegment.points.push({
                value: resultValue,
                dateTime: point.dateTime
            });
            previousDate = point.dateTime;
        });
        segments.push(newSegment);

        return segments;
    }
);

/*
 * Return a selector function that returns an Array of Objects. The array represents the unique kinds of
 * data that are being currently displayed. Each Object has the following properties:
 *      @prop {Boolean} isMasked
 *      @prop {String} label
 *      @prop {String} class
 */
export const getCurrentUniqueDataKinds = createSelector(
    getCurrentTimeSeriesPoints,
    (points) => {
        const mappedPoints = points.map((point) => {
            return {
                isMasked: point.isMasked,
                label: point.label,
                class: point.class
            };
        });
        return uniqWith(mappedPoints, isEqual);
    }
);

/*
 * Return a selector function that returns the epoch time for the current daily value cursor offset.
 * Return the latest time if no current daily value cursor offset is set.
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
 * Return a selector which returns the point nearest the cursor's epoch time.
 * @returns Function which returns {Object} the following properties:
 *      @prop {Number} value
 *      @prop {Number} dateTime - in epoch milliseconds
 *      @prop {Boolean} isMasked
 *      @prop {String} label - human readable label
 *      @prop {String} class - can be used to style the data
 */
export const getCurrentDataPointAtCursor = createSelector(
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
 * Return a selector which returns an Array of Objects with x, y coordinates, that represent
 * the position of the currently selected time series point at the cursor offset. This is a single element array.
 */
export const getCurrentCursorPoint = createSelector(
    getCurrentDataPointAtCursor,
    getMainXScale,
    getMainYScale,
    (point, xScale, yScale) => {
        if (!point) {
            return [];
        }
        return [{
            x: xScale(point.dateTime),
            y: yScale(point.value)
        }];
    }
);
