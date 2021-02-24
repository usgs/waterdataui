import memoize from 'fast-memoize';
import {createSelector} from 'reselect';

import {defineLineMarker, defineRectangleMarker, defineTextOnlyMarker} from 'd3render/markers';

import {getWaterwatchFloodLevels, isWaterwatchVisible} from 'ml/selectors/flood-data-selector';
import {getCurrentVariableMedianMetadata} from 'ml/selectors/median-statistics-selector';

import {getGroundwaterLevelsMarkers} from '../discrete-data';

import {getCurrentVariableLineSegments, HASH_ID, MASK_DESC} from './drawing-data';

import {getVisibleGroundwaterLevelsTableData} from './discrete-data';


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
 *      @prop floodLevels {Object} - The flood level descriptions
 *      @prop groundwaterPoints {Object} - Data describing the groundwater point currently visible on hydrograph
 */
const getLegendDisplay = createSelector(
    (state) => state.ivTimeSeriesState.showIVTimeSeries,
    getCurrentVariableMedianMetadata,
    getUniqueClasses('current'),
    getUniqueClasses('compare'),
    isWaterwatchVisible,
    getWaterwatchFloodLevels,
    getVisibleGroundwaterLevelsTableData,
    (showSeries, medianSeries, currentClasses, compareClasses, showWaterWatch, floodLevels, groundwaterPoints) => {
        return {
            current: showSeries.current ? currentClasses : undefined,
            compare: showSeries.compare ? compareClasses : undefined,
            median: showSeries.median ? medianSeries : undefined,
            floodLevels: showWaterWatch ? floodLevels : undefined,
            groundwaterPoints: groundwaterPoints.length !== 0 ? groundwaterPoints : undefined
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

/*
* Helper function that returns the class and description of active flood levels
* @prop {Object} floodLevels - The list of all possible flood levels
* @return {Object} A grouping of only the active flood levels for that location
*/
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

/*
* Function that returns a group of flood levels for display on the legend
* @prop {Object} floodLevels - The list of all possible flood levels
* @return {Object} The text label and information on the class so the line in the legend will have the correct styles
*/
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
* Function that finds out if the points visible on the graph contain 'approved' data.
* @prop {Object} groundwaterPoints - data about the points currently visible on hydrograph
* @ return {Object} Grouping of Boolean values indicating whether or not the data is approved/provisional
 */
const getGroundwaterApprovals = function(groundwaterPoints) {
    const groundwaterApprovals = {
        provisional: false,
        approved: false
    };

    Object.keys(groundwaterPoints).forEach(key => {
        if(Object.values(groundwaterPoints[key]).includes('Approved') ||
            Object.values(groundwaterPoints[key]).includes('Revised')) {
            groundwaterApprovals.approved = true;
        } else {
            groundwaterApprovals.provisional = true;
        }
    });

    return groundwaterApprovals;
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

        if (currentTsMarkerRow) {
            markerRows.push(currentTsMarkerRow);
        }
        if (compareTsMarkerRow) {
            markerRows.push(compareTsMarkerRow);
        }
        if (displayItems.groundwaterPoints) {
            const gwLevelMarker = getGroundwaterLevelsMarkers(getGroundwaterApprovals(displayItems.groundwaterPoints));
            markerRows.push(gwLevelMarker);
        }
        markerRows.push(...medianMarkerRows, ...floodMarkerRows);

        return markerRows;
    }
);
