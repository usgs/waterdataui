import {select} from 'd3-selection';
import {lineMarker, rectangleMarker, textOnlyMarker} from 'd3render/markers';
import {drawSimpleLegend} from 'd3render/legend';

describe('Legend module', () => {

    describe('drawSimpleLegend', () => {
        let container;

        const legendMarkerRows = [
            [{
                type: lineMarker,
                length: 20,
                domId: 'some-id',
                domClass: 'some-class',
                text: 'Some Text'
            }, {
                type: rectangleMarker,
                domId: 'some-rectangle-id',
                domClass: 'some-rectangle-class',
                text: 'Rectangle Marker'
            }],
            [{
                type: textOnlyMarker,
                domId: 'text-id',
                domClass: 'text-class',
                text: 'Label'
            }, {
                type: lineMarker,
                domId: null,
                domClass: 'some-other-class',
                text: 'Median Label'
            }]
        ];
        const layout = {
            width: 100,
            height: 100,
            margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            }
        };

        beforeEach(() => {
            container = select('body').append('div');
        });

        afterEach(() => {
            container.remove();
        });

        it('Does not add a legend svg if no markers are provided', () => {
            drawSimpleLegend(container, {
                legendMarkerRows: [],
                layout: layout
            });

            expect(container.select('svg').size()).toBe(0);
        });

        it('Adds a legend when width is provided', () => {
            drawSimpleLegend(container, {legendMarkerRows, layout});

            expect(container.select('svg').size()).toBe(1);
            expect(container.selectAll('line').size()).toBe(2);
            expect(container.selectAll('rect').size()).toBe(1);
            expect(container.selectAll('text').size()).toBe(4);
        });
    });
});
