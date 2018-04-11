const { select } = require('d3-selection');

const { lineMarker, circleMarker, rectangleMarker, textOnlyMarker } = require('./markers');

describe('Markers module', () => {

    let svg;
    beforeEach(() => {
       svg = select('body').append('svg');
    });

    afterEach(() => {
        svg.remove();
    });

    describe('lineMarker', () => {
        const x = 5;
        const y = 10;
        const length = 20;
        const domId = 'line-id';
        const domClass = 'line-class';

        it('returns an SVG line element', () => {
            let lineGroup = lineMarker(svg, {x: x, y: y, length: length});
            let node = lineGroup.select('line').node();

            expect(node.getAttribute('x1')).toBe('5');
            expect(node.getAttribute('x2')).toBe('25');
            expect(node.getAttribute('y1')).toBe('6');
            expect(node.getAttribute('y2')).toBe('6');
            expect(node.getAttribute('class')).toBeNull();
            expect(node.getAttribute('id')).toBeNull();
            expect(lineGroup.select('text').size()).toBe(0);
        });

        it('returns an SVG line with id and class', () => {
            let lineGroup = lineMarker(svg, {x: x, y: y, length: length, domId: domId, domClass: domClass});
            let node = lineGroup.select('line').node();

            expect(node.getAttribute('x1')).toBe('5');
            expect(node.getAttribute('x2')).toBe('25');
            expect(node.getAttribute('y1')).toBe('6');
            expect(node.getAttribute('y2')).toBe('6');
            expect(node.getAttribute('class')).toBe(domClass);
            expect(node.getAttribute('id')).toBe(domId);
        });

        it('Expects that the text appears after the line', () => {
            let lineGroup = lineMarker(svg, {x: x, y: y, length: length, text: 'Line'});
            let text = lineGroup.select('text');

            expect(text.size()).toBe(1);
            expect(text.text()).toBe('Line');
            expect(parseInt(text.attr('x'))).toBeGreaterThan(25);
        });
    });

    describe('circleMarker', () => {
        let r = 10;
        let x = 2;
        let y = 9;
        let domId = 'circle-id';
        let domClass = 'circle-class';

        it('returns circle element with correct attributes', () => {
            let circleGroup = circleMarker(svg, {r: r, x: x, y: y});
            let node = circleGroup.select('circle').node();

            expect(node.nodeName).toBe('circle');
            expect(node.getAttribute('r')).toBe('10');
            expect(node.getAttribute('cx')).toBe('2');
            expect(node.getAttribute('cy')).toBe('5');
        });

        it('returns circle element with id and class', () => {
            let circleGroup = circleMarker(svg, {r: r, x: x, y: y, domId: domId, domClass: domClass});
            let node = circleGroup.select('circle').node();

            expect(node.nodeName).toBe('circle');
            expect(node.getAttribute('r')).toBe('10');
            expect(node.getAttribute('cx')).toBe('2');
            expect(node.getAttribute('cy')).toBe('5');
            expect(node.getAttribute('class')).toBe(domClass);
            expect(node.getAttribute('id')).toBe(domId);
        });

        it('returns two circles if a fill is provided', () => {
            let circleGroup = circleMarker(svg, {r: r, x: x, y: y, fill: 'green'});
            let circles = circleGroup.selectAll('circle');

            expect(circles.size()).toEqual(2);
        });
    });

    describe('rectangleMarker', () => {
        let x = 3;
        let y = -6;
        let width = 20;
        let height = 10;
        let domId = 'rect-id';
        let domClass = 'rect-class';

        it('returns a group containing a rectangle', () => {
            let rectangleGroup = rectangleMarker(svg, {x: x, y: y, width: width, height: height});
            let node = rectangleGroup.select('rect').node();

            expect(node.getAttribute('x')).toBe('3');
            expect(node.getAttribute('y')).toBe('-16');
            expect(node.getAttribute('width')).toBe('20');
            expect(node.getAttribute('height')).toBe('10');
        });

        it('returns a group containing a rectangle with id and class', () => {
            let rectangleGroup = rectangleMarker(svg, {
                x: x,
                y: y,
                width: width,
                height: height,
                domClass: domClass,
                domId: domId
            });
            let node = rectangleGroup.select('rect').node();

            expect(node.getAttribute('x')).toBe('3');
            expect(node.getAttribute('y')).toBe('-16');
            expect(node.getAttribute('width')).toBe('20');
            expect(node.getAttribute('height')).toBe('10');
            expect(node.getAttribute('class')).toBe(domClass);
            expect(node.getAttribute('id')).toBe(domId);
        });

        it('returns two rectangles if fill is provided', () => {
            let rectangleGroup = rectangleMarker(svg, {x: x, y: y, width: width, height: height, fill: 'green'});
            let rectangles = rectangleGroup.selectAll('rect');

            expect(rectangles.size()).toEqual(2);
        });
    });

    describe('textOnlyMarker', () => {
        const x = 5;
        const y = 10;
        const text = 'Text only';
        const domId = 'text-only-marker';
        const domClass = 'text-only-marker-class';

        it('returns a single text element with the correct position', () => {
           const marker = textOnlyMarker(svg, {
               x: x,
               y: y,
               text: text
           });
           const markerText = marker.selectAll('text');

           expect(markerText.size()).toBe(1);
           expect(markerText.text()).toBe(text);
        });

        it('Returns a single text element with the expect id and class', () => {
            const marker = textOnlyMarker(svg, {
                x: x,
                y: y,
                text: text,
                domId: domId,
                domClass: domClass
            });
            const markerText = marker.selectAll('text');

            expect(markerText.attr('class')).toBe(domClass);
            expect(markerText.attr('id')).toBe(domId);
        });
    });

});
