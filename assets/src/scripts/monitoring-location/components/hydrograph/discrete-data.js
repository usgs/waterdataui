import {defineCircleMarker, defineTextOnlyMarker} from 'd3render/markers';

const GW_LEVEL_RADIUS = 7;
const GW_LEVEL_CLASS = 'gw-level-point';


/*
 * Render the ground water level symbols on the svg in their own group. If the group exists, remove
 * it before rendering again.
 * @param {D3 elem} svg (could also be a group)
 * @param {Array of Object} points - each object, should have dateTime and value properties
 * @param {D3 scale} xScale
 * @param {D3 scale } yScale
 */
export const drawGroundwaterLevels = function(svg, {points, xScale, yScale, enableClip}) {
    svg.selectAll('#iv-graph-gw-levels-group').remove();
    const group = svg.append('g')
        .attr('id', 'iv-graph-gw-levels-group');
    if (enableClip) {
        group.attr('clip-path', 'url(#graph-clip)');
    }

    points.forEach((point) => {
        group.append('circle')
            .attr('class', `${GW_LEVEL_CLASS} ${point.approvals.class}`)
            .attr('r', GW_LEVEL_RADIUS)
            .attr('cx', xScale(point.dateTime))
            .attr('cy', yScale(point.value));
    });
};

/*
 * Returns a circle marker that can be used to represent the groundwater level symbol in legends
 * @return {Object} - see d3-rendering/markers module.
 */
export const getGroundwaterLevelsMarkers = function(groundwaterApprovals) {
    let groundwaterMarkers = [];
    groundwaterMarkers.push(defineTextOnlyMarker('Field Visit: '));

    if (groundwaterApprovals.provisional) {
        groundwaterMarkers.push(defineCircleMarker(null, `${GW_LEVEL_CLASS} provisional`, GW_LEVEL_RADIUS, 'Provisional'));
    }
    if (groundwaterApprovals.approved) {
        groundwaterMarkers.push(defineCircleMarker(null, `${GW_LEVEL_CLASS} approved`, GW_LEVEL_RADIUS, 'Approved'));
    }
    if (groundwaterApprovals.revised) {
        groundwaterMarkers.push(defineCircleMarker(null, `${GW_LEVEL_CLASS} revised`, GW_LEVEL_RADIUS, 'Revised'));
    }
    return groundwaterMarkers;
};
