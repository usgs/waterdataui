import { select } from 'd3-selection';
import { provide } from '../../lib/redux';
import { configureStore } from '../../store';
import { floodSlider } from './flood-slider';


describe('floodSlider', () => {

    let sliderNode;
    let store;

    beforeEach(() => {
        select('body')
            .append('div')
                .attr('id', 'slider-container');
        sliderNode = document.getElementById('slider-container');
    });

    afterEach(() => {
        select('#slider-container').remove();
    });

    describe('creating slider when their are no stages', () => {
        beforeEach(() => {
            store = configureStore();
            select(sliderNode)
                .call(provide(store))
                .call(floodSlider);
        });

        it('The slider should not be created', () => {
            expect(select(sliderNode).select('#fim-tooltip-container').size()).toBe(0);
            expect(select(sliderNode).select('.slider-wrapper').size()).toBe(0);
        });
    });

    describe('creating slider when there is flood data and gage height', () => {
        beforeEach(() => {
            store = configureStore({
                floodData: {
                    stages: [9, 10, 11, 12]
                },
                floodState: {
                    gageHeight: 10
                }
            });
            select(sliderNode)
                .call(provide(store))
                .call(floodSlider);
        });

        it('The slider is not hidden', () => {
            expect(select(sliderNode).select('#fim-tooltip-container').size()).toBe(1);
            expect(select(sliderNode).select('.slider-wrapper').size()).toBe(1);
        });

        it('Expects the slider\'s min, max, step, and value set appropriately', () => {
            let slider = select(sliderNode).select('input[type="range"]');
            expect(slider.attr('min')).toBe('0');
            expect(slider.attr('max')).toBe('3');
            expect(slider.attr('step')).toBe('1');
            expect(slider.attr('value')).toBe('1');
        });

        it('Expect the slider]\'s label to contain the gage height', () => {
            expect(select(sliderNode).select('label').html()).toContain('10');
        });
    });

    describe('Handling slider changes', () => {
        beforeEach(() => {
            store = configureStore({
                floodData: {
                    stages: [9, 10, 11, 12]
                },
                floodState: {
                    gageHeight: 10
                }
            });
            select(sliderNode)
                .call(provide(store))
                .call(floodSlider);
        });

        it('Sets the gageHeight when the slider value changes and updates the label', () => {
            const slider = select(sliderNode).select('input[type="range"]');
            slider.attr('value', 2)
                .dispatch('input');

            expect(store.getState().floodState.gageHeight).toBe(11);
            expect(select(sliderNode).select('label').html()).toContain('11');
        });
    });
});
