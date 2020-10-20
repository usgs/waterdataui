import {scaleLinear} from 'd3-scale';
import {select} from 'd3-selection';

import {drawCursorSlider} from 'd3render/cursor-slider';

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

        it('Renders a slider', () => {
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
            const sliderGroup = svg.selectAll('.cursor-slider-group');
            expect(sliderGroup.size()).toBe(1);
            const slider = sliderGroup.selectAll('.slider');
            expect(slider.size()).toBe(1);
        });
    });
});
