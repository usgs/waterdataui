import {mediaQuery} from '../utils';
import config from '../config';

const RECTANGLE_MARKER_WIDTH = 20;
const RECTANGLE_MARKER_HEIGHT = 10;
const LINE_MARKER_WIDTH = 20;
const MARKER_GROUP_X_OFFSET = 15;
const VERTICAL_ROW_OFFSET = 18;


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

    const svg = div.append('svg')
        .attr('class', 'legend-svg');

    const legend = svg
        .append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${mediaQuery(config.USWDS_MEDIUM_SCREEN) ? layout.margin.left : 0}, 0)`);

    let yPosition = VERTICAL_ROW_OFFSET;
    legendMarkerRows.forEach((rowMarkers) => {
        let xPosition = 0;
        let markerArgs;
        let markerGroup;
        let lastMarker;

        const getNewXPosition = function(markerGroup, lastXPosition) {
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
                const markerGroupBBox = markerGroup.node().getBBox();
                return markerGroupBBox.x + markerGroupBBox.width + MARKER_GROUP_X_OFFSET;
            } catch(error) {
                // See above explanation
                return lastXPosition;
            }
        };

        const repositionLastMarkerWhenNeeded = function() {
            if (xPosition - MARKER_GROUP_X_OFFSET > layout.width) {
                // Need to remove the last marker and draw it on the next row.
                markerGroup.remove();
                xPosition = 0;
                yPosition = yPosition + VERTICAL_ROW_OFFSET;
                markerArgs.x = xPosition;
                markerArgs.y = yPosition;
                markerGroup = lastMarker.type(legend, markerArgs);
                xPosition = getNewXPosition(markerGroup, xPosition);
            }
        };

        rowMarkers.forEach((marker) => {
            repositionLastMarkerWhenNeeded();

            markerArgs = {
                x: xPosition,
                y: yPosition,
                text: marker.text,
                domId: marker.domId,
                domClass: marker.domClass,
                width: RECTANGLE_MARKER_WIDTH,
                height: RECTANGLE_MARKER_HEIGHT,
                length: LINE_MARKER_WIDTH,
                r: marker.r,
                fill: marker.fill
            };

            lastMarker = marker;
            markerGroup = marker.type(legend, markerArgs);
            xPosition = getNewXPosition(markerGroup, xPosition);
        });
        repositionLastMarkerWhenNeeded();
        //start new reow
        yPosition = yPosition = yPosition + VERTICAL_ROW_OFFSET;
    });

    // Set the size of the containing svg node to the size of the legend.
    let bBox;
    try {
        bBox = legend.node().getBBox();
    } catch(error) {
        return;
    }
    svg.attr('viewBox', `0 0 ${layout.width} ${bBox.height + 10}`);
};