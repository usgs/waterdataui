import {pointer} from 'd3-selection';

/*
 * Draws an overlay rectangle with the given scale and layout and creates mouse events
 * that update the store using the setCursorOffsetAction function.
 * Please note that this element should be placed in the DOM after other graph elements so that
 * mouse events are caught by the handlers in this function.
 * @param {D3 selection for SVG or group} elem
 * @param {D3 scale} xscale - the D3 scale used to translate x data to pixels
 * @param {Object} layout - containes width, height, and margin properties when rendering the parent SVG
 * @param {Redux store} store
 * @param {Function} - setCursorOffsetAction - a redux action which takes cursor offset parameter
 */
export const drawFocusOverlay = function(elem, {xScale, layout}, store, setCursorOffsetAction) {
    elem.select('.focus-overlay').remove();
    elem.append('rect')
        .classed('focus-overlay', true)
        .data([4])
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', layout.width - layout.margin.right)
        .attr('height', layout.height - (layout.margin.top + layout.margin.bottom));
    elem.select('.focus-overlay').on('mouseover', (event) => {
            if (event) {
                const selectedTime = xScale.invert(pointer(event)[0]);
                const startTime = xScale.domain()[0];
                store.dispatch(setCursorOffsetAction(selectedTime - startTime));
            }
        });
    elem.select('.focus-overlay').on('mousemove', (event) => {
            if (event) {
                const selectedTime = xScale.invert(pointer(event)[0]);
                const startTime = xScale.domain()[0];
                store.dispatch(setCursorOffsetAction(selectedTime - startTime));
            }
        });
};

/*
 * Creates a container on elem (if not already created) that draws focus circles at points in tooltipPoints.
 * @param {D3 selection for SVG or group} elem
 * @param {Array of Object} tooltipPoints - Each element contains x and y pixel properties
 * @param {D3 selection for g} - Can be null in which case the a group is appended to elem
 */
export const drawFocusCircles = function(elem, tooltipPoints, circleContainer) {
    circleContainer = circleContainer || elem.append('g');
    circleContainer.style('pointer-events', 'none');

    const circles = circleContainer
        .selectAll('circle.focus-circle')
        .data(tooltipPoints);

    // Remove old circles after fading them out
    circles.exit()
        .remove();

    // Add new focus circles
    const newCircles = circles.enter()
        .append('circle')
            .attr('class', 'focus-circle')
            .attr('r', 5.5)
            .style('opacity', '.6');

    // Update the location of all circles
    circles.merge(newCircles)
        .attr('transform', (tsDatum) => `translate(${tsDatum.x}, ${tsDatum.y})`);
    return circleContainer;
};

export const drawFocusLine = function(elem, {cursorTime, xScale, yScale}) {
    elem.selectAll('.focus-line-group').remove();
    if (cursorTime) {
        const x = xScale(cursorTime);
        const range = yScale.range();
        elem.append('g')
            .attr('class', 'focus-line-group')
            .style('pointer-events', 'none')
            .append('line')
                .attr('class', 'focus-line')
                .attr('y1', range[0])
                .attr('y2', range[1])
                .attr('x1', x)
                .attr('x2', x);
    }
};