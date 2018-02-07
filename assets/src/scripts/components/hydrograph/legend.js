const { lineMarker, circleMarker, defineLineMarker, defineCircleMarker } = require('./markers');

const currentTSMarker = defineLineMarker(null, 'line', 'Current Year', 'current-line-marker');
const medianMarker = defineCircleMarker(4, null, 'median-data-series', 'Median Discharge', 'median-circle-marker');
const compareTSMarker = defineLineMarker('ts-compare', 'line', 'Last Year', 'compare-line-marker');

const baseMarkers = [currentTSMarker, medianMarker];
const extendedMarkers = [currentTSMarker, compareTSMarker, medianMarker];


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

    console.log('drawSimpleLegend got called');

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


module.exports = {drawSimpleLegend, baseMarkers, extendedMarkers};