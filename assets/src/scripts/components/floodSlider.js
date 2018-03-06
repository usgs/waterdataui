const { select } = require('d3-selection');
const { createStructuredSelector } = require('reselect');

const { dispatch, link, provide } = require('../lib/redux');
const { Actions } = require('../store');

const FIM_ENDPOINT = window.FIM_ENDPOINT;

const updateSlider = function(node, {stages, gageHeight}) {
    if (stages.length === 0) {
        node.property('hidden', true);
    } else {
        const heightIndex = stages.indexOf(gageHeight);
        node.select('input')
            .attr('min', 0)
            .attr('max', stages.length - 1)
            .attr('step', 1)
            .attr('value', heightIndex)
            .attr('aria-valuemin', 0)
            .attr('aria-valuemax', stages.length - 1)
            .attr('aria-valuenow', heightIndex)
            .attr('aria-valuetext', gageHeight);
        node.select('.range-value').text(gageHeight);
        node.property('hidden', false);
    }
};

const floodSlider = function(node) {
    const SLIDER_ID = 'fim-slider';
    let sliderContainer = node.append('div')
        .attr('class', 'slider-wrapper')
        .property('hidden', true);
    sliderContainer.append('label')
        .attr('for', SLIDER_ID)
        .html(`Gage Height: <output class="range-value" for="${SLIDER_ID}"></output> ft`);
    sliderContainer.append('input')
        .attr('type', 'range')
        .attr('class', 'wdfn-slider')
        .attr('id', SLIDER_ID)
        .on('change', dispatch(function() {
            return Actions.setGageHeight(this.value);
        }));

    sliderContainer.call(link(updateSlider, createStructuredSelector({
        stages: (state)=> state.floodStages,
        gageHeight: (state) => state.gageHeight
    })));
};

const attachToNode = function(store, node) {
    select(node)
        .call(provide(store))
        .call(floodSlider);
};

module.exports = {attachToNode};

