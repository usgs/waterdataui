import memoize from 'fast-memoize';
import {createSelector} from 'reselect';

import {defineLineMarker, defineRectangleMarker, defineTextOnlyMarker} from 'd3render/markers';

import {getWaterwatchFloodLevels, isWaterwatchVisible} from 'ml/selectors/flood-data-selector';
import {getCurrentVariableMedianMetadata} from 'ml/selectors/median-statistics-selector';

import {getGroundwaterLevelsMarker} from '../discrete-data';

import {getCurrentVariableLineSegments, HASH_ID, MASK_DESC} from './drawing-data';
import {anyVisibleGroundwaterLevels} from './discrete-data';

const TS_LABEL = {
    'current': 'Current: ',
    'compare': 'Last year: ',
    'median': 'Median: '
};

/*
 * Returns a Redux Selector function which returns an Object that represents the unique
 * classes that are visible for the tsKey
 *      @prop {Boolean} default
 *      @prop {Boolean} approved
 *      @prop {Boolean} estimated
 *      @prop {Set} dataMasks
 */
const getUniqueClasses = memoize(tsKey => createSelector(
    getCurrentVariableLineSegments(tsKey),
    (tsLineSegments) => {
        let classes = [].concat(...Object.values(tsLineSegments)).map((line) => line.classes);
        return {
            default: classes.some((cls) => !cls.approved && !cls.estimated && !cls.dataMask),
            approved: classes.some((cls) => cls.approved),
            estimated: classes.some((cls) => cls.estimated),
            dataMasks: new Set(classes.map((cls) => cls.dataMask).filter((mask) => {
                return mask;
            }))
        };
    }
));

/**
 * Returns a Redux selector function that returns an object of attributes to be used
 * to generate the legend markers. The properties will be undefined if not visible
 *      @prop current {Object} - see getUniqueClasses
 *      @prop compare {Object} - see getUniqueClasses
 *      @prop median {Object} - median meta data - each property represents a time series for the current parameter code
 *      @prop floodLevels {Object} -
 */
const getLegendDisplay = createSelector(
    (state) => state.ivTimeSeriesState.showIVTimeSeries,
    getCurrentVariableMedianMetadata,
    getUniqueClasses('current'),
    getUniqueClasses('compare'),
    isWaterwatchVisible,
    getWaterwatchFloodLevels,
    anyVisibleGroundwaterLevels,
    (showSeries, medianSeries, currentClasses, compareClasses, showWaterWatch, floodLevels, showGroundWaterLevels) => {
        return {
            current: showSeries.current ? currentClasses : undefined,
            compare: showSeries.compare ? compareClasses : undefined,
            median: showSeries.median ? medianSeries : undefined,
            floodLevels: showWaterWatch ? floodLevels : undefined,
            groundwaterLevels: showGroundWaterLevels
        };
    }
);

const getTsMarkers = function(tsKey, uniqueClasses) {
    let tsMarkers;
    const maskMarkers = Array.from(uniqueClasses.dataMasks.values()).map((mask) => {
        const maskName = MASK_DESC[mask];
        const tsClass = `${maskName.replace(' ', '-').toLowerCase()}-mask`;
        const fill = `url(#${HASH_ID[tsKey]})`;
        return defineRectangleMarker(null, `mask ${tsClass}`, maskName, fill);
    });

    let lineMarkers = [];
    if (uniqueClasses.default) {
        lineMarkers.push(defineLineMarker(null, `line-segment ts-${tsKey}`, 'Provisional'));
    }
    if (uniqueClasses.approved) {
        lineMarkers.push(defineLineMarker(null, `line-segment approved ts-${tsKey}`, 'Approved'));
    }
    if (uniqueClasses.estimated) {
        lineMarkers.push(defineLineMarker(null, `line-segment estimated ts-${tsKey}`, 'Estimated'));
    }

    if (lineMarkers.length || maskMarkers.length) {
        tsMarkers = [defineTextOnlyMarker(TS_LABEL[tsKey]), ...lineMarkers, ...maskMarkers];
    }
    return tsMarkers;
};

/*
 * @param {Object} medianMetData
 * @return {Array of Array} - each subarray rpresents the markes for a time series median data
 */
const getMedianMarkers = function(medianMetaData) {
    return Object.values(medianMetaData).map((stats, index) => {
        // Get the unique non-null years, in chronological order
        let years = [];
        if (stats.beginYear) {
            years.push(stats.beginYear);
        }
        if (stats.endYear && stats.beginYear !== stats.endYear) {
            years.push(stats.endYear);
        }
        const dateText = years.join(' - ');

        const descriptionText = stats.methodDescription ? `${stats.methodDescription} ` : '';
        const classes = `median-data-series median-step median-step-${index % 6}`;
        const label = `${descriptionText}${dateText}`;

        return [defineTextOnlyMarker(TS_LABEL.median), defineLineMarker(null, classes, label)];
    });
};

const floodLevelDisplay = function(floodLevels) {
    let floodLevelsForDisplay = {};
    Object.keys(floodLevels).forEach(key => {
        if (!isNaN(floodLevels[key])) {
            const label = key.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1);

            Object.assign(floodLevelsForDisplay,
                {[key]: {
                    'label': [label.join(' ')],
                    'class': [label.join('-').toLowerCase()]
                }}
            );
        }
    });

    return floodLevelsForDisplay;
};

const getFloodLevelMarkers = function(floodLevels) {
    const floodLevelsForDisplay = floodLevelDisplay(floodLevels);

    return Object.keys(floodLevelsForDisplay).map((stage) => {
        return [
            defineTextOnlyMarker(floodLevelsForDisplay[stage].label),
            defineLineMarker(
                null,
                `waterwatch-data-series ${floodLevelsForDisplay[stage].class}`,
                `${floodLevels[stage]} ft`)
        ];
    });
};




/*
 * Factory function  that returns an array of array of markers to be used for the
 * time series graph legend
 * @return {Array of Array} of markers - each sub array represents an row of markers
 */
export const getLegendMarkerRows = createSelector(
    getLegendDisplay,
    (displayItems) => {
        const markerRows = [];
        let currentTsMarkerRow = displayItems.current ? getTsMarkers('current', displayItems.current) : undefined;
        const compareTsMarkerRow = displayItems.compare ? getTsMarkers('compare', displayItems.compare) : undefined;
        const medianMarkerRows = displayItems.median ? getMedianMarkers(displayItems.median) : [];
        const floodMarkerRows = displayItems.floodLevels ? getFloodLevelMarkers(displayItems.floodLevels) : [];
        /* Add groundwater marker to current row */
        if (displayItems.groundwaterLevels) {
            const gwLevelMarker = getGroundwaterLevelsMarker();
            if (currentTsMarkerRow) {
                currentTsMarkerRow.push(gwLevelMarker);
            } else {
                currentTsMarkerRow = [gwLevelMarker];
            }
        }
        if (currentTsMarkerRow) {
            markerRows.push(currentTsMarkerRow);
        }
        if (compareTsMarkerRow) {
            markerRows.push(compareTsMarkerRow);
        }
        markerRows.push(...medianMarkerRows, ...floodMarkerRows);
        return markerRows;
    }
);
