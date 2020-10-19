import {set} from 'd3-collection';
import memoize from 'fast-memoize';
import {createSelector} from 'reselect';

import {defineLineMarker, defineRectangleMarker, defineTextOnlyMarker} from 'd3render/markers';

import {getWaterwatchFloodLevels, isWaterwatchVisible} from 'ml/selectors/flood-data-selector';
import {getCurrentVariableMedianMetadata} from 'ml/selectors/median-statistics-selector';

import {getCurrentVariableLineSegments, HASH_ID, MASK_DESC} from 'ivhydrograph/selectors/drawing-data';

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
 *      @prop {D3 set} dataMask
 */
const getUniqueClasses = memoize(tsKey => createSelector(
    getCurrentVariableLineSegments(tsKey),
    (tsLineSegments) => {
        let classes = [].concat(...Object.values(tsLineSegments)).map((line) => line.classes);
        return {
            default: classes.some((cls) => !cls.approved && !cls.estimated && !cls.dataMask),
            approved: classes.some((cls) => cls.approved),
            estimated: classes.some((cls) => cls.estimated),
            dataMasks: set(classes.map((cls) => cls.dataMask).filter((mask) => {
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
    (showSeries, medianSeries, currentClasses, compareClasses, showWaterWatch, floodLevels) => {
        return {
            current: showSeries.current ? currentClasses : undefined,
            compare: showSeries.compare ? compareClasses : undefined,
            median: showSeries.median ? medianSeries : undefined,
            floodLevels: showWaterWatch ? floodLevels : undefined
        };
    }
);

const getTsMarkers = function(tsKey, uniqueClasses) {
    let tsMarkers;
    const maskMarkers = uniqueClasses.dataMasks.values().map((mask) => {
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
        const currentTsMarkerRow = displayItems.current ? getTsMarkers('current', displayItems.current) : undefined;
        const compareTsMarkerRow = displayItems.compare ? getTsMarkers('compare', displayItems.compare) : undefined;
        const medianMarkerRows = displayItems.median ? getMedianMarkers(displayItems.median) : [];
        const floodMarkerRows = displayItems.floodLevels ? getFloodLevelMarkers(displayItems.floodLevels) : [];

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
