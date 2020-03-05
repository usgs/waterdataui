// functions to facilitate DV legend creation for a d3 plot
import memoize from 'fast-memoize';
import {createSelector, createStructuredSelector} from 'reselect';

import {defineLineMarker, defineTextOnlyMarker} from '../../d3-rendering/markers';
import {getLayout} from './selectors/layout';
import {getCurrentTimeSeriesLineSegments} from './selectors/time-series-lines';

import config from '../../config';
import { mediaQuery } from '../../utils';
import {link} from '../../lib/d3-redux';

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
 * @return {Object} - Each key represents a ts and contains an array of markers to show.
 */
const createLegendMarkers = function(displayItems) {
    const legendMarkers = [];

    if (displayItems.current) {
        const currentMarkers = [
            ...tsLineMarkers('current', displayItems.current)
        ];
        if (currentMarkers.length) {
            legendMarkers.push([
                defineTextOnlyMarker('', null, 'ts-legend-current-text'),
                ...currentMarkers
            ]);
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
            console.log('DV: marker text:'+marker.text+ ' xPosition:'+xPosition+ ' yPosition:'+yPosition );

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

                console.log('DV: markerGroupBBox.x:'+markerGroupBBox.x+ ' markerGroupBBox.width:'+markerGroupBBox.width+ ' markerGroupXOffset:'+markerGroupXOffset);
                console.log('DV: xPosition:'+xPosition);

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


const uniqueClassesSelector = memoize(tsKey => createSelector(
    getCurrentTimeSeriesLineSegments,
    (tsLineSegments) => {
        let result = {
            default: false,
            approved: false,
            estimated: false
        };
        tsLineSegments.forEach((segment) => {
            result.approved = result.approved || segment.approvals.includes('Approved');
            result.estimated = result.estimated || segment.approvals.includes('Estimated');
            result.default = result.default || segment.approvals.length === 0;
        });
        return result;
    }
));


/**
 * Select attributes from the state useful for legend creation
 */
const legendDisplaySelector = createSelector(
    (state) => state.timeSeriesState.showSeries,
    uniqueClassesSelector('current'),
    uniqueClassesSelector('compare'),
    (showSeries, medianSeries, currentClasses) => {
        return {
            current: showSeries.current ? currentClasses : undefined
        };
    }
);


/*
 * Factory function that returns an array of array of markers to be used for the
 * time series graph legend
 * @return {Array of Array} of markers
 */
export const legendMarkerRowsSelector = createSelector(
    legendDisplaySelector,
    displayItems => createLegendMarkers(displayItems)
);


export const drawTimeSeriesLegend = function(elem, store) {
    elem.append('div')
        .classed('hydrograph-container', true)
        .call(link(store, drawSimpleLegend, createStructuredSelector({
            legendMarkerRows: legendMarkerRowsSelector,
            layout: getLayout
        })));
};

