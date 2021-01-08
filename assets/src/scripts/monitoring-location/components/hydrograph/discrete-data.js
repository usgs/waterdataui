const CIRCLE_RADIUS_SINGLE_PT = 1;

export const drawGroundWaterLevels = function(svg, {levels, xScale, yScale}) {
    svg.selectAll('#iv-graph-gw-levels-group').remove();
    const group = svg.append('g')
        .attr('id', 'iv-graph-gw-levels-group');

    levels.forEach((level) => {
        group.append('circle')
            .data(level)
            .attr('r', CIRCLE_RADIUS_SINGLE_PT)
            .attr('cx', d => xScale(d.dateTime))
            .attr('cy', d => yScale(d.value));
    });
};