import {createSelector} from 'reselect';

import {defineLineMarker, defineRectangleMarker} from '../../../d3-rendering/markers';

import {getCurrentUniqueDataKinds} from './time-series-data';

/*
 * Factory function that returns  array of markers to be used for the
 * DV time series graph legend
 * @return {Array of Object} - where the objects are markers (see d3-rendering/markers.js).
 */
export const getLegendMarkers = createSelector(
    getCurrentUniqueDataKinds,
    (dataKinds) => {
        return dataKinds.map((dataKind) => {
            return dataKind.isMasked ?
                defineRectangleMarker(null, `mask ${dataKind.class}`, dataKind.label, 'url(#dv-masked-pattern)') :
                defineLineMarker(null, `line-segment ${dataKind.class}`, dataKind.label);
        });
    }
);