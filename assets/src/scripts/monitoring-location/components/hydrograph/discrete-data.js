import {defineCircleMarker} from 'd3render/markers';

const GW_LEVEL_RADIUS = 5;
const GW_LEVEL_CLASS = 'gw-level-point';

/*
 * Render the ground water level symbols on the svg in their own group. If the group exists, remove
 * it before rendering again.
 * @param {D3 elem} svg (could also be a group)
 * @param {Array of Object} levels - each object, should have dateTime and value properties
 * @param {D3 scale} xScale
 * @param {D3 scale } yScale
 */
export const drawGroundwaterLevels = function(svg, {levels, xScale, yScale}) {
    svg.selectAll('#iv-graph-gw-levels-group').remove();
    const group = svg.append('g')
        .attr('id', 'iv-graph-gw-levels-group');

    levels.forEach((level) => {
        group.append('circle')
            .attr('class', GW_LEVEL_CLASS)
            .attr('r', GW_LEVEL_RADIUS)
            .attr('cx', xScale(level.dateTime))
            .attr('cy', yScale(level.value));
    });
};

/*
 * Returns a circle marker that can be used to represent the groundwater level symbol in legends
 * @return {Object} - see d3-rendering/markers module.
 */
export const getGroundwaterLevelsMarker = function() {
    return defineCircleMarker(null, GW_LEVEL_CLASS, GW_LEVEL_RADIUS, 'Groundwater level');
};
