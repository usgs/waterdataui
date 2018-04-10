const { select } = require('d3-selection');

const { drawSimpleLegend, legendMarkerRowsSelector } = require('./legend');
const { lineMarker, circleMarker, rectangleMarker, textOnlyMarker } = require('./markers');

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
                type: circleMarker,
                r: 4,
                domId: null,
                domClass: 'some-other-class',
                text: 'Circle Text'
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

        it('Does not add a legend if the layout is null', () => {
            drawSimpleLegend(container, {
                legendMarkerRows: legendMarkerRows,
                layout: undefined
            });

            expect(container.select('svg').size()).toBe(0);
        });

        it('Adds a legend when width is provided', () => {
            drawSimpleLegend(container, {legendMarkerRows, layout});

            expect(container.select('svg').size()).toBe(1);
            expect(container.selectAll('line').size()).toBe(1);
            expect(container.selectAll('circle').size()).toBe(1);
            expect(container.selectAll('rect').size()).toBe(1);
            expect(container.selectAll('text').size()).toBe(4);
        });
    });

    describe('legendMarkerRowSelector', () => {

        const TEST_DATA = {
            series: {
                timeSeries: {
                    '00060:current': {
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

                    '00065:compare': {
                        tsKey: 'compare',
                        startTime: new Date('2017-03-06T15:45:00.000Z'),
                        endTime: new Date('2017-03-13t13:45:00.000Z'),
                        variable: '45807202',
                        points: [{
                            value: 1,
                            qualifiers: ['A'],
                            approved: false,
                            estimated: false
                        }, {
                            value: 2,
                            qualifiers: ['A'],
                            approved: false,
                            estimated: false
                        }, {
                            value: 3,
                            qualifiers: ['E'],
                            approved: false,
                            estimated: false
                        }]
                    },
                    '00065:median': {
                        tsKey: 'median',
                        startTime: new Date('2007-03-06T15:45:00.000Z'),
                        endTime: new Date('2017-03-13t13:45:00.000Z'),
                        variable: '45807202',
                        points: [{
                            value: 1
                        }, {
                            value: 2
                        }, {
                            value: 3
                        }],
                        metadata: {
                            beginYear: '1931',
                            endYear: '2017'
                        }
                    }
                },
                variables: {
                    '45807197': {
                        variableCode: {value: '00060'},
                        variableName: 'Streamflow',
                        variableDescription: 'Discharge, cubic feet per second',
                        oid: '45807197'
                    },
                    '45807202': {
                        variableCode: {value: '00065'},
                        variableName: 'Gage height',
                        oid: '45807202'
                    }
                }
            },
            currentVariableID: '45807197',
            showSeries: {
                current: true,
                compare: true,
                median: true
            }
        };

        it('Should return no markers if no timeseries to show', () => {
            let newData = {
                ...TEST_DATA,
                series: {
                    ...TEST_DATA.series,
                    timeSeries: {}
                }
            };

            expect(legendMarkerRowsSelector(newData)).toEqual([]);
        });

        it('Should return markers for the selected variable', () => {
            const result = legendMarkerRowsSelector(TEST_DATA);

            expect(result.length).toBe(1);
            expect(result[0].length).toBe(4);
            expect(result[0][0].type).toEqual(textOnlyMarker);
            expect(result[0][1].type).toEqual(lineMarker);
            expect(result[0][2].type).toEqual(rectangleMarker);
            expect(result[0][3].type).toEqual(rectangleMarker);
        });

        it('Should return markers for a different selected variable', () => {
            const newData = {
                ...TEST_DATA,
                currentVariableID: '45807202'
            };
            const result = legendMarkerRowsSelector(newData);

            expect(result.length).toBe(2);
            expect(result[0].length).toBe(3);
            expect(result[0][0].type).toEqual(textOnlyMarker);
            expect(result[0][1].type).toEqual(lineMarker);
            expect(result[0][2].type).toEqual(lineMarker);
            expect(result[1].length).toBe(2);
            expect(result[1][0].type).toEqual(textOnlyMarker);
            expect(result[1][1].type).toEqual(circleMarker);
        });

        it('Should return markers only for time series shown', () => {
            const newData = {
                ...TEST_DATA,
                currentVariableID: '45807202',
                showSeries: {
                    'current': true,
                    'compare': false,
                    'median': true
                }
            };

            const result = legendMarkerRowsSelector(newData);

            expect(result.length).toBe(1);
            expect(result[0].length).toBe(2);
            expect(result[0][0].type).toEqual(textOnlyMarker);
            expect(result[0][1].type).toEqual(circleMarker);
        });
    });
});
