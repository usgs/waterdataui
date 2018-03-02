// functions to facilitate legend creation for a d3 plot
const memoize = require('fast-memoize');
const { createSelector } = require('reselect');

const { CIRCLE_RADIUS, MARGIN } = require('./layout');
const { defineLineMarker, defineCircleMarker, defineRectangleMarker, rectangleMarker } = require('./markers');
const { timeSeriesSelector, lineSegmentsSelector, methodsSelector, HASH_ID, MASK_DESC } = require('./timeseries');


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
    const legendMarkers = [];

    if (displayItems.current) {
        legendMarkers.push([
            defineLineMarker('ts-legend-current', 'line', 'Current Year', 'current-year-line-marker'),
            ...tsMaskMarkers('current', displayItems.current.masks)
        ]);
    }
    if (displayItems.compare) {
        legendMarkers.push([
            defineLineMarker('ts-legend-compare', 'line', 'Last Year', 'compare-year-line-marker'),
            ...tsMaskMarkers('compare', displayItems.compare.masks)
        ]);
    }

    if (displayItems.median) {
        for (const [index, stats] of displayItems.median.entries()) {
            // Get the unique non-null years, in chronological order
            const years = [];
            if (stats.beginYear) {
                years.push(stats.beginYear);
            }
            if (stats.endYear && stats.beginYear !== stats.endYear) {
                years.push(stats.endYear);
            }
            const dateText = years.join(' - ');

            const descriptionText = stats.description  ? `${stats.description} ` : '';
            const classes = `median-data-series median-modulo-${index % 6}`;
            const label = `Median ${descriptionText}${dateText}`;

            legendMarkers.push([defineCircleMarker(CIRCLE_RADIUS, null, classes, label)]);
        }
    }

    return legendMarkers;
};

/**
 * Create a simple legend
 *
 * @param {Object} svg - d3 selector
 * @param {Object} legendMarkerRows - Array of rows. Each row should be an array of legend markers.
 * @param {Object} layout - width and height of svg.
 */
function drawSimpleLegend(svg, {legendMarkerRows, layout}) {
    svg.selectAll('.legend').remove();

    if (!legendMarkerRows || !layout) {
        return;
    }

    const markerYPosition = -4;
    const markerGroupXOffset = 40;
    const verticalRowOffset = 18;
    const markerTextXOffset = 10;

    let legend = svg
        .append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${MARGIN.left}, 0)`);

    for (const [index, legendMarkerRow] of legendMarkerRows.entries()) {
        const rowCount = index + 1;
        let xPosition = 0;
        let previousMarkerGroup;

        for (let legendMarker of legendMarkerRow) {
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
                yPosition = markerYPosition * 2.5 + verticalRowOffset * rowCount;
            } else {
                yPosition = markerYPosition + verticalRowOffset * rowCount;
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
                .attr('y', verticalRowOffset * rowCount)
                .text(legendMarker.text);
            previousMarkerGroup = legendGroup;
        }
    }

    // Set the size of the containing svg node to the size of the legend.
    const bBox = legend.node().getBBox();
    svg.attr('viewBox', `0 0 ${layout.width} ${bBox.height + 10}`);
}

const uniqueMasksSelector = memoize(tsKey => createSelector(
    lineSegmentsSelector(tsKey),
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
        return {
            current: showSeries.current ? {masks: currentMasks} : undefined,
            compare: showSeries.compare ? {masks: compareMasks} : undefined,
            median: showSeries.median ? medianTSs.map(medianTS => {
                return {
                    beginYear: medianTS ? medianTS.metadata.beginYear : undefined,
                    endYear: medianTS ? medianTS.metadata.endYear : undefined,
                    description: medianTS && medianTS.method ? methods[medianTS.method].methodDescription : ''
                };
            }) : undefined
        };
    }
);


const legendMarkerRowsSelector = createSelector(
    legendDisplaySelector,
    displayItems => createLegendMarkers(displayItems)
);

module.exports = {drawSimpleLegend, createLegendMarkers, legendDisplaySelector, legendMarkerRowsSelector};
