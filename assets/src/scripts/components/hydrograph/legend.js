// functions to facilitate legend creation for a d3 plot
import {set} from 'd3-collection';
import memoize from 'fast-memoize';
import {createSelector, createStructuredSelector} from 'reselect';

import {drawSimpleLegend} from '../../d3-rendering/legend';
import {defineLineMarker, defineTextOnlyMarker, defineRectangleMarker} from '../../d3-rendering/markers';
import {link} from '../../lib/d3-redux';
import {getCurrentVariableMedianMetadata} from '../../selectors/median-statistics-selector';
import {getWaterwatchFloodLevels, waterwatchVisible} from '../../selectors/flood-data-selector';

import {currentVariableLineSegmentsSelector, HASH_ID, MASK_DESC} from './drawing-data';
import {getMainLayout} from './layout';


const TS_LABEL = {
    'current': 'Current: ',
    'compare': 'Last year: ',
    'median': 'Median: '
};


const tsMaskMarkers = function(tsKey, masks) {
    return Array.from(masks.values()).map((mask) => {
        const maskName = MASK_DESC[mask];
        const tsClass = `${maskName.replace(' ', '-').toLowerCase()}-mask`;
        const fill = `url(#${HASH_ID[tsKey]})`;
        return defineRectangleMarker(null, `mask ${tsClass}`, maskName, fill);
    });
};

const tsLineMarkers = function(tsKey, lineClasses) {
    let result = [];

    if (lineClasses.default) {
        result.push(defineLineMarker(null, `line-segment ts-${tsKey}`, 'Provisional'));
    }
    if (lineClasses.approved) {
        result.push(defineLineMarker(null, `line-segment approved ts-${tsKey}`, 'Approved'));
    }
    if (lineClasses.estimated) {
        result.push(defineLineMarker(null, `line-segment estimated ts-${tsKey}`, 'Estimated'));
    }
    return result;
};

/**
 * create elements for the legend in the svg
 *
 * @param {Object} displayItems - Object containing keys for each ts. The current and compare will contain an
 *                 object that has a masks property containing the Set of masks that are currently displayed.
 *                 The median property will contain the metadata for the median statistics
 * @return {Object} - Each key represents a ts and contains an array of markers to show.
 */
const createLegendMarkers = function(displayItems) {
    const legendMarkers = [];

    if (displayItems.current) {
        const currentMarkers = [
            ...tsLineMarkers('current', displayItems.current),
            ...tsMaskMarkers('current', displayItems.current.dataMasks)
        ];
        if (currentMarkers.length) {
            legendMarkers.push([
                defineTextOnlyMarker(TS_LABEL.current, null, 'ts-legend-current-text'),
                ...currentMarkers
            ]);
        }
    }
    if (displayItems.compare) {
        const compareMarkers = [
            ...tsLineMarkers('compare', displayItems.compare),
            ...tsMaskMarkers('compare', displayItems.compare.dataMasks)
        ];
        if (compareMarkers.length) {
            legendMarkers.push([
                defineTextOnlyMarker(TS_LABEL.compare, null, 'ts-legend-compare-text'),
                ...compareMarkers
            ]);
        }
    }

    if (displayItems.median) {
        const medians = Object.values(displayItems.median);
        for (let index = 0; index < medians.length; index++) {
            const stats = medians[index];
            // Get the unique non-null years, in chronological order
            const years = [];
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

            legendMarkers.push([
                defineTextOnlyMarker(TS_LABEL.median),
                defineLineMarker(null, classes, label)]);
        }
    }

    if (displayItems.floodLevels) {
        const floodLevels = displayItems.floodLevels;
        const keys = ['actionStage', 'floodStage', 'moderateFloodStage', 'mjaorFloodStage'];
        const labels = ['Action Stage: ', 'Flood Stage: ', 'Moderate Flood Stage: ', 'Major Flood Stage: '];
        const wwSeriesClass = 'waterwatch-data-series';
        const classes = ['action-stage', 'flood-stage', 'moderate-flood-stage', 'major-flood-stage'];

        for (let index = 0; index < keys.length; index++) {
            legendMarkers.push([
                defineTextOnlyMarker(labels[index]),
                defineLineMarker(null, `${wwSeriesClass} ${classes[index]}`,
                    `${floodLevels[keys[index]]} ft`)]);
        }
    }

    return legendMarkers;
};


const uniqueClassesSelector = memoize(tsKey => createSelector(
    currentVariableLineSegmentsSelector(tsKey),
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
 * Select attributes from the state useful for legend creation
 */
const legendDisplaySelector = createSelector(
    (state) => state.ivTimeSeriesState.showIVTimeSeries,
    getCurrentVariableMedianMetadata,
    uniqueClassesSelector('current'),
    uniqueClassesSelector('compare'),
    waterwatchVisible,
    getWaterwatchFloodLevels,
    (showSeries, medianSeries, currentClasses, compareClasses, visible, floodLevels) => {
        return {
            current: showSeries.current ? currentClasses : undefined,
            compare: showSeries.compare ? compareClasses : undefined,
            median: showSeries.median ? medianSeries : undefined,
            floodLevels: visible ? floodLevels : undefined
        };
    }
);


/*
 * Factory function  that returns an array of array of markers to be used for the
 * time series graph legend
 * @return {Array of Array} of markers
 */
export const legendMarkerRowsSelector = createSelector(
    legendDisplaySelector,
    displayItems => createLegendMarkers(displayItems)
);


export const drawTimeSeriesLegend = function(elem, store) {
    elem.append('div')
        .classed('hydrograph-container', true)
        .call(link(store, drawSimpleLegend, createStructuredSelector({
            legendMarkerRows: legendMarkerRowsSelector,
            layout: getMainLayout
        })));
};

