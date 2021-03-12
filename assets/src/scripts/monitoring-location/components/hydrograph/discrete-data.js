/*
 * Render the ground water level symbols on the svg in their own group. If the group exists, remove
 * it before rendering again.
 * @param {D3 elem} svg (could also be a group)
 * @param {Array of Object} levels - each object, should have properties needed to draw the groundwater levels
 *      including dateTime, value, radius, and class
 * @param {D3 scale} xScale
 * @param {D3 scale } yScale
 */
export const drawGroundwaterLevels = function(svg, {levels, xScale, yScale, enableClip}) {
    svg.selectAll('.iv-graph-gw-levels-group').remove();
    const group = svg.append('g')
        .attr('class', 'iv-graph-gw-levels-group');
    if (enableClip) {
        group.attr('clip-path', 'url(#graph-clip)');
    }

    levels.forEach((level) => {
        group.append('circle')
            .attr('class', level.classes.join(' '))
            .attr('r', level.radius)
            .attr('cx', xScale(level.dateTime))
            .attr('cy', yScale(level.value));
    });
};
