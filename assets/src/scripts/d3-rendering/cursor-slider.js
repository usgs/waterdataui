
import {sliderTop} from 'd3-simple-slider';

export const drawCursorSlider = function(svg, {cursorOffset, xScale, layout}, store, setCursorOffsetAction) {
    const [startMillis, endMillis] = xScale.domain();
    const [startX, endX] = xScale.range();
    console.log(`Rerendering slider with cursorOffset ${cursorOffset}`);
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