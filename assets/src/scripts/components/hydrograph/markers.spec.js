const { lineMarker, circleMarker } = require('./markers');

describe('Markers module', () => {

    describe('linkMarker', () => {

        let x = 0;
        let y = 0;
        let length = 20;

        it('Returns an SVG line element', () => {
            let line = lineMarker({x: x, y: y, length: length});
            let node = line.node();
            expect(node.getAttribute('x1')).toBe('0');
            expect(node.getAttribute('x2')).toBe('20');
            expect(node.getAttribute('y1')).toBe('0');
            expect(node.getAttribute('y2')).toBe('0');
            expect(node.nodeName).toBe('line');
        });
    });

    describe('circleMarker', () => {
        let r = 10;
        let x = 2;
        let y = 9;

        it('Returns circle element with correct attributes', () => {
            let circle = circleMarker({r: r, x: x, y: y});
            let node = circle.node();
            expect(node.nodeName).toBe('circle');
            expect(node.getAttribute('r')).toBe('10');
            expect(node.getAttribute('cx')).toBe('2');
            expect(node.getAttribute('cy')).toBe('9');
        });
    });

});
