const { lineMarker, circleMarker, rectangleMarker } = require('./markers');

describe('Markers module', () => {

    describe('linkMarker', () => {

        let x = 0;
        let y = 0;
        let length = 20;
        let domId = 'line-id';
        let domClass = 'line-class';

        it('returns an SVG line element', () => {
            let lineGroup = lineMarker({x: x, y: y, length: length});
            let node = lineGroup.select('line').node();
            expect(node.getAttribute('x1')).toBe('0');
            expect(node.getAttribute('x2')).toBe('20');
            expect(node.getAttribute('y1')).toBe('0');
            expect(node.getAttribute('y2')).toBe('0');
        });

        it('returns an SVG line with id and class', () => {
            let lineGroup = lineMarker({x: x, y: y, length: length, domId: domId, domClass: domClass});
            let node = lineGroup.select('line').node();
            expect(node.getAttribute('x1')).toBe('0');
            expect(node.getAttribute('x2')).toBe('20');
            expect(node.getAttribute('y1')).toBe('0');
            expect(node.getAttribute('y2')).toBe('0');
            expect(node.getAttribute('class')).toBe(domClass);
            expect(node.getAttribute('id')).toBe(domId);
        });
    });

    describe('circleMarker', () => {
        let r = 10;
        let x = 2;
        let y = 9;
        let domId = 'circle-id';
        let domClass = 'circle-class';

        it('returns circle element with correct attributes', () => {
            let circleGroup = circleMarker({r: r, x: x, y: y});
            let node = circleGroup.select('circle').node();
            expect(node.nodeName).toBe('circle');
            expect(node.getAttribute('r')).toBe('10');
            expect(node.getAttribute('cx')).toBe('2');
            expect(node.getAttribute('cy')).toBe('9');
        });

        it('returns circle element with id and class', () => {
            let circleGroup = circleMarker({r: r, x: x, y: y, domId: domId, domClass: domClass});
            let node = circleGroup.select('circle').node();
            expect(node.nodeName).toBe('circle');
            expect(node.getAttribute('r')).toBe('10');
            expect(node.getAttribute('cx')).toBe('2');
            expect(node.getAttribute('cy')).toBe('9');
            expect(node.getAttribute('class')).toBe(domClass);
            expect(node.getAttribute('id')).toBe(domId);
        });

        it('returns two circles if a fill is provided', () => {
            let circleGroup = circleMarker({r: r, x: x, y: y, fill: 'green'});
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
            let rectangleGroup = rectangleMarker({x: x, y: y, width: width, height: height});
            let node = rectangleGroup.select('rect').node();
            expect(node.getAttribute('x')).toBe('3');
            expect(node.getAttribute('y')).toBe('-6');
            expect(node.getAttribute('width')).toBe('20');
            expect(node.getAttribute('height')).toBe('10');
        });

        it('returns a group containing a rectangle with id and class', () => {
            let rectangleGroup = rectangleMarker({
                x: x,
                y: y,
                width: width,
                height: height,
                domClass: domClass,
                domId: domId
            });
            let node = rectangleGroup.select('rect').node();
            expect(node.getAttribute('x')).toBe('3');
            expect(node.getAttribute('y')).toBe('-6');
            expect(node.getAttribute('width')).toBe('20');
            expect(node.getAttribute('height')).toBe('10');
            expect(node.getAttribute('class')).toBe(domClass);
            expect(node.getAttribute('id')).toBe(domId);
        });

        it('returns two rectangles if fill is provided', () => {
            let rectangleGroup = rectangleMarker({x: x, y: y, width: width, height: height, fill: 'green'});
            let rectangles = rectangleGroup.selectAll('rect');
            expect(rectangles.size()).toEqual(2);
        });
    });

});
