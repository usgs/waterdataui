import {line as d3Line} from 'd3-shape';

import {HASH_ID} from './selectors/drawing-data';

const CIRCLE_RADIUS_SINGLE_PT = 1;

const drawLineSegment = function(group, {segment, isCurrentMethod, dateKind, xScale, yScale}) {
    let lineElem;
    if (segment.points.length === 1) {
        lineElem = group.append('circle')
            .data(segment.points)
            .attr('r', CIRCLE_RADIUS_SINGLE_PT)
            .attr('cx', d => xScale(d.dateTime))
            .attr('cy', d => yScale(d.value));
    } else {
        const dvLine = d3Line()
            .x(d => xScale(d.dateTime))
            .y(d => yScale(d.value));
        lineElem = group.append('path')
            .datum(segment.points)
            .attr('d', dvLine);

    }
    lineElem
        .classed('line-segment', true)
        .classed(segment.class, true)
        .classed(dateKind, true)
        .classed('not-current-method', !isCurrentMethod);
};

const drawMaskSegment = function(group, {segment, isCurrentMethod, dateKind, xScale, yScale}) {
    const [yRangeStart, yRangeEnd] = yScale.range();
    const xRangeStart = xScale(segment.points[0].dateTime);
    const xRangeEnd = xScale(segment.points[segment.points.length - 1].dateTime);

    // Some data is shown with the yAxis decreasing from top top bottom
    const yTop = yRangeEnd > yRangeStart ? yRangeStart : yRangeEnd;

    const xSpan = xRangeEnd - xRangeStart;
    const rectWidth = xSpan > 1 ? xSpan : 1;
    const rectHeight = Math.abs(yRangeEnd - yRangeStart);

    const maskGroup = group.append('g')
        .attr('class', 'dv-mask-group');

    maskGroup.append('rect')
        .attr('x', xRangeStart)
        .attr('y', yTop)
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .classed('mask', true)
        .classed('not-current-method', !isCurrentMethod)
        .classed(segment.class, true);
    maskGroup.append('rect')
        .attr('x', xRangeStart)
        .attr('y', yRangeEnd)
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .attr('fill', `url(#${HASH_ID[dateKind]}`);
};
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
export const drawDataSegment = function(group, {segment, isCurrentMethod, dateKind, xScale, yScale}) {
    if (segment.isMasked) {
        drawMaskSegment(group, {segment, isCurrentMethod, dateKind, xScale, yScale});
    } else {
        drawLineSegment(group, {segment, isCurrentMethod, dateKind, xScale, yScale});
    }
};
/*
 * Render a set of lines if visible using the scales. The tsKey string is used for various class names so that this element
 * can be styled by using the class name.
 * @param {Boolean} visible
 * @param {String} currentMethodID
 * @param {Array of Obect} - Each object is suitable for passing to drawDataLine
 * @param {String} timeRangeKind - 'current' or 'compare'
 * @param {Object} xScale - D3 scale for the x axis
 * @param {Object} yScale - D3 scale for the y axis
 * @param {Boolean} enableClip - Set if lines should be clipped to the width/height of the container.
 */
export const drawDataSegments = function(elem, {visible, currentMethodID, tsSegmentsMap, dataKind, xScale, yScale, enableClip}, container) {
    container = container || elem.append('g');

    const elemId = `ts-${dataKind}-group`;
    const isCurrentMethodID = function(thisMethodID) {
        return currentMethodID ? currentMethodID === thisMethodID : true;
    };

    container.selectAll(`#${elemId}`).remove();
    if (!visible) {
        return;
    }
    const tsLineGroup = container
        .append('g')
            .attr('id', elemId);

    if (enableClip) {
        tsLineGroup.attr('clip-path', 'url(#graph-clip)');
    }

    Object.keys(tsSegmentsMap).forEach(methodID => {
        const isCurrentMethod = isCurrentMethodID(methodID);
        const segments = tsSegmentsMap[methodID];
        segments.forEach(segment => {
            drawDataSegment(tsLineGroup, {segment, isCurrentMethod, dataKind, xScale, yScale});
        });
    });

    return container;
};