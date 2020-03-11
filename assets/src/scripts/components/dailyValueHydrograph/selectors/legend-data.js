import {createSelector} from 'reselect';
import {getCurrentTimeSeriesLineSegments} from './time-series-data';
import {defineLineMarker, defineTextOnlyMarker} from '../../../d3-rendering/markers';


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
                defineTextOnlyMarker('', null, 'ts-legend-current-text'),
                ...currentMarkers
            ]);
        }
    }
    return legendMarkers;
};


export const getUniqueClasses = createSelector(
    getCurrentTimeSeriesLineSegments,
    (tsLineSegments) => {
        let result = {
            default: false,
            approved: false,
            estimated: false
        };
        tsLineSegments.forEach((segment) => {
            result.approved = result.approved || segment.approvals.includes('Approved');
            result.estimated = result.estimated || segment.approvals.includes('Estimated');
            result.default = result.default || segment.approvals.length === 0;
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