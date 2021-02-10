import {createSelector} from 'reselect';

import {defineLineMarker, defineRectangleMarker, defineTextOnlyMarker} from 'd3render/markers';

import {getWaterwatchFloodLevels, isWaterwatchVisible} from 'ml/selectors/flood-data-selector';
//import {getCurrentVariableMedianMetadata} from 'ml/selectors/median-statistics-selector';

import {getGroundwaterLevelsMarker} from '../discrete-data';

import {getIVUniqueDataKinds, HASH_ID} from './iv-data';
import {anyVisibleGroundwaterLevels} from './discrete-data';

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
    (state) => state.ivTimeSeriesState.showIVTimeSeries,
    () => null, //getCurrentVariableMedianMetadata,
    getIVUniqueDataKinds('primary'),
    getIVUniqueDataKinds('compare'),
    isWaterwatchVisible,
    getWaterwatchFloodLevels,
    anyVisibleGroundwaterLevels,
    (showSeries, medianSeries, currentClasses, compareClasses, showWaterWatch, floodLevels, showGroundWaterLevels) => {
        return {
            primaryIV: showSeries.current ? currentClasses : undefined,
            compareIV: showSeries.compare ? compareClasses : undefined,
            median: showSeries.median ? medianSeries : undefined,
            floodLevels: showWaterWatch ? floodLevels : undefined,
            groundwaterLevels: showGroundWaterLevels
        };
    }
);

const getIVMarkers = function(dataKind, uniqueIVKinds) {
    let maskMarkers = [];
    let lineMarkers = [];
    const textMarker = defineTextOnlyMarker(TS_LABEL[dataKind]);
    uniqueIVKinds.forEach(ivKind => {
        if (ivKind.isMasked) {
            maskMarkers.push(defineRectangleMarker(null, `mask ${ivKind.class}`, ivKind.label, `url(#${HASH_ID[dataKind]})`));
        } else {
            return lineMarkers.push(defineLineMarker(null, `line-segment ${ivKind.class} ts-${dataKind}`, ivKind.label));
        }
    });
    return [textMarker, ...lineMarkers, ...maskMarkers];
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

const getFloodLevelMarkers = function(floodLevels) {
    const FLOOD_LEVEL_DISPLAY = {
        actionStage: {
            label: 'Action Stage',
            class: 'action-stage'
        },
        floodStage: {
            label: 'Flood Stage',
            class: 'flood-stage'
        },
        moderateFloodStage: {
            label: 'Moderate Flood Stage',
            class: 'moderate-flood-stage'
        },
        majorFloodStage: {
            label: 'Major Flood Stage',
            class: 'major-flood-stage'
        }
    };
    return Object.keys(floodLevels).map((stage) => {
        return [
            defineTextOnlyMarker(FLOOD_LEVEL_DISPLAY[stage].label),
            defineLineMarker(
                null,
                `waterwatch-data-series ${FLOOD_LEVEL_DISPLAY[stage].class}`,
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
        let currentTsMarkerRow = displayItems.primaryIV ? getIVMarkers('primary', displayItems.primaryIV) : undefined;
        const compareTsMarkerRow = displayItems.compareIV ? getIVMarkers('compare', displayItems.compareIV) : undefined;
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
