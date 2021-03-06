import {select} from 'd3-selection';

import * as utils from 'ui/utils';

import {drawSimpleLegend} from './legend';
import {circleMarker, lineMarker, rectangleMarker, textOnlyMarker} from './markers';

describe('Legend module', () => {

    utils.mediaQuery = jest.fn().mockReturnValue(true);
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
            }, {
                type: circleMarker,
                domId: null,
                domClass: 'circle-marker-class',
                text: 'Circle Marker label',
                radius: 5
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

        it('If no markers are provided legend-svg will contain no groups', () => {
            drawSimpleLegend(container, {
                legendMarkerRows: [],
                layout: layout
            });

            expect(container.select('svg g').size()).toBe(0);
        });

        it('Adds a legend when width is provided', () => {
            drawSimpleLegend(container, {legendMarkerRows, layout});

            expect(container.select('svg').size()).toBe(1);
            expect(container.selectAll('line').size()).toBe(2);
            expect(container.selectAll('rect').size()).toBe(1);
            expect(container.selectAll('text').size()).toBe(5);
            expect(container.selectAll('circle').size()).toBe(1);
        });
    });
});
