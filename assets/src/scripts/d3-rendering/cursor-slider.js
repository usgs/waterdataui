
const SLIDER_STEPS = 1000;

// This is a bit of a hack to deal with the radius on the slider circle, so
// the slider is aligned with the graph.
const SLIDER_OFFSET_PX = 15;

export const drawCursorSlider = function(elem, {cursorOffset, xScale, layout}, store, setCursorOffsetAction, sliderContainer) {
    const xDomain = xScale.domain();
    const timeScale = xDomain[1] - xDomain[0];
    if (!sliderContainer) {
        sliderContainer = elem.append('div')
            .attr('class', 'slider-wrapper');
        sliderContainer.append('input')
            .attr('type', 'range')
            .classed('usa-range', true)
            .attr('aria-label', 'Graph Cursor Slider')
            .attr('min', 0);
    }

    console.log(`In cursor slider layout is width: ${layout.width}, height: ${layout.height}, left: ${layout.margin.left}, right: ${layout.margin.right}`);

    sliderContainer.select('.usa-range')
        .attr('max', timeScale)
        .attr('step', timeScale / SLIDER_STEPS)
        .property('value', cursorOffset || timeScale)
        .style('position', 'relative')
        .style('max-width', 'none')
        .style('padding-left', '0')
        .style('padding-right', '0')
        .style('left', `${layout.margin.left - SLIDER_OFFSET_PX}px`)
        .style('width', `${layout.width - layout.margin.left - layout.margin.right - 2 * SLIDER_OFFSET_PX}px`)
        .on('input', function () {
            store.dispatch(setCursorOffsetAction(this.valueAsNumber));
        })
        .on('focus', function () {
            store.dispatch(setCursorOffsetAction(this.valueAsNumber));
        });
    return sliderContainer;
};