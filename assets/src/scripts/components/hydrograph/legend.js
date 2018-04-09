// functions to facilitate legend creation for a d3 plot
const memoize = require('fast-memoize');
const { createSelector } = require('reselect');

const { CIRCLE_RADIUS } = require('./layout');
const { defineLineMarker, defineCircleMarker, defineRectangleMarker, rectangleMarker } = require('./markers');
const { currentVariableLineSegmentsSelector, HASH_ID, MASK_DESC} = require('./drawingData');
const { currentVariableTimeSeriesSelector, methodsSelector } = require('./timeseries');


const tsMaskMarkers = function(tsKey, masks) {
    return [...masks].map((mask) => {
        const maskName = MASK_DESC[mask];
        const tsClass = `${maskName.replace(' ', '-').toLowerCase()}-mask`;
        const fill = `url(#${HASH_ID[tsKey]})`;
        return defineRectangleMarker(null, `mask ${tsClass}`, maskName, null, fill);
    });
};

const tsLineMarkers = function(tsKey, lineClasses) {
    const GROUP_ID = `${tsKey}-line-marker`
    let result = [];

    if (lineClasses.default) {
        result.push(defineLineMarker(`ts-legend-${tsKey}-default`, 'line-segment', 'Provisional', GROUP_ID));
    }
    if (lineClasses.approved) {
        result.push(defineLineMarker(`ts-legend-${tsKey}-approved`, 'line-segment approved', 'Approved', GROUP_ID));
    }
    if (lineClasses.estimated) {
        result.push(defineLineMarker(`ts-legend-${tsKey}-estinated`, 'line-segment estimated', 'Estimated', GROUP_ID));
    }
    return result;
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
            ...tsLineMarkers('current', displayItems.current),
            ...tsMaskMarkers('current', displayItems.current.dataMasks)
        ]);
    }
    if (displayItems.compare) {
        legendMarkers.push([
            ...tsLineMarkers('compare', displayItems.compare),
            ...tsMaskMarkers('compare', displayItems.compare.dataMasks)
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
 * @param {Object} div - d3 selector where legend should be created
 * @param {Object} legendMarkerRows - Array of rows. Each row should be an array of legend markers.
 * @param {Object} layout - width and height of svg.
 */
function drawSimpleLegend(div, {legendMarkerRows, layout}) {
    div.selectAll('.legend-svg').remove();

    if (!legendMarkerRows || !layout) {
        return;
    }

    const markerYPosition = -4;
    const markerGroupXOffset = 40;
    const verticalRowOffset = 18;
    const markerTextXOffset = 10;

    let svg = div.append('svg')
        .attr('class', 'legend-svg');
    let legend = svg
        .append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${layout.margin.left}, 0)`);

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
            let detachedMarkerBBox;
            // Long story short, firefox is unable to get the bounding box if
            // the svg element isn't actually taking up space and visible. Folks on the
            // internet seem to have gotten around this by setting `visibility:hidden`
            // to hide things, but that would still mean the elements will take up space.
            // which we don't want. So, here's some error handling for getBBox failures.
            // This handling ends up not creating the legend, but that's okay because the
            // graph is being shown anyway. A more detailed discussion of this can be found at:
            // https://bugzilla.mozilla.org/show_bug.cgi?id=612118 and
            // https://stackoverflow.com/questions/28282295/getbbox-of-svg-when-hidden.
            try {
                detachedMarkerBBox = detachedMarker.node().getBBox();
            } catch(error) {
                continue;
            }
            legendGroup.append('text')
                .attr('x', detachedMarkerBBox.x + detachedMarkerBBox.width + markerTextXOffset)
                .attr('y', verticalRowOffset * rowCount)
                .text(legendMarker.text);
            previousMarkerGroup = legendGroup;
        }
    }

    // Set the size of the containing svg node to the size of the legend.
    let bBox;
    try {
        bBox = legend.node().getBBox();
    } catch(error) {
        return;
    }
    svg.attr('viewBox', `-${CIRCLE_RADIUS} 0 ${layout.width} ${bBox.height + 10}`);
}

const uniqueClassesSelector = memoize(tsKey => createSelector(
    currentVariableLineSegmentsSelector(tsKey),
    (tsLineSegments) => {
        let classes = [].concat(...Object.values(tsLineSegments)).map((line) => line.classes);
        let d = classes.find((cls) => {
               return !cls.approved && !cls.estimated;
            });
        return {
            default: classes.find((cls) => {
               return !cls.approved && !cls.estimated;
            }) ? true : false,
            approved: classes.find((cls) => {
                return cls.approved;
            })? true : false,
            estimated: classes.find((cls) => {
                return cls.estimated;
            }) ? true : false,
            dataMasks: new Set(classes.map((cls) => cls.dataMask).filter((mask) => {
                return mask;
            }))
        };
    }
));



/**
 * Select attributes from the state useful for legend creation
 */
const legendDisplaySelector = createSelector(
    (state) => state.showSeries,
    currentVariableTimeSeriesSelector('median'),
    methodsSelector,
    uniqueClassesSelector('current'),
    uniqueClassesSelector('compare'),
    (showSeries, medianTSs, methods, currentClasses, compareClasses) => {
        return {
            current: showSeries.current ? currentClasses : undefined,
            compare: showSeries.compare ? compareClasses : undefined,
            median: showSeries.median ? Object.values(medianTSs).map(medianTS => {
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
