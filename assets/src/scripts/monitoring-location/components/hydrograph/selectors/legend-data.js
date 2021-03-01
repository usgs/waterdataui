import {createSelector} from 'reselect';

import {defineLineMarker, defineRectangleMarker, defineCircleMarker, defineTextOnlyMarker} from 'd3render/markers';

import {getWaterwatchFloodLevels, isWaterwatchVisible} from 'ml/selectors/flood-data-selector';
import {getPrimaryMedianStatisticsData} from 'ml/selectors/hydrograph-data-selector';
import {isCompareIVDataVisible, isMedianDataVisible} from 'ml/selectors/hydrograph-state-selector';

import {getIVUniqueDataKinds, HASH_ID} from './iv-data';
import {getUniqueGWKinds} from './discrete-data';

const TS_LABEL = {
    'primary': 'Current: ',
    'compare': 'Last year: ',
    'median': 'Median: '
};

/**
 * Returns a Redux selector function that returns an object of attributes to be used
 * to generate the legend markers. The properties will be undefined if not visible
 *      @prop current {Object} - see getUniqueClasses
 *      @prop compare {Object} - see getUniqueClasses
 *      @prop median {Object} - median meta data - each property represents a time series for the current parameter code
 *      @prop floodLevels {Object} -
 */
const getLegendDisplay = createSelector(
    isCompareIVDataVisible,
    isMedianDataVisible,
    getPrimaryMedianStatisticsData,
    getIVUniqueDataKinds('primary'),
    getIVUniqueDataKinds('compare'),
    isWaterwatchVisible,
    getWaterwatchFloodLevels,
    getUniqueGWKinds,
    (showCompare, showMedian, medianSeries, currentClasses, compareClasses, showWaterWatch, floodLevels, gwLevelKinds) => {
        return {
            primaryIV: currentClasses.length ? currentClasses : undefined,
            compareIV: showCompare && compareClasses.length ? compareClasses : undefined,
            median: showMedian ? medianSeries : undefined,
            floodLevels: showWaterWatch ? floodLevels : undefined,
            groundwaterLevels: gwLevelKinds.length ? gwLevelKinds : undefined
        };
    }
);

const getIVMarkers = function(dataKind, uniqueIVKinds) {
    let maskMarkers = [];
    let lineMarkers = [];
    uniqueIVKinds.forEach(ivKind => {
        if (ivKind.isMasked) {
            maskMarkers.push(defineRectangleMarker(null, `mask ${ivKind.class}`, ivKind.label, `url(#${HASH_ID[dataKind]})`));
        } else {
            return lineMarkers.push(defineLineMarker(null, `line-segment ${ivKind.class} ts-${dataKind}`, ivKind.label));
        }
    });
    return [...lineMarkers, ...maskMarkers];
};

/*
 * @param {Object} medianMetaData
 * @return {Array of Array} - each subarray represents the markes for a time series median data
 */
const getMedianMarkers = function(medianMetaData) {
    if (!Object.keys(medianMetaData).length) {
        return [];
    }
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

        const descriptionText = stats.description ? `${stats.description} ` : '';
        const classes = `median-data-series median-step median-step-${index % 6}`;
        const label = `${descriptionText}${dateText}`;

        return [defineTextOnlyMarker(TS_LABEL.median), defineLineMarker(null, classes, label)];
    });
};

const getGWMarkers = function(gwLevelKinds) {
    return gwLevelKinds.map(kind => {
        return defineCircleMarker(null, kind.classes.join(' '), kind.radius, kind.label);
    });
};

const floodLevelDisplay = function(floodLevels) {
    let floodLevelsForDisplay = {};
    Object.keys(floodLevels).forEach(key => {
        if (floodLevels[key]) {
            const keyWithCapitalFirstLetter = `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
            // Format label by cutting the camel case word at upper case letters
            const label = keyWithCapitalFirstLetter.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1);

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
    displayItems => {
        const markerRows = [];

        const currentTsMarkerRow = displayItems.primaryIV ? getIVMarkers('primary', displayItems.primaryIV) : undefined;
        const compareTsMarkerRow = displayItems.compareIV ? getIVMarkers('compare', displayItems.compareIV) : undefined;
        const medianMarkerRows = displayItems.median ? getMedianMarkers(displayItems.median) : [];
        const floodMarkerRows = displayItems.floodLevels ? getFloodLevelMarkers(displayItems.floodLevels) : [];
        const gwLevelMarkerRows = displayItems.groundwaterLevels ? getGWMarkers(displayItems.groundwaterLevels) : undefined;

        if (currentTsMarkerRow) {
            markerRows.push([defineTextOnlyMarker(TS_LABEL['primary'])].concat(currentTsMarkerRow));
        }
        if (gwLevelMarkerRows) {
            markerRows.push([defineTextOnlyMarker('Field visit: ')].concat(gwLevelMarkerRows));
        }
        if (compareTsMarkerRow) {
            markerRows.push([defineTextOnlyMarker(TS_LABEL['compare'])].concat(compareTsMarkerRow));
        }
        markerRows.push(...medianMarkerRows, ...floodMarkerRows);
        return markerRows;
    }
);
