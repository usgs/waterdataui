const { namespaces } = require('d3');
const { select, selectAll } = require('d3-selection');

const { drawSimpleLegend } = require('./legend');
const { lineMarker, circleMarker } = require('./markers');

describe('Legend module', () => {

    describe('drawSimpleLegend', () => {

        let testDiv = document.createElement('div');
        let svgNode;

        let legendMarkers = [
            {
                type: lineMarker,
                length: 20,
                domId: 'some-id',
                domClass: 'some-class',
                text: 'Some Text',
                groupId: 'my-line-marker'
            },
            {
                type: circleMarker,
                r: 4,
                domId: null,
                domClass: 'some-other-class',
                text: 'Circle Text'
            }
        ];

        beforeEach(() => {
            svgNode = select('body').append('svg')
                .style('width', '800px')
                .style('height', '400px')
                .attr('viewBox', '0 0 800 400')
                .attr('preserveAspectRatio', 'xMinYMin meet');
        });

        afterEach(() => {
            svgNode.remove();
        });

        it('Adds a legend', () => {
            drawSimpleLegend(svgNode, legendMarkers);
            expect(svgNode.selectAll('.legend').size()).toBe(1);
            expect(svgNode.selectAll('line').size()).toBe(1);
            expect(svgNode.selectAll('circle').size()).toBe(1);
            expect(svgNode.selectAll('text').size()).toBe(2);
            let line = svgNode.select('line');
            expect(line.attr('x1')).toBe('0');
            expect(line.attr('x2')).toBe('20');
            let circle = svgNode.select('circle');
            expect(circle.attr('cx')).toBeCloseTo(154);
            expect(circle.attr('class')).toBe('some-other-class');
        });

    });

});