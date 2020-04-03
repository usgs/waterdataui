
import {sliderHorizontal} from 'd3-simple-slider';

const SLIDER_STEPS = 1000;

// This is a bit of a hack to deal with the radius on the slider circle, so
// the slider is aligned with the graph.
const SLIDER_OFFSET_PX = 15;

export const drawCursorSlider = function(svg, {cursorOffset, xScale, layout}, store, setCursorOffsetAction) {
    const [startMillis, endMillis] = xScale.domain();
    const [startX, endX] = xScale.range();
    let slider = sliderHorizontal()
        .min(startMillis)
        .max(endMillis)
        .step((endMillis - startMillis) / SLIDER_STEPS)
        .width(endX - startX)
        .displayValue(false)
        .ticks(0)
        .on('onchange', (val) => {
            store.dispatch(setCursorOffsetAction(val));
        });


    svg.select('.cursor-slider-group').remove();
    svg.append('g')
        .attr('class', 'cursor-slider-group')
        .attr('transform', `translate(${layout.margin.left},30)`)
        .call(slider);

    slider.silentValue(startMillis + cursorOffset);
};