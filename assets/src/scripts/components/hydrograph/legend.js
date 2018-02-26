// functions to facilitate legend creation for a d3 plot
const { createSelector } = require('reselect');
const { defineLineMarker, defineCircleMarker, defineRectangleMarker, rectangleMarker } = require('./markers');
const { CIRCLE_RADIUS, MARGIN } = require('./layout');
const { MASK_DESC} = require('./timeseries');

const drawSvgLegend = function(svg, legendMarkers, layout) {
    let legend = svg.append('svg')
        .attr('viewBox', `0 0 ${layout.width} 30`)
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .classed('legend', true)
        .attr('x','0')
        .attr('y', 0)
        .attr('width', '100%')
        .attr('height', '100%');
    legend.append('rect')
        .attr('width', '100%')
        .attr('height', '100%')
        .style('fill', 'red');
};
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
                          layout,
                          startingXPosition=0,
                          markerYPosition=-4,
                          textYPosition=0,
                          markerGroupOffset=40,
                          markerTextOffset=10) {
    const verticalRowOffset = 18;
    let rowCounter = 0;

    let legend = svg
        .append('g')
        .attr('class', 'legend');

    for (let tsKey in legendMarkers) {
        let xPosition = startingXPosition;
        let detachedMarker;
        let previousMarkerGroup;
        if (legendMarkers[tsKey].length > 0) {
            rowCounter += 1;
        }
        for (let legendMarker of legendMarkers[tsKey]) {
            if (previousMarkerGroup) {
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
            previousMarkerGroup = legendGroup;
        }
    }
    legend.attr('transform', `translate(${MARGIN.left}, ${layout.height - MARGIN.bottom + 20})`);
}

/**
 * create elements for the legend in the svg
 *
 * @param dataPlotElements
 * @param lineSegments
 * @return {Array of Array of markers} - Each array represents a line in the legend
 */
const createLegendMarkers = function(dataPlotElements, currentLineSegments=[], compareLineSegments=[]) {
    let text;
    let marker;
    let legendMarkers = {
        current: [],
        compare: [],
        medianStatistics: []
    };

    // create legend markers for data series
    //if dataPlotElements.dataItems
    for (let dataItem of dataPlotElements.dataItems) {
        if (dataItem === 'compare' || dataItem === 'current') {
            let domId = `ts-legend-${dataItem}`;
            let svgGroup = `${dataItem}-line-marker`;
            if (dataItem === 'compare') {
                text = 'Last Year';
            } else {
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
            legendMarkers[dataItem].push(marker);
        }
    }
    // create markers for data masks for different components of data series
    let currentMasks = currentLineSegments.map(segment => {return segment.classes.dataMask;});
    let uniqueMasks = new Set(currentMasks.filter(x => x !== null));
    for (let uniqueMask of uniqueMasks) {
        let maskDisplayName = MASK_DESC[uniqueMask];
        let maskClass = `mask ${maskDisplayName.replace(' ', '-').toLowerCase()}-mask`;
        marker = defineRectangleMarker(null, maskClass, maskDisplayName, null, 'url(#hash-45)');
        legendMarkers.current.push(marker);
    }
    let compareMasks = compareLineSegments.map(segment => { return segment.classes.dataMask; });
    let compareUniqueMasks = new Set(compareMasks.filter(x => x !== null));
    for (let uniqueMask of compareUniqueMasks) {
        let maskDisplayName = MASK_DESC[uniqueMask];
        let maskClass = `mask ${maskDisplayName.replace(' ', '-').toLowerCase()}-mask`;
        marker = defineRectangleMarker(null, maskClass, maskDisplayName, null, 'url(#hash-135)');
        legendMarkers.compare. push(marker);
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
            if (showSeries[key]) {
                shownSeries.push(key);
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


module.exports = {drawSimpleLegend, drawSvgLegend, createLegendMarkers, legendDisplaySelector};
