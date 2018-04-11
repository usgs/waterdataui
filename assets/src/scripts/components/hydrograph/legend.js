// functions to facilitate legend creation for a d3 plot
const memoize = require('fast-memoize');
const { createSelector } = require('reselect');

const { CIRCLE_RADIUS } = require('./layout');
const { defineLineMarker, defineTextOnlyMarker, defineCircleMarker, defineRectangleMarker} = require('./markers');
const { currentVariableLineSegmentsSelector, HASH_ID, MASK_DESC} = require('./drawingData');
const { currentVariableTimeSeriesSelector, methodsSelector } = require('./timeseries');

const TS_LABEL = {
    'current': 'Current: ',
    'compare': 'Last year: ',
    'median': 'Median: '
};


const tsMaskMarkers = function(tsKey, masks) {
    return [...masks].map((mask) => {
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
 * @return {Object} - Each key respresnts a ts and contains an array of markers to show.
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
            const label = `${descriptionText}${dateText}`;

            legendMarkers.push([
                defineTextOnlyMarker(TS_LABEL.median),
                defineCircleMarker(CIRCLE_RADIUS, null, classes, label)]);
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
export const drawSimpleLegend = function(div, {legendMarkerRows, layout}) {
    div.selectAll('.legend-svg').remove();

    if (!legendMarkerRows.length || !layout) {
        return;
    }

    const markerGroupXOffset = 15;
    const verticalRowOffset = 18;

    let svg = div.append('svg')
        .attr('class', 'legend-svg');
    let legend = svg
        .append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${layout.margin.left}, 0)`);

    legendMarkerRows.forEach((rowMarkers, rowIndex) => {
        let xPosition = 0;
        let yPosition = verticalRowOffset * (rowIndex + 1);

        rowMarkers.forEach((marker) => {
            let markerArgs = {
                x: xPosition,
                y: yPosition,
                text: marker.text,
                domId: marker.domId,
                domClass: marker.domClass,
                width: 20,
                height: 10,
                length: 20,
                r: marker.r ,
                fill: marker.fill
            };
            let markerGroup = marker.type(legend, markerArgs);
            let markerGroupBBox;
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
                markerGroupBBox = markerGroup.node().getBBox();
                xPosition = markerGroupBBox.x + markerGroupBBox.width + markerGroupXOffset;

            } catch(error) {
                // See above explanation
            }
        });
    });

    // Set the size of the containing svg node to the size of the legend.
    let bBox;
    try {
        bBox = legend.node().getBBox();
    } catch(error) {
        return;
    }
    svg.attr('viewBox', `-${CIRCLE_RADIUS} 0 ${layout.width} ${bBox.height + 10}`);
};

const uniqueClassesSelector = memoize(tsKey => createSelector(
    currentVariableLineSegmentsSelector(tsKey),
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


/*
 * Factory function  that returns an array of array of markers to be used for the
 * timeseries graph legend
 * @return {Array of Array} of markers
 */
export const legendMarkerRowsSelector = createSelector(
    legendDisplaySelector,
    displayItems => createLegendMarkers(displayItems)
);

