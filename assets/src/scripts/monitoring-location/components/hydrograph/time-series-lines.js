import {line as d3Line} from 'd3-shape';

export const HASH_ID = {
    primary: 'hash-45',
    compare: 'hash-135'
};

const CIRCLE_RADIUS_SINGLE_PT = 1;

const drawLineSegment = function(group, {segment, dataKind, xScale, yScale}) {
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
        .classed(`ts-${dataKind}`, true);
};

const drawMaskSegment = function(group, {segment, dataKind, xScale, yScale}) {
    const [yRangeStart, yRangeEnd] = yScale.range();
    const xRangeStart = xScale(segment.points[0].dateTime);
    const xRangeEnd = xScale(segment.points[segment.points.length - 1].dateTime);

    // Some data is shown with the yAxis decreasing from top top bottom
    const yTop = yRangeEnd > yRangeStart ? yRangeStart : yRangeEnd;

    const xSpan = xRangeEnd - xRangeStart;
    const rectWidth = xSpan > 1 ? xSpan : 1;
    const rectHeight = Math.abs(yRangeEnd - yRangeStart);

    const maskGroup = group.append('g')
        .attr('class', 'iv-mask-group');

    maskGroup.append('rect')
        .attr('x', xRangeStart)
        .attr('y', yTop)
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .classed('mask', true)
        .classed(segment.class, true);
    maskGroup.append('rect')
        .attr('x', xRangeStart)
        .attr('y', yRangeEnd)
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .attr('fill', `url(#${HASH_ID[dataKind]}`);
};
/*
 * Render the segment of dataKind using the scales.
 * @param {D3 selector} group
 * @param {Object} segment
 * @param {String} dataKind - can be 'primary' or 'compare'
 * @param {D3 scale} xScale
 * @param {D3 scale} yScale
 */
const drawDataSegment = function(group, {segment, dataKind, xScale, yScale}) {
    if (segment.isMasked) {
        drawMaskSegment(group, {segment, dataKind, xScale, yScale});
    } else {
        drawLineSegment(group, {segment, dataKind, xScale, yScale});
    }
};
/*
 * Render a set of lines if visible using the scales. The tsKey string is used for various class names so that this element
 * can be styled by using the class name.
 * @param {Boolean} visible
 * @param {String} currentMethodID
 * @param {Array of Object} - Each object is suitable for passing to drawDataLine
 * @param {String} timeRangeKind - 'current' or 'compare'
 * @param {Object} xScale - D3 scale for the x axis
 * @param {Object} yScale - D3 scale for the y axis
 * @param {Boolean} enableClip - Set if lines should be clipped to the width/height of the container.
 */
export const drawDataSegments = function(elem, {visible, segments, dataKind, xScale, yScale, enableClip}) {
    const elemClass = `ts-${dataKind}-group`;

    elem.selectAll(`.${elemClass}`).remove();
    const lineGroup = elem.append('g')
        .attr('class', elemClass);
    if (!visible || !segments || !segments.length) {
        return;
    }

    if (enableClip) {
        lineGroup.attr('clip-path', 'url(#graph-clip)');
    }

    segments.forEach(segment => {
        drawDataSegment(lineGroup, {segment, dataKind, xScale, yScale});
    });
};