// functions to facilitate legend creation for a d3 plot
const { createSelector } = require('reselect');
const { defineLineMarker, defineCircleMarker, defineRectangleMarker, rectangleMarker } = require('./markers');
const { CIRCLE_RADIUS } = require('./layout');
const { MASK_DESC } = require('./timeseries');


/**
 * Create a simple horizontal legend
 *
 * @param svg
 * @param legendMarkers
 * @param width
 * @param startingXPosition
 * @param markerYPosition
 * @param textYPosition
 * @param markerGroupOffset
 * @param markerTextOffset
 */
function drawSimpleLegend(svg,
                          legendMarkers,
                          width=null,
                          startingXPosition=0,
                          markerYPosition=-4,
                          textYPosition=0,
                          markerGroupOffset=40,
                          markerTextOffset=10) {
    const verticalRowOffset = 20;
    const svgBBox = svg.node().getBBox();
    const svgWidth = width ? width : svgBBox.width;
    let rowCounter = 0;

    let legend = svg
        .append('g')
        .attr('class', 'legend');

    let previousMarkerGroup;

    for (let legendMarker of legendMarkers) {
        let xPosition;
        let detachedMarker;
        if (previousMarkerGroup == null) {
            xPosition = startingXPosition;
        } else {
            let previousMarkerGroupBox = previousMarkerGroup.node().getBBox();
            xPosition = previousMarkerGroupBox.x + previousMarkerGroupBox.width + markerGroupOffset;
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
        detachedMarker = markerType(markerArgs);
        legendGroup.node().appendChild(detachedMarker.node());
        // add text for the legend marker
        let detachedMarkerBBox = detachedMarker.node().getBBox();
        legendGroup.append('text')
            .attr('x', detachedMarkerBBox.x + detachedMarkerBBox.width + markerTextOffset)
            .attr('y', textYPosition + verticalRowOffset * rowCounter)
            .text(legendMarker.text);
        let legendGroupBBox = legendGroup.node().getBBox();
        let legendGroupRightXCoordinate = legendGroupBBox.x + legendGroupBBox.width;
        if (legendGroupRightXCoordinate/svgWidth >= 0.60) {
            rowCounter += 1;
            previousMarkerGroup = null;
        } else {
            previousMarkerGroup = legendGroup;
        }
    }
    // center the legend group in the svg
    let legendBBox = legend.node().getBBox();
    const legendXPosition = (svgWidth - legendBBox.width) / 2;

    legend.attr('transform', `translate(${legendXPosition}, ${svgBBox.height - 30})`);
}

/**
 * create elements for the legend in the svg
 *
 * @param dataPlotElements
 * @param lineSegments
 */
const createLegendMarkers = function(dataPlotElements, lineSegments=[]) {
    let text;
    let marker;
    let legendMarkers = [];
    // create legend markers for data series
    for (let dataItem of dataPlotElements.dataItems) {
        let hashMarker;
        if (dataItem === 'compare' || dataItem === 'current') {
            let domId = `ts-legend-${dataItem}`;
            let svgGroup = `${dataItem}-line-marker`;
            if (dataItem === 'compare') {
                hashMarker = defineRectangleMarker(null, 'mask', 'Compare Timeseries Mask', null, 'url(#hash-135)');
                text = 'Last Year';
            } else {
                hashMarker = defineRectangleMarker(null, 'mask', 'Current Timeseries Mask', null, 'url(#hash-45)');
                text = 'Current Year';
            }
            marker = defineLineMarker(domId, 'line', text, svgGroup);
        } else if (dataItem === 'medianStatistics') {
            text = 'Median';
            if (dataPlotElements.metadata.statistics.description) {
                text = `${text} ${dataPlotElements.metadata.statistics.description}`;
            }
            let beginYear = dataPlotElements.metadata.statistics.beginYear;
            let endYear = dataPlotElements.metadata.statistics.endYear;
            if (beginYear && endYear) {
                text = `${text} ${beginYear} - ${endYear}`;
            }
            marker = defineCircleMarker(CIRCLE_RADIUS, null, 'median-data-series', text, 'median-circle-marker');
        } else {
            marker = null;
        }
        if (marker) {
            legendMarkers.push(marker);
        }
        if (hashMarker) {
            legendMarkers.push(hashMarker);
        }
    }
    // create markers for data masks for different components of data series
    let masks = [];
    lineSegments.map(segment => masks.push(segment.classes.dataMask));
    let uniqueMasks = new Set(masks.filter(x => x !== null));
    for (let uniqueMask of uniqueMasks) {
        let maskDisplayName = MASK_DESC[uniqueMask];
        let maskClass = `mask ${maskDisplayName.replace(' ', '-').toLowerCase()}-mask`;
        marker = defineRectangleMarker(null, maskClass, maskDisplayName, null);
        legendMarkers.push(marker);
    }
    return legendMarkers;
};

/**
 * Select attributes from the state useful for legend creation
 */
const legendDisplaySelector = createSelector(
    (state) => state.showSeries,
    (state) => state.tsData,
    (state) => state.currentParameterCode,
    (showSeries, tsData, currentParameterCode) => {
        const medianTS = tsData.medianStatistics[currentParameterCode] || {};
        const statisticalMetaData = medianTS.medianMetadata || {};
        let shownSeries = [];
        let dataPlotElements = {};
        for (let key in showSeries) {
            if (showSeries.hasOwnProperty(key)) {
                if (showSeries[key]) {
                    shownSeries.push(key);
                }
            }
        }

        dataPlotElements.dataItems = shownSeries;
        dataPlotElements.metadata = {
            statistics: {
                beginYear: statisticalMetaData.beginYear ? statisticalMetaData.beginYear : undefined,
                endYear: statisticalMetaData.endYear ? statisticalMetaData.endYear : undefined,
                description: medianTS.description || ''
            }
        };
        return dataPlotElements;
    }
);


module.exports = {drawSimpleLegend, createLegendMarkers, legendDisplaySelector};
