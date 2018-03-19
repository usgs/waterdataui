const { layoutSelector, MARGIN } = require('./layout');
const { xScaleSelector, yScaleSelector } = require('./scales');

const { Actions } = require('../../store');
const { dispatch, link } = require('../../lib/redux');

const SLIDER_STEPS = 1000;


export const cursorLocationSelector = state => state.tooltipFocusTime.current;

export const cursorSlider = function (elem) {
    elem.append('div')
        .attr('class', 'slider-wrapper')
        .call(wrap => {
            wrap.append('input')
                .attr('type', 'range')
                .attr('id', 'cursor-slider')
                .attr('left', MARGIN.left)
                .on('input', dispatch(function () {
                    return Actions.setCursorLocation(new Date(this.valueAsNumber));
                }))
                .on('blur', dispatch(function () {
                    return Actions.setCursorLocation(null);
                }))
                .call(link((input, xScale) => {
                    // Use the integer time values of the x-axis range
                    const domain = xScale.domain();
                    const min = domain[0].getTime();
                    const max = domain[1].getTime();
                    input.attr('min', min)
                        .attr('max', max)
                        .attr('step', (max - min) / SLIDER_STEPS);
                }, xScaleSelector('current')))
                .call(link((input, cursorLocation) => {
                    input.property('value', cursorLocation ? cursorLocation.getTime() : input.attr('max'))
                        .classed('active', cursorLocation !== null);
                }, cursorLocationSelector))
                .call(link((input, layout) => {
                    input.attr('width', layout.width - (MARGIN.left + MARGIN.right));
                }, layoutSelector));
        })
};
