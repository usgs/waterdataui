import {scaleLinear} from 'd3-scale';
import {select} from 'd3-selection';

import {drawCursorSlider} from './cursor-slider';

describe('cursor-slider', () => {
    describe('drawCursorSlider', () => {
        let svg, xScale, mockStore, mockAction;

        beforeEach(() => {
            svg = select('body')
                .append('svg');
            xScale = scaleLinear().range([0, 100]).domain([1000, 1999]);
            mockStore = {
                dispatch: jasmine.createSpy('mockStoreDispatch')
            };
            mockAction = jasmine.createSpy('mockAction');
        });

        afterEach(() => {
            svg.remove();
        });

        it('Renders a slider with expected properties and attributes', () => {
            drawCursorSlider(svg, {
                cursorOffset: 1400,
                xScale: xScale,
                layout: {
                    width: 400,
                    height: 200,
                    margin: {
                        left: 10,
                        right: 10,
                        top: 20,
                        bottom: 20
                    }
                }
            }, mockStore, mockAction);
            const slider = svg.selectAll('.slider-wrapper');
            expect(slider.size()).toBe(1);
            const input = slider.selectAll('input');
            expect(input.size()).toBe(1);
            expect(input.attr('type')).toEqual('range');
            expect(input.property('value')).toEqual(1400);
            expect(input.attr('max')).toEqual('999');
        });

        it('Set the value property to the scale\'s domain range if cursorOffset is not set', () => {
            drawCursorSlider(svg, {
                cursorOffset: null,
                xScale: xScale,
                layout: {
                    width: 400,
                    height: 200,
                    margin: {
                        left: 10,
                        right: 10,
                        top: 20,
                        bottom: 20
                    }
                }
            }, mockStore, mockAction);

            expect(svg.select('.slider-wrapper').select('input').property('value')).toEqual(999);
        });

        it('updates the cursor offset if the input event is triggered', () => {
            drawCursorSlider(svg, {
                cursorOffset: null,
                xScale: xScale,
                layout: {
                    width: 400,
                    height: 200,
                    margin: {
                        left: 10,
                        right: 10,
                        top: 20,
                        bottom: 20
                    }
                }
            }, mockStore, mockAction);
            svg.select('input').dispatch('input');
            expect(mockAction).toHaveBeenCalled();
        });

        it('updates the cursor offset if the focus event is triggered', () => {
            drawCursorSlider(svg, {
                cursorOffset: null,
                xScale: xScale,
                layout: {
                    width: 400,
                    height: 200,
                    margin: {
                        left: 10,
                        right: 10,
                        top: 20,
                        bottom: 20
                    }
                }
            }, mockStore, mockAction);
            svg.select('input').dispatch('focus');
            expect(mockAction).toHaveBeenCalled();
        });
    });
});
