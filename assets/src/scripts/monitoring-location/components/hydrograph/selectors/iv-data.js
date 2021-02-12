import {format} from 'd3-format';
import memoize from 'fast-memoize';
import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';
import {DateTime} from 'luxon';
import {createSelector} from 'reselect';

import config from 'ui/config';

import {getIVData, getPrimaryParameter} from 'ml/selectors/hydrograph-data-selector';
import {getSelectedIVMethodID} from 'ml/selectors/hydrograph-state-selector';

const MASKED_QUALIFIERS = {
    ice: {label: 'Ice Affected', class: 'ice-affected-mask'},
    fld: {label: 'Flood', class: 'flood-mask'},
    bkw: {label: 'Backwater', class: 'backwater-mask'},
    zfl: {label: 'Zeroflow', class: 'zeroflow-mask'},
    dry: {label: 'Dry', class: 'dry-mask'},
    ssn: {label: 'Seasonal', class: 'seasonal-mask'},
    pr: {label: 'Partial Record', class: 'partial-mask'},
    rat: {label: 'Rating Development', class: 'rating-development-mask'},
    eqp: {label: 'Equipment Malfunction', class: 'equipment-malfunction-mask'},
    mnt: {label: 'Maintenance', class: 'maintenance-mask'},
    dis: {label: 'Discontinued', class: 'discontinued-mask'},
    tst: {label: 'Test', class: 'test-mask'},
    pmp: {label: 'Pump', class: 'pump-mask'},
    '***': {label: 'Unavailable', class: 'unavailable-mask'}
};

const APPROVAL_QUALIFIERS = {
    a: {label: 'Approved', class: 'approved'},
    e: {label: 'Estimated', class: 'estimated'}
};

export const HASH_ID = {
    primary: 'hash-45',
    compare: 'hash-135'
};

// Lines will be split if the difference exceeds 72 minutes.
export const SEVENTY_TWO_MINUTES = 60 * 1000 * 72;

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
 * Returns a selector function that returns an Object with methodIDs as keys, Each property is
 * an Array of Objects that can be used to visualize the
 * IV data.
 * Each object has the following properties:
 *      @prop {Number} value
 *      @prop {Number} dateTime - in epoch milliseconds
 *      @prop {Boolean} isMasked
 *      @prop {String} label - human readable label
 *      @prop {String} class - can be used to style the data
 * Note that some parameter codes accumulate data across the time range. For those
 * parameter codes the values are adjusted so that they accumulate
 */
export const getIVDataPoints = memoize(dataKind => createSelector(
    getIVData(dataKind),
    (ivData) => {
        if (!ivData) {
            return null;
        }
        if (PARM_CODES_TO_ACCUMULATE.includes(ivData.parameter.parameterCode)) {
            Object.keys(ivData.values).forEach(methodID => {
                ivData[methodID].points = transformToCumulative(ivData[methodID].points);
            });
        }
        return Object.values(ivData.values).reduce((byMethodID, methodValues) => {
            byMethodID[methodValues.method.methodID] = methodValues.points.map(point => {
                // We will only receive one masked qualifier
                let label;
                let pointClass;
                const pointQualifiers = point.qualifiers.map(qualifier => qualifier.toLowerCase());
                const maskedQualifier = pointQualifiers.find(qualifier => qualifier in MASKED_QUALIFIERS);
                const approvalQualifier = pointQualifiers.find(qualifier => qualifier in APPROVAL_QUALIFIERS);
                if (maskedQualifier) {
                    label = MASKED_QUALIFIERS[maskedQualifier].label;
                    pointClass = MASKED_QUALIFIERS[maskedQualifier].class;
                } else if (approvalQualifier) {
                    label = APPROVAL_QUALIFIERS[approvalQualifier].label;
                    pointClass = APPROVAL_QUALIFIERS[approvalQualifier].class;
                } else { //default to provisional
                    label = 'Provisional';
                    pointClass = 'provisional';
                }
                return {
                    value: point.value,
                    dateTime: point.dateTime,
                    isMasked: !!maskedQualifier,
                    maskedQualifier: maskedQualifier,
                    approvalQualifier: approvalQualifier,
                    label: label,
                    class: pointClass
                };
            });

            return byMethodID;
        }, {});
    }
));

