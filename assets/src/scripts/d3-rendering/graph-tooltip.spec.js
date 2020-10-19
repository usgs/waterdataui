import {scaleLinear} from 'd3-scale';
import {select} from 'd3-selection';

import {drawFocusOverlay, drawFocusLine, drawFocusCircles} from 'd3render/graph-tooltip';

describe('graph-tooltip module', () => {
    let svg;
    beforeEach(() => {
        svg = select('body')
                .append('svg');
    });

    afterEach(() => {
        svg.remove();
    });

    describe('drawFocusOverlay', () => {
        let xScale, mockStore, mockAction;

        beforeEach(() => {
            xScale = scaleLinear().range([0, 100]).domain([1000, 1999]);
            mockStore = {
                dispatch: jasmine.createSpy('mockStoreDispatch')
            };
            mockAction = jasmine.createSpy('mockAction');
        });

        afterEach(() => {
            svg.remove();
        });

        it('Renders a rectangle with the expected height and width', () => {
            drawFocusOverlay(svg, {
                xScale: xScale,
                layout: {
                    width: 400,
                    height: 200,
                    margin: {
                        left: 10,
                        right: 10,
                        top: 15,
                        bottom: 15
                    }
                }
            }, mockStore, mockAction);

            const rect = svg.selectAll('rect');
            expect(rect.size()).toBe(1);
            expect(rect.attr('width')).toEqual('390');
            expect(rect.attr('height')).toEqual('170');
        });

        it('expect that a mouseover event triggers a dispatch to mockAction', () => {
            drawFocusOverlay(svg, {
                xScale: xScale,
                layout: {
                    width: 400,
                    height: 200,
                    margin: {
                        left: 10,
                        right: 10,
                        top: 15,
                        bottom: 15
                    }
                }
            }, mockStore, mockAction);
            svg.select('rect').node().dispatchEvent(new window.MouseEvent('mouseover'));

            expect(mockAction).toHaveBeenCalled();
        });

        it('expect that a mousemove event triggers a dispatch to mockAction', () => {
            drawFocusOverlay(svg, {
                xScale: xScale,
                layout: {
                    width: 400,
                    height: 200,
                    margin: {
                        left: 10,
                        right: 10,
                        top: 15,
                        bottom: 15
                    }
                }
            }, mockStore, mockAction);
            svg.select('rect').node().dispatchEvent(new window.MouseEvent('mousemove'));

            expect(mockAction).toHaveBeenCalled();
        });
    });

    describe('drawFocusCircles', () => {
        it('Expect that the number of circles drawn is the same as the number of points', () => {
            drawFocusCircles(svg, [{x: 5, y: 3}, {x:6, y:3}, {x:7, y:4}], null);

            expect(svg.selectAll('circle').size()).toBe(3);
        });
    });

    describe('drawFocusLine', () => {
        let xScale, yScale;
        beforeEach(() => {
            xScale = scaleLinear().range([0, 100]).domain([1000, 1999]);
            yScale = scaleLinear().range([1, 49]);
        });

        it('expect that a line is drawn at the expected coordinates', () => {
            drawFocusLine(svg, {
               cursorTime : 1400,
               xScale,
               yScale
            });

            const line = svg.selectAll('line');
            expect(line.size()).toBe(1);
            expect(line.attr('y1')).toEqual('1');
            expect(line.attr('y2')).toEqual('49');
            expect(parseFloat(line.attr('x1'))).toBeCloseTo(40.0, 1);
            expect(parseFloat(line.attr('x2'))).toBeCloseTo(40.0, 1);
        });
    });
});