
import {sliderTop} from 'd3-simple-slider';

/*
 * Creates a group in svg offset by layout.margin.left and renders a d3-simple-slider with a
 * domain and range of xScale. Appropriate event handlers are added that dispatch setCursorOffsetAction
 * to the redux store when the cursor slider is changed.
 * @param {D3 svg selection} svg
 * @param {Number} cursorOffset - Is the difference between the cursor location and the beginning of the scale
 * @param {Object} layout - the margin.left property is used to offset the slider,
 * @param {Object} store - Redux store instance
 * @param {Object} setCursorOffsetAction - Redux action which will be dispatched when the slider value changes.
 */
export const drawCursorSlider = function(svg, {cursorOffset, xScale, layout}, store, setCursorOffsetAction) {
    const [startMillis, endMillis] = xScale.domain();
    const [startX, endX] = xScale.range();
    let slider = sliderTop()
        .min(startMillis)
        .max(endMillis)
        .width(endX - startX)
        .displayValue(false)
        .ticks(0);

    svg.select('.cursor-slider-group').remove();
    svg.append('g')
        .attr('class', 'cursor-slider-group')
        .attr('transform', `translate(${layout.margin.left},15)`)
        .call(slider);
    slider.silentValue(cursorOffset ? startMillis + cursorOffset : endMillis);

    slider.on('end', (val) => {
        store.dispatch(setCursorOffsetAction(val - startMillis));
    });
};