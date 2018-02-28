const { select } = require('d3-selection');

const { drawSimpleLegend, legendDisplaySelector, createLegendMarkers } = require('./legend');
const { lineMarker, circleMarker, rectangleMarker } = require('./markers');

describe('Legend module', () => {

    describe('drawSimpleLegend', () => {

        let svgNode;

        let legendMarkers = {
            current: [{
                type: lineMarker,
                length: 20,
                domId: 'some-id',
                domClass: 'some-class',
                text: 'Some Text',
                groupId: 'my-line-marker'
            }, {
                type: rectangleMarker,
                domId: 'some-rectangle-id',
                domClass: 'some-rectangle-class',
                text: 'Rectangle Marker',
                groupId: 'rectangle-marker-group'
            }],
            medianStatistics: [{
                type: circleMarker,
                r: 4,
                domId: null,
                domClass: 'some-other-class',
                text: 'Circle Text'
            }]
        };

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

        it('Adds a legend when width is provided', () => {
            drawSimpleLegend(svgNode, legendMarkers, {width: 100, height: 100});

            expect(svgNode.selectAll('.legend').size()).toBe(1);
            expect(svgNode.selectAll('line').size()).toBe(1);
            expect(svgNode.selectAll('circle').size()).toBe(1);
            expect(svgNode.selectAll('rect').size()).toBe(1);
            expect(svgNode.selectAll('text').size()).toBe(3);
            let line = svgNode.select('line');
            expect(line.attr('x1')).toBe('0');
            expect(line.attr('x2')).toBe('20');
            let circle = svgNode.select('circle');
            expect(circle.attr('class')).toBe('some-other-class');
            let rect = svgNode.select('rect');
            expect(rect.attr('class')).toBe('some-rectangle-class');
        });
    });

    describe('createLegendMarkers', () => {

        it('should return markers for display', () => {
            let result = createLegendMarkers({
                current: {masks: ['ice']},
                medianStatistics: {
                    beginYear: 2010,
                    endYear: 2012
                }
            });
            expect(result).toEqual({
                current: [
                    {
                        type: lineMarker,
                        domId: null,
                        domClass: 'line',
                        text: 'Current Year',
                        groupId: 'current-year-line-marker'
                    },
                    {
                        type: rectangleMarker,
                        domId: null,
                        domClass: 'mask ice-affected-mask',
                        text: 'Ice Affected',
                        groupId: null,
                        fill: 'url(#hash-45)'
                    }],
                compare: [],
                medianStatistics: [{
                    type: circleMarker,
                    r: 4,
                    domId: null,
                    domClass: 'median-data-series',
                    groupId: null,
                    text: 'Median 2010 - 2012',
                    fill: null
                }]
            });
        });

        it('should return an object with no markers', () => {
            let result = createLegendMarkers({});
            expect(result.current.length).toEqual(0);
            expect(result.compare.length).toEqual(0);
            expect(result.medianStatistics.length).toEqual(0);

        });

        it('should still work if stat begin and end years are absent', () => {
            let result = createLegendMarkers({
                medianStatistics: {
                    beginYear: undefined,
                    endYear: undefined
                }
            });
            expect(result.medianStatistics[0].text).toEqual('Median ');
        });
    });

    describe('legendDisplaySelector', () => {

        it('should return a marker if a time series is shown', () => {
            let result = legendDisplaySelector({
                tsData: {
                    medianStatistics: {
                        '00060': {
                            medianMetadata: {
                                beginYear: 2010,
                                endYear: 2012
                            }
                        }
                    }
                },
                showSeries: {
                    current: true,
                    compare: false,
                    medianStatistics: true
                },
                currentParameterCode: '00060'
            });
            expect(result).toEqual({
                current: {masks: new Set()},
                medianStatistics: {
                    beginYear: 2010,
                    endYear: 2012,
                    description: ''
                }
            });
        });

        it('should not choke if medianMetadata years are absent', () => {
            let result = legendDisplaySelector({
                tsData: {
                    medianStatistics: {}
                },
                showSeries: {
                    medianStatistics: true
                }
            });
            expect(result.medianStatistics).toEqual({
                beginYear: undefined,
                endYear: undefined,
                description: ''
            });
        });
    });

});
