const { select } = require('d3-selection');

const { drawSimpleLegend, legendDisplaySelector, createLegendMarkers } = require('./legend');
const { lineMarker, circleMarker, rectangleMarker } = require('./markers');
jasmine.pp = function (obj) {
    return JSON.stringify(obj, undefined, 4);
};
describe('Legend module', () => {

    describe('drawSimpleLegend', () => {

        let svgNode;

        let legendMarkerRows = [
            [{
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
            [{
                type: circleMarker,
                r: 4,
                domId: null,
                domClass: 'some-other-class',
                text: 'Circle Text'
            }]
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

        it('Adds a legend when width is provided', () => {
            drawSimpleLegend(svgNode, {legendMarkerRows, layout: {
                width: 100,
                height: 100,
                margin: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }
            }});

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
                median: [{
                    beginYear: 2010,
                    endYear: 2012
                }]
            });
            expect(result).toEqual([
                [{
                    type: lineMarker,
                    domId: 'ts-legend-current',
                    domClass: 'line-segment',
                    text: 'Current Year',
                    groupId: 'current-year-line-marker'
                }, {
                    type: rectangleMarker,
                    domId: null,
                    domClass: 'mask ice-affected-mask',
                    text: 'Ice Affected',
                    groupId: null,
                    fill: 'url(#hash-45)'
                }], [{
                    type: circleMarker,
                    r: 4,
                    domId: null,
                    domClass: 'median-data-series median-modulo-0',
                    groupId: null,
                    text: 'Median 2010 - 2012',
                    fill: null
                }]
            ]);
        });

        it('should return an object with no markers', () => {
            let result = createLegendMarkers({});
            expect(result.length).toEqual(0);

        });

        it('should still work if stat begin and end years are absent', () => {
            let result = createLegendMarkers({
                median: [{
                    beginYear: undefined,
                    endYear: undefined
                }]
            });
            expect(result).toEqual([
                [{
                    type: circleMarker,
                    r: 4,
                    domId: null,
                    domClass: 'median-data-series median-modulo-0',
                    groupId: null,
                    text: 'Median ',
                    fill: null
                }]
            ]);
        });
    });

    describe('legendDisplaySelector', () => {

        it('should return a marker if a time series is shown', () => {
            let result = legendDisplaySelector({
                series: {
                    timeSeries: {
                        medianTS: {
                            startTime: new Date('2010-10-10'),
                            endTime: new Date('2012-10-10'),
                            method: 'methodID',
                            points: [1, 2, 3],
                            tsKey: 'median',
                            variable: '00060ID',
                            metadata: {
                                beginYear: '2010',
                                endYear: '2012'
                            }
                        }
                    },
                    methods: {
                        methodID: {
                            methodDescription: 'method description'
                        }
                    },
                    timeSeriesCollections: {
                        collectionID: {
                            variable: '00060ID',
                            timeSeries: ['medianTS']
                        }
                    },
                    requests: {
                        median: {
                            timeSeriesCollections: ['collectionID']
                        }
                    },
                    variables: {
                        '00060ID': {
                            variableCode: {value: '00060'},
                            oid: '00060ID'
                        }
                    }
                },
                showSeries: {
                    current: true,
                    compare: false,
                    median: true
                },
                currentVariableID: '00060ID'
            });
            expect(result).toEqual({
                current: {masks: new Set()},
                compare: undefined,
                median: [{
                    beginYear: '2010',
                    endYear: '2012',
                    description: 'method description'
                }]
            });
        });

        fit('Should return the masks marker for the selected time series', () => {
            const TEST_DATA = {
                series: {
                    timeSeries: {
                        '00060': {
                            tsKey: 'current',
                            startTime: new Date('2018-03-06T15:45:00.000Z'),
                            endTime: new Date('2018-03-13t13:45:00.000Z'),
                            variable: '45807197',
                            points: [{
                                value: 10,
                                qualifiers: ['P'],
                                approved: false,
                                estimated: false
                            }, {
                                value: null,
                                qualifiers: ['P', 'ICE'],
                                approved: false,
                                estimated: false
                            }, {
                                value: null,
                                qualifiers: ['P', 'FLD'],
                                approved: false,
                                estimated: false
                            }]
                        },
                        '00010': {
                            tsKey: 'compare',
                            startTime: new Date('2017-03-06T15:45:00.000Z'),
                            endTime: new Date('2017-03-13t13:45:00.000Z'),
                            variable: '45807196',
                            points: [{
                                value: 1,
                                qualifiers: ['P'],
                                approved: false,
                                estimated: false
                            }, {
                                value: 2,
                                qualifiers: ['P'],
                                approved: false,
                                estimated: false
                            }, {
                                value: 3,
                                qualifiers: ['P'],
                                approved: false,
                                estimated: false
                            }]
                        }
                    },
                    variables: {
                        '45807197': {
                            variableCode: {value: '00060'},
                            variableName: 'Streamflow',
                            variableDescription: 'Discharge, cubic feet per second',
                            oid: '45807197'
                        },
                        '45807196': {
                            variableCode: {value: '00010'},
                            variableName: 'Gage Height',
                            variableDescription: 'Gage Height in feet',
                            oid: '45807196'
                        }
                    }
                },
                showSeries: {
                    current: true
                }
            };

            let result = legendDisplaySelector({
                ...TEST_DATA,
                currentVariableID: '45807197'
            });
            expect([...result.current.masks]).toEqual(['ice', 'fld']);

            result = legendDisplaySelector({
                ...TEST_DATA,
                currentVariableID: '45807196'
            });
            expect([...result.current.masks]).toEqual([]);
        });

        it('should not choke if median time series is absent', () => {
            let result = legendDisplaySelector({
                series: {},
                showSeries: {
                    median: true
                }
            });
            expect(result.median).toEqual([]);
        });
    });
});