export const getIVTableData = memoize(dataKind => createSelector(
    getIVDataPoints(dataKind),
    getPrimaryParameter,
    getSelectedIVMethodID,
    (ivData, parameter, selectedMethodID) => {
        if (!ivData || !(selectedMethodID in ivData)) {
            return [];
        }
        return ivData[selectedMethodID].map(point => {
            return {
                parameterName: parameter.name,
                result: point.value,
                dateTime: DateTime.fromMillis(point.dateTime).toISO({zone: config.locationTimeZone}),
                approvals: point.approvalQualifier ? APPROVAL_QUALIFIERS[point.approvalQualifier].label : 'Provisional',
                masks: point.isMasked ? MASKED_QUALIFIERS[point.maskedQualifier].label : ''
            };
        });
    }
));

/*
 * @return Keys are ts Ids, values are  of array of objects. Each object has four properties and
 * represents a segment
 *      @prop {Boolean} isMasked
 *      @prop {Array of Object} points - Each point has {Number} value and {Number in milliseconds} dateTime
 *      @prop {String} label
 *      @prop {String} class
 * A new segment is started when there is a change from masked to non-masked (or vice versa),
 * if a segment has a different label, or if two line segments are separated by more than two days.
 * The returned segments represent the currently selected time series
 */
export const getIVDataSegments = memoize(dataKind => createSelector(
    getIVDataPoints(dataKind),
    (pointsByMethodID) => {
        if (!pointsByMethodID) {
            return null;
        }
        const getNewSegment = function(point) {
            return {
                ...point,
                points: []
            };
        };

        let segmentsByMethodID = {};
        Object.keys(pointsByMethodID).forEach((methodID) => {
            const pointsForMethod = pointsByMethodID[methodID];
            if (!pointsForMethod.length) {
                segmentsByMethodID[methodID]= [];
                return;
            }
            let segments = [];
            let previousDate = pointsForMethod[0].dateTime;
            let newSegment = getNewSegment(pointsForMethod[0]);

            pointsForMethod.forEach(point => {
                const hasGap = point.dateTime - previousDate >= SEVENTY_TWO_MINUTES;
                const pointLabelHasChanged = newSegment.label !== point.label;

                if (!newSegment.isMasked && !point.isMasked && hasGap) {
                    // there is a gap between two line segments so start a new segment
                    segments.push(newSegment);
                    newSegment = getNewSegment(point);

                } else if (newSegment.isMasked && pointLabelHasChanged) {
                    // end previous masked segment where the next segment starts
                    newSegment.points.push({
                        value: point.value,
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
                    value: point.value,
                    dateTime: point.dateTime
                });
                previousDate = point.dateTime;
            });
            segments.push(newSegment);
            segmentsByMethodID[methodID] = segments;
        });
        return segmentsByMethodID;
    }
));

/*
 * Return a selector function that returns an
 * Array of Objects. The array represents the unique kinds of
 * data that are being currently displayed. Each Object has the following properties:
 *      @prop {Boolean} isMasked
 *      @prop {String} label
 *      @prop {String} class
 */

export const getIVUniqueDataKinds = memoize(dataKind => createSelector(
    getIVDataSegments(dataKind),
    byMethodSegments => {
        if (!byMethodSegments) {
            return [];
        }
        let allSegments = [];
        Object.values(byMethodSegments).forEach(segments => {
            allSegments.push(...segments);
        });
        const mappedSegments = allSegments.map(segment => {
            return {
                isMasked: segment.isMasked,
                label: segment.label,
                class: segment.class
            };
        });
        return uniqWith(mappedSegments, isEqual);
    }
));
