import {createSelector} from 'reselect';

import {defineLineMarker, defineRectangleMarker, defineTextOnlyMarker} from '../../../d3-rendering/markers';

import {getCurrentUniqueDataKinds} from './time-series-data';

const TS_LABEL = {
    min: 'Minimum:',
    mean: 'Mean:',
    max: 'Maximum:'
};

/*
 * Factory function that returns  array of markers to be used for the
 * DV time series graph legend
 * @return {Function} which returns {an Array (representing a row) of Array of Object}, where the objects are markers (see d3-rendering/markers.js).
 */
export const getLegendMarkers = createSelector(
    getCurrentUniqueDataKinds,
    (dataKinds) => {
        const getTsMarkers = function(tsKey, dataKinds) {
            const lineKinds = dataKinds.filter(kind => !kind.isMasked).sort((a, b) => a.label > b.label ? 1 : -1);
            const maskKinds = dataKinds.filter(kind => kind.isMasked);
            return [defineTextOnlyMarker(TS_LABEL[tsKey])].concat(
                lineKinds.map(dataKind => defineLineMarker(null, `line-segment ${dataKind.class} ${tsKey}`, dataKind.label)),
                maskKinds.map(dataKind =>
                    defineRectangleMarker(null, `mask ${dataKind.class}`, dataKind.label, `url(#dv-${tsKey}-masked-pattern)`))
                );
        };

        const result = [];
        if (dataKinds.min.length) {
            result.push(getTsMarkers('min', dataKinds.min));
        }
        if (dataKinds.mean.length) {
            result.push(getTsMarkers('mean', dataKinds.mean));
        }
        if (dataKinds.max.length) {
            result.push(getTsMarkers('max', dataKinds.max));
        }
        return result;
    }
);