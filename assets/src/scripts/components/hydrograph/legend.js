// functions to facilitate legend creation for a d3 plot
const memoize = require('fast-memoize');
const { createSelector } = require('reselect');

const { CIRCLE_RADIUS, MARGIN } = require('./layout');
const { defineLineMarker, defineCircleMarker, defineRectangleMarker, rectangleMarker } = require('./markers');
const { lineSegmentsSelector, methodsSelector, timeSeriesSelector, HASH_ID, MASK_DESC } = require('./timeseries');


/**
 * Create a simple legend
 *
 * @param {Object} svg - d3 selector
 * @param {Object} legendMarkers - property for each ts key containing the markers to draw
 * @param {Object} layout - width and height of svg.
 */
function drawSimpleLegend(svg,
                          legendMarkers,
                          layout) {
    const markerYPosition = -4;
    const markerGroupXOffset = 40;
    const verticalRowOffset = 18;
    const markerTextXOffset = 10;

    let rowCounter = 0;
    let legend = svg
        .append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${MARGIN.left}, ${layout.height - MARGIN.bottom + 20})`);

    for (let tsKey in legendMarkers) {
        let xPosition = 0;
        let previousMarkerGroup;
        if (legendMarkers[tsKey].length > 0) {
            rowCounter += 1;
        }

        for (let legendMarker of legendMarkers[tsKey]) {
            if (previousMarkerGroup) {
                let previousMarkerGroupBox = previousMarkerGroup.node().getBBox();
                xPosition = previousMarkerGroupBox.x + previousMarkerGroupBox.width + markerGroupXOffset;
            }
            let legendGroup = legend.append('g')
                .attr('class', 'legend-marker');
            if (legendMarker.groupId) {
                legendGroup.attr('id', legendMarker.groupId);
            }
            let markerType = legendMarker.type;
            let yPosition;
            if (markerType === rectangleMarker) {
                yPosition = markerYPosition * 2.5 + verticalRowOffset * rowCounter;
            } else {
                yPosition = markerYPosition + verticalRowOffset * rowCounter;
            }
            let markerArgs = {
                r: legendMarker.r ? legendMarker.r : null,
                x: xPosition,
                y: yPosition,
                width: 20,
                height: 10,
                length: 20,
                domId: legendMarker.domId,
                domClass: legendMarker.domClass,
                fill: legendMarker.fill
            };

            // add the marker to the svg
            let detachedMarker = markerType(markerArgs);
            legendGroup.node().appendChild(detachedMarker.node());
            // add text for the legend marker
            let detachedMarkerBBox = detachedMarker.node().getBBox();
            legendGroup.append('text')
                .attr('x', detachedMarkerBBox.x + detachedMarkerBBox.width + markerTextXOffset)
                .attr('y', verticalRowOffset * rowCounter)
                .text(legendMarker.text);
            previousMarkerGroup = legendGroup;
        }
    }
}

const tsMaskMarkers = function(tsKey, masks) {
    return [...masks].map((mask) => {
        const maskName = MASK_DESC[mask];
        const tsClass = `${maskName.replace(' ', '-').toLowerCase()}-mask`;
        const fill = `url(#${HASH_ID[tsKey]})`;
        return defineRectangleMarker(null, `mask ${tsClass}`, maskName, null, fill);
    });
};

/**
 * create elements for the legend in the svg
 *
 * @param {Object} displayItems - Object containing keys for each ts. The current and compare will contain an
 *                 object that has a masks property containing the Set of masks that are currently displayed.
 *                 The median property will contain the metadata for the median statistics
 * @return {Object} - Each key respresnts a ts and contains an array of markers to show.
 */
const createLegendMarkers = function(displayItems) {
    let legendMarkers = {
        current: [],
        compare: [],
        median: []
    };

    if (displayItems.current) {
        legendMarkers.current.push(defineLineMarker(null, 'line', 'Current Year', 'current-year-line-marker'));
        legendMarkers.current.push(...tsMaskMarkers('current', displayItems.current.masks));
    }
    if (displayItems.compare) {
        legendMarkers.compare.push(defineLineMarker(null, 'line', 'Last Year', 'compare-year-line-marker'));
        legendMarkers.compare.push(...tsMaskMarkers('compare', displayItems.compare.masks));
    }

    if (displayItems.median) {
        const stats = displayItems.median;
        const descriptionText = stats.description  ? `${stats.description} ` : '';
        const dateText = stats.beginYear && stats.endYear ? `${stats.beginYear} - ${stats.endYear}` : '';
        legendMarkers.median.push(
            defineCircleMarker(CIRCLE_RADIUS, null, 'median-data-series', `Median ${descriptionText}${dateText}`));
    }

    return legendMarkers;
};

const uniqueMasksSelector = memoize(tsDataKey => createSelector(
    lineSegmentsSelector(tsDataKey),
    (tsLineSegments) => {
        return new Set(tsLineSegments.reduce((masks, lineSegments) => {
            Array.prototype.push.apply(masks, lineSegments.map((segment) => segment.classes.dataMask));
            return masks;
        }, []).filter(x => x !== null));
    }
));
/**
 * Select attributes from the state useful for legend creation
 */
const legendDisplaySelector = createSelector(
    (state) => state.showSeries,
    timeSeriesSelector('median'),
    methodsSelector,
    uniqueMasksSelector('current'),
    uniqueMasksSelector('compare'),
    (showSeries, medianTSs, methods, currentMasks, compareMasks) => {
        // FIXME: handle more than just the first median time series
        const medianTS = medianTSs[0];
        return {
            current: showSeries.current ? {masks: currentMasks} : undefined,
            compare: showSeries.compare ? {masks: compareMasks} : undefined,
            median: {
                beginYear: medianTS ? medianTS.startTime.getFullYear() : undefined,
                endYear: medianTS ? medianTS.endTime.getFullYear() : undefined,
                description: medianTS && medianTS.method ? methods[medianTS.method].methodDescription : ''
            }
        };
    }
);

module.exports = {drawSimpleLegend, createLegendMarkers, legendDisplaySelector};
