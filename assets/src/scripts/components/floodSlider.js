const { select } = require('d3-selection');
const { createStructuredSelector } = require('reselect');

const { dispatch, link, provide } = require('../lib/redux');
const { Actions } = require('../store');

const updateSlider = function(node, {stages, gageHeight}) {
    if (stages.length === 0) {
        node.property('hidden', true);
    } else {
        node.select('input')
            .attr('min', 0)
            .attr('max', stages.length - 1)
            .attr('step', 1)
            .attr('value', stages.indexOf(gageHeight));
        node.select('.range-value').text(gageHeight);
        node.property('hidden', false);
    }
};

const floodSlider = function(node) {
    let sliderContainer = node.append('div')
        .attr('class', '.slider-wrapper')
        .property('hidden', true);
    sliderContainer.append('div')
        .html('Gage Height: <span class="range-value"></span> ft');
    sliderContainer.append('input')
        .attr('type', 'range')
        .attr('class', 'wdfn-slider')
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

