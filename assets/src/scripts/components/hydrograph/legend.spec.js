import { select } from 'd3-selection';
import { drawSimpleLegend, legendMarkerRowsSelector } from './legend';
import { lineMarker, rectangleMarker, textOnlyMarker } from './markers';

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
            expect(container.selectAll('line').size()).toBe(2);
            expect(container.selectAll('rect').size()).toBe(1);
            expect(container.selectAll('text').size()).toBe(4);
        });
    });

    describe('legendMarkerRowSelector', () => {

        const TEST_DATA = {
            series: {
                timeSeries: {
                    '00060:current': {
                        tsKey: 'current:P7D',
                        startTime: new Date('2018-03-06T15:45:00.000Z'),
                        endTime: new Date('2018-03-13T13:45:00.000Z'),
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
                        tsKey: 'compare:P7D',
                        startTime: new Date('2017-03-06T15:45:00.000Z'),
                        endTime: new Date('2017-03-13T13:45:00.000Z'),
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
            statisticsData: {
                median: {
                    '00060': {
                        '1': [{
                            month_nu: '2',
                            day_nu: '25',
                            p50_va: '43',
                            begin_yr: '1970',
                            end_yr: '2017',
                            loc_web_ds: 'This method'
                        }]
                    }
                }
            },
            timeSeriesState: {
                currentVariableID: '45807197',
                currentDateRange: 'P7D',
                showSeries: {
                    current: true,
                    compare: true,
                    median: true
                }
            }
        };

        it('Should return no markers if no time series to show', () => {
            let newData = {
                ...TEST_DATA,
                series: {
                    ...TEST_DATA.series,
                    timeSeries: {}
                },
                statisticsData: {}
            };

            expect(legendMarkerRowsSelector(newData)).toEqual([]);
        });

        it('Should return markers for the selected variable', () => {
            const result = legendMarkerRowsSelector(TEST_DATA);

            expect(result.length).toBe(2);
            expect(result[0].length).toBe(4);
            expect(result[0][0].type).toEqual(textOnlyMarker);
            expect(result[0][1].type).toEqual(lineMarker);
            expect(result[0][2].type).toEqual(rectangleMarker);
            expect(result[0][3].type).toEqual(rectangleMarker);
            expect(result[1].length).toBe(2);
            expect(result[1][0].type).toEqual(textOnlyMarker);
            expect(result[1][1].type).toEqual(lineMarker);
        });

        it('Should return markers for a different selected variable', () => {
            const newData = {
                ...TEST_DATA,
                timeSeriesState: {
                    ...TEST_DATA.timeSeriesState,
                    currentVariableID: '45807202'
                }
            };
            const result = legendMarkerRowsSelector(newData);

            expect(result.length).toBe(1);
            expect(result[0].length).toBe(3);
            expect(result[0][0].type).toEqual(textOnlyMarker);
            expect(result[0][1].type).toEqual(lineMarker);
            expect(result[0][2].type).toEqual(lineMarker);
        });

        it('Should return markers only for time series shown', () => {
            const newData = {
                ...TEST_DATA,
                timeSeriesState: {
                    ...TEST_DATA.timeSeriesState,
                    showSeries: {
                        'current': true,
                        'compare': false,
                        'median': false
                    }
                }
            };

            const result = legendMarkerRowsSelector(newData);

            expect(result.length).toBe(1);
            expect(result[0].length).toBe(4);
            expect(result[0][0].type).toEqual(textOnlyMarker);
            expect(result[0][1].type).toEqual(lineMarker);
            expect(result[0][2].type).toEqual(rectangleMarker);
            expect(result[0][3].type).toEqual(rectangleMarker);
        });
    });
});
