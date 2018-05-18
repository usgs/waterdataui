import { createStructuredSelector } from 'reselect';
import { dispatch, link } from '../../lib/redux';
import { getFloodStages, getFloodStageHeight, getFloodGageHeightStageIndex, hasFloodData } from '../../selectors/floodDataSelector';
import { Actions } from '../../store';
import { appendTooltip } from '../../tooltips';



const createSlider = function(elem, stages) {
    const SLIDER_ID = 'fim-slider';
    elem.select('#flood-slider-container').remove();
    if (stages.length) {
        let sliderContainer = elem.append('div')
            .attr('id', 'flood-slider-container')
            .attr('class', 'slider-wrapper');
        sliderContainer.append('label')
            .attr('for', SLIDER_ID)
            .html(`Gage Height: <output class="range-value" for="${SLIDER_ID}"></output> ft`);
        sliderContainer.append('input')
            .attr('type', 'range')
            .attr('id', SLIDER_ID)
            .attr('min', 0)
            .attr('max', stages.length - 1)
            .attr('step', 1)
            .attr('aria-valuemin', 0)
            .attr('aria-valuemax', stages.length - 1)
            .on('input', dispatch(function () {
                return Actions.setGageHeightFromStageIndex(this.value);
            }));
    }
};

const updateSlider = function(elem, {stageHeight, gageHeightStageIndex}) {
    elem.select('input[type="range"]')
        .attr('value', gageHeightStageIndex)
        .attr('aria-valuenow', gageHeightStageIndex)
        .attr('aria-valuetext', stageHeight);
    elem.select('.range-value').text(stageHeight);
};

export const createSliderHelp = function(elem, hasFloodData) {
    elem.select('#fim-tooltip-container').remove();
    if (hasFloodData) {
        elem.append('div')
            .attr('id', 'fim-tooltip-container')
            .attr('class', 'label-tooltip-container')
            .html('Flood Visualization Control')
            .call(appendTooltip, 'Move the slider to see flood inundation at different gage heights');
    }
};

export const floodSlider = function(elem) {
    elem
        .call(link(createSliderHelp, hasFloodData))
        .call(link(createSlider, getFloodStages))
        .call(link(updateSlider, createStructuredSelector({
            stageHeight: getFloodStageHeight,
            gageHeightStageIndex: getFloodGageHeightStageIndex
        })));
};
