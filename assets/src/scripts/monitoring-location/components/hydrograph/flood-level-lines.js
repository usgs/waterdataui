import {line as d3Line} from 'd3-shape';

/*
 * Renders the flood lines if available and visible on svg.
 * @param {D3 selection for svg or group} svg
 * @param {Boolean} visible
 * @param {D3 scale} xscale
 * @param {D3 scale} yscale
 * @param {Array of Object} floodLevels - array elements describe value, label and class.
 */
export const drawFloodLevelLines = function(svg, {visible, xscale, yscale, floodLevels}) {
    svg.select('#flood-level-points').remove();
    const container = svg.append('g')
        .lower()
        .attr('id', 'flood-level-points');

    if (!visible) {
        return;
    }

    const xRange = xscale.range();
    const [yStart, yEnd] = yscale.domain();
    floodLevels.forEach((level) => {
        if (level.value >= yStart && level.value <= yEnd) {
            const group = container.append('g');
            const yRange = yscale(level.value);
            const floodLine = d3Line()([[xRange[0], yRange], [xRange[1], yRange]]);
            group.append('path')
                .classed('waterwatch-data-series', true)
                .classed(level.class, true)
                .attr('d', floodLine);
        }
    });
};