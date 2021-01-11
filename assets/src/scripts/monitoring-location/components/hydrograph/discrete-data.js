import {defineCircleMarker} from 'd3render/markers';

const GW_LEVEL_RADIUS = 5;
const GW_LEVEL_CLASS = 'gw-level-point';

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

export const getGroundwaterLevelsMarker = function() {
    return defineCircleMarker(null, GW_LEVEL_CLASS, GW_LEVEL_RADIUS, 'Groundwater level');
};
