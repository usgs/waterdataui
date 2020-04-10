import includes from 'lodash/includes';
import {createSelector} from 'reselect';

import {defineLineMarker} from '../../../d3-rendering/markers';

import {getCurrentTimeSeriesLineSegments, APPROVED, ESTIMATED} from './time-series-data';


const tsLineMarkers = function(lineClasses) {
    let result = [];

    if (lineClasses.default) {
        result.push(defineLineMarker(null, 'line-segment ts-dv', 'Provisional'));
    }
    if (lineClasses.approved) {
        result.push(defineLineMarker(null, 'line-segment approved ts-dv', 'Approved'));
    }
    if (lineClasses.estimated) {
        result.push(defineLineMarker(null, 'line-segment estimated ts-dv', 'Estimated'));
    }
    return result;
};


/**
 * create elements for the legend in the svg
 *
 * @param {Object} displayItems - Object containing Object containing default, estimated and approved properties.
 * @return {Array} - Returns an array of markers.
 */
const createLegendMarkers = function(displayItems) {
    const legendMarkers = [];

    if (displayItems) {
        const currentMarkers = [
            ...tsLineMarkers(displayItems)
        ];
        if (currentMarkers.length) {
            legendMarkers.push([
                ...currentMarkers
            ]);
        }
    }
    return legendMarkers;
};

const getUniqueClasses = createSelector(
    getCurrentTimeSeriesLineSegments,
    (tsLineSegments) => {
        let result = {
            default: false,
            approved: false,
            estimated: false
        };
        //TODO: default is for any approvals that are not Approved or Estimated. This will likely need to change.
        tsLineSegments.forEach((segment) => {
            result.approved = result.approved || includes(segment.approvals, APPROVED);
            result.estimated = result.estimated || includes(segment.approvals, ESTIMATED);
            result.default =
                result.default || !includes(segment.approvals, APPROVED) && !includes(segment.approvals, ESTIMATED);
        });
        return result;
    }
);

/*
 * Factory function that returns an array of array of markers to be used for the
 * time series graph legend
 * @return {Array of Array} of markers
 */
export const getLegendMarkerRows = createSelector(
    getUniqueClasses,
    displayItems => {
        return createLegendMarkers(displayItems);
    }
);