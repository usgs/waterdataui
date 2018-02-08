// functions to facilitate legend creation for a d3 plot
const { createSelector } = require('reselect');
const { defineLineMarker, defineCircleMarker } = require('./markers');
const { CIRCLE_RADIUS } = require('./layout');

/**
 * Create a simple horizontal legend
 *
 * @param svg
 * @param legendMarkers
 * @param startingXPosition
 * @param markerYPosition
 * @param textYPosition
 * @param markerGroupOffset
 * @param markerTextOffset
 */
function drawSimpleLegend(svg,
                          legendMarkers,
                          startingXPosition=0,
                          markerYPosition=-4,
                          textYPosition=0,
                          markerGroupOffset=40,
                          markerTextOffset=10) {
    let legend = svg
        .append('g')
        .attr('class', 'legend');

    let svgBBox = svg.node().getBBox();

    let previousMarkerGroup;

    for (let legendMarker of legendMarkers) {
        let xPosition;
        let previousMarkerGroupBox;
        let detachedMarker;
        if (previousMarkerGroup == null) {
            xPosition = startingXPosition;
        }
        else {
            previousMarkerGroupBox = previousMarkerGroup.node().getBBox();
            xPosition = previousMarkerGroupBox.x + previousMarkerGroupBox.width + markerGroupOffset;
        }
        let markerType = legendMarker.type;
        let legendGroup = legend.append('g')
            .attr('class', 'legend-marker');
        if (legendMarker.groupId) {
            legendGroup.attr('id', legendMarker.groupId);
        }
        let markerArgs = {
            r: legendMarker.r ? legendMarker.r : null,
            x: xPosition,
            y: markerYPosition,
            length: 20,
            domId: legendMarker.domId,
            domClass: legendMarker.domClass
        };
        // add the marker to the svg
        detachedMarker = markerType(markerArgs);
        legendGroup.node().appendChild(detachedMarker.node());
        // add text for the legend marker
        let detachedMarkerBBox = detachedMarker.node().getBBox();
        legendGroup.append('text')
            .attr('x', detachedMarkerBBox.x + detachedMarkerBBox.width + markerTextOffset)
            .attr('y', textYPosition)
            .text(legendMarker.text);

        previousMarkerGroup = legendGroup;
    }
    // center the legend group in the svg
    let legendBBox = legend.node().getBBox();
    let legendXPosition = (svgBBox.width - legendBBox.width) / 2;
    legend.attr('transform', `translate(${legendXPosition}, ${svgBBox.height-15})`);
}


const legendDisplaySelector = createSelector(
    (state) => state.showSeries,
    (state) => state.statisticalMetaData,
    (showSeries, statisticalMetaData) => {
        let shownSeries = [];
        let displayMarkers = [];
        let text;
        let marker;
        for (let key in showSeries) {
            if (showSeries.hasOwnProperty(key)) {
                if (showSeries[key]) {
                    shownSeries.push(key);
                }
            }
        }
        for (let seriesName of shownSeries) {
            if (seriesName === 'compare' || seriesName === 'current') {
                text = 'Current Year';
                let domId = `ts-${seriesName}`;
                let svgGroup = `${seriesName}-line-marker`;
                if (seriesName === 'compare') {
                    text = 'Last Year';
                }
                marker = defineLineMarker(domId, 'line', text, svgGroup);
            }
            else if (seriesName === 'medianStatistics') {
                try {
                    let beginYear = statisticalMetaData.beginYear;
                    let endYear = statisticalMetaData.endYear;
                    text = `Median Discharge ${beginYear} - ${endYear}`;
                }
                catch(err) {
                    text = 'Median Discharge';
                }
                marker = defineCircleMarker(CIRCLE_RADIUS, null, 'median-data-series', text, 'median-circle-marker');
            }
            else {
                marker = null;
            }
            displayMarkers.push(marker)
        }
        return displayMarkers;
    }
);


module.exports = {drawSimpleLegend, legendDisplaySelector};