import {createSelector} from 'reselect';

import {defineLineMarker, defineRectangleMarker, defineTextOnlyMarker} from '../../../d3-rendering/markers';

import {getCurrentUniqueDataKinds} from './time-series-data';

const TS_LABEL = {
    min: 'Minimum',
    median: 'Median',
    max: 'Maximum'
};

/*
 * Factory function that returns  array of markers to be used for the
 * DV time series graph legend
 * @return {Function} which returns {an Array (representing a row) of Array of Object}, where the objects are markers (see d3-rendering/markers.js).
 */
export const getLegendMarkers = createSelector(
    getCurrentUniqueDataKinds,
    (dataKinds) => {
        const result = [];
        Object.keys(dataKinds).forEach((tsKey) => {
           if (dataKinds[tsKey].length) {
               const markers = dataKinds[tsKey].map((dataKind) => {
                   return dataKind.isMasked ?
                       defineRectangleMarker(null, `mask ${dataKind.class}`, dataKind.label, 'url(#dv-masked-pattern)') :
                       defineLineMarker(null, `line-segment ${dataKind.class}`, dataKind.label);
               });
               result.push([defineTextOnlyMarker(TS_LABEL[tsKey]), ...markers]);
           }
        });
        return result;
    }
);