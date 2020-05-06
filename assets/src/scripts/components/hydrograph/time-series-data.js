import {extent} from 'd3-array';
import {line as d3Line} from 'd3-shape';

import {HASH_ID, MASK_DESC} from './drawing-data';

const CIRCLE_RADIUS_SINGLE_PT = 1;
/*
 * Render lines if visible using the scales. The tsKey string is used for various class names so that this element
 * can be styled by using the class name.
 * @param {Boolean} visible
 * @param {Array of Object} - Each object has two properties: classes which contains meta data for the line segment
 *      and points which is an Array of Object where each object describes a point in the line with properties dateTime
 *      and value.
 * @param {String} tsKey
 * @param {Object} xScale - D3 scale for the x axis
 * @param {Object} yScale - D3 scale for the y axis
 */
export const drawDataLine = function(group, {visible, lines, tsKey, xScale, yScale }) {
    if (!visible) {
        return;
    }

    const tsKeyClass = `ts-${tsKey}`;

    for (let line of lines) {
        if (line.classes.dataMask === null) {
            // If this is a single point line, then represent it as a circle.
            // Otherwise, render as a line.
            if (line.points.length === 1) {
                group.append('circle')
                    .data(line.points)
                    .classed('line-segment', true)
                    .classed('approved', line.classes.approved)
                    .classed('estimated', line.classes.estimated)
                    .classed('not-current-method', !line.classes.currentMethod)
                    .classed(tsKeyClass, true)
                    .attr('r', CIRCLE_RADIUS_SINGLE_PT)
                    .attr('cx', d => xScale(d.dateTime))
                    .attr('cy', d => yScale(d.value));
            } else {
                const tsLine = d3Line()
                    .x(d => xScale(d.dateTime))
                    .y(d => yScale(d.value));
                group.append('path')
                    .datum(line.points)
                    .classed('line-segment', true)
                    .classed('approved', line.classes.approved)
                    .classed('estimated', line.classes.estimated)
                    .classed('not-current-method', !line.classes.currentMethod)
                    .classed(tsKeyClass, true)
                    .attr('d', tsLine);
            }
        } else {
            const maskCode = line.classes.dataMask.toLowerCase();
            const maskDisplayName = MASK_DESC[maskCode].replace(' ', '-').toLowerCase();
            const [xDomainStart, xDomainEnd] = extent(line.points, d => d.dateTime);
            const [yRangeStart, yRangeEnd] = yScale.range();

            // Some data is shown with the yAxis decreasing from top top bottom
            const yTop = yRangeEnd > yRangeStart ? yRangeStart : yRangeEnd;
            let maskGroup = group.append('g')
                .attr('class', `${tsKey}-mask-group`);
            const xSpan = xScale(xDomainEnd) - xScale(xDomainStart);
            const rectWidth = xSpan > 1 ? xSpan : 1;

            maskGroup.append('rect')
                .attr('x', xScale(xDomainStart))
                .attr('y', yTop)
                .attr('width', rectWidth)
                .attr('height', Math.abs(yRangeEnd - yRangeStart))
                .attr('class', `mask ${maskDisplayName}-mask`)
                .classed(tsKeyClass, true);


            const patternId = HASH_ID[tsKey] ? `url(#${HASH_ID[tsKey]})` : '';

            maskGroup.append('rect')
                .attr('x', xScale(xDomainStart))
                .attr('y', yTop)
                .attr('width', rectWidth)
                .attr('height', Math.abs(yRangeEnd - yRangeStart))
                .attr('fill', patternId);
        }
    }
};

/*
 * Render a set of lines if visible using the scales. The tsKey string is used for various class names so that this element
 * can be styled by using the class name.
 * @param {Boolean} visible
 * @param {Array of Obect} - Each object is suitable for passing to drawDataLine
 * @param {String} tsKey
 * @param {Object} xScale - D3 scale for the x axis
 * @param {Object} yScale - D3 scale for the y axis
 * @param {Boolean} enableClip - Set if lines should be clipped to the width/height of the container.
 */
export const drawDataLines = function(elem, {visible, tsLinesMap, tsKey, xScale, yScale, enableClip}, container) {
    container = container || elem.append('g');

    const elemId = `ts-${tsKey}-group`;
    container.selectAll(`#${elemId}`).remove();
    const tsLineGroup = container
        .append('g')
            .attr('id', elemId)
            .classed('tsKey', true);

    if (enableClip) {
        tsLineGroup.attr('clip-path', 'url(#graph-clip)');
    }

    for (const lines of Object.values(tsLinesMap)) {
        drawDataLine(tsLineGroup, {visible, lines, tsKey, xScale, yScale});
    }

    return container;
};