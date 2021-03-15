import {createSelector} from 'reselect';

import config from 'ui/config';

import {defineLineMarker, defineRectangleMarker, defineCircleMarker, defineTextOnlyMarker} from 'd3render/markers';

import {isWaterwatchVisible} from 'ml/selectors/flood-data-selector';
import {getPrimaryMedianStatisticsData, getPrimaryParameter} from 'ml/selectors/hydrograph-data-selector';
import {isCompareIVDataVisible, isMedianDataVisible} from 'ml/selectors/hydrograph-state-selector';

import {getUniqueGWKinds} from './discrete-data';
import {getFloodLevelData} from './flood-level-data';
import {getIVUniqueDataKinds, HASH_ID} from './iv-data';

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
    getFloodLevelData,
    getUniqueGWKinds,
    getPrimaryParameter,
    (showCompare, showMedian, medianSeries, currentClasses, compareClasses, showWaterWatch, floodLevels, gwLevelKinds,
     primaryParameter) => {
        const parameterCode = primaryParameter ? primaryParameter.parameterCode : null;
        const hasIVData = config.ivPeriodOfRecord && parameterCode ? parameterCode in config.ivPeriodOfRecord : false;
        const hasGWLevelsData = config.gwPeriodOfRecord && parameterCode ? parameterCode in config.gwPeriodOfRecord : false;
        return {
            primaryIV: hasIVData ? currentClasses : undefined,
            compareIV: hasIVData && showCompare ? compareClasses : undefined,
            median: showMedian ? medianSeries : undefined,
            floodLevels: showWaterWatch ? floodLevels : undefined,
            groundwaterLevels: hasGWLevelsData ? gwLevelKinds : undefined
        };
    }
);

const getIVMarkers = function(dataKind, uniqueIVKinds) {
    if (!uniqueIVKinds) {
        return [];
    } else if (uniqueIVKinds.length) {
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
    } else {
        return [defineTextOnlyMarker('No data')];
    }
};

/*
 * @param {Object} medianMetaData
 * @return {Array of Array} - each subarray represents the markes for a time series median data
 */
const getMedianMarkers = function(medianMetaData) {
    if (!medianMetaData) {
        return [];
    } else if (!Object.keys(medianMetaData).length) {
        return [[defineTextOnlyMarker(TS_LABEL.median), defineTextOnlyMarker('No data')]];
    } else {
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
    }
};

const getGWMarkers = function(gwLevelKinds) {
    if (!gwLevelKinds) {
        return [];
    } else if (gwLevelKinds.length) {
        return gwLevelKinds.map(kind => {
            return defineCircleMarker(null, kind.classes.join(' '), kind.radius, kind.label);
        });
    } else {
        return [defineTextOnlyMarker('No data')];
    }
};

const getFloodLevelMarkers = function(floodLevels) {
    return floodLevels.map((level) => {
        return [
            defineTextOnlyMarker(level.label),
            defineLineMarker(
                null,
                `waterwatch-data-series ${level.class}`,
                `${level.value} ft`)
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
