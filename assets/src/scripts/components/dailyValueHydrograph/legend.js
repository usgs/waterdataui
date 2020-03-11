// functions to facilitate DV legend creation for a d3 plot
import {createStructuredSelector} from 'reselect';

import {defineLineMarker} from '../../d3-rendering/markers';
import {getLayout} from './selectors/layout';
import {getLegendMarkerRows} from './selectors/legend-data';

import config from '../../config';
import { mediaQuery } from '../../utils';
import {link} from '../../lib/d3-redux';


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
            .attr('transform', `translate(${mediaQuery(config.USWDS_MEDIUM_SCREEN) ? layout.margin.left : 0}, 0)`);

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
                r: marker.r,
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
    svg.attr('viewBox', `-4 0 ${layout.width} ${bBox.height + 20}`);
};


export const drawTimeSeriesLegend = function(elem, store) {
    elem.append('div')
        .classed('hydrograph-container', true)
        .call(link(store, drawSimpleLegend, createStructuredSelector({
            legendMarkerRows: getLegendMarkerRows,
            layout: getLayout
        })));
};

