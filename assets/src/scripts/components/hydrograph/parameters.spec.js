const { select } = require('d3-selection');
const { scaleLinear } = require('d3-scale');

const { addSparkLine, availableTimeSeriesSelector, plotSeriesSelectTable } = require('./parameters');


describe('Parameters module', () => {

    describe('availableTimeSeriesSelector', () => {
        it('sets attributes correctly when all series have data points', () => {
            const available = availableTimeSeriesSelector({
                series: {
                    timeSeries: {
                        'current:00060': {description: '00060', tsKey: 'current:P7D', variable: 'code0', points: [{x: 1, y: 2}]},
                        'current:00061': {description: '00061', tsKey: 'current:P7D', variable: 'code1', points: [{x: 2, y: 3}]},
                        'current:00062': {description: '00062', tsKey: 'current:P7D', variable: 'code2', points: [{x: 3, y: 4}]},
                        'compare:00061': {description: '00061', tsKey: 'compare:P7D', variable: 'code1', points: [{x: 1, y: 17}]},
                        'compare:00062': {description: '00062', tsKey: 'compare:P7D', variable: 'code2', points: [{x: 2, y: 18}]},
                        'compare:00063': {description: '00063', tsKey: 'compare:P7D', variable: 'code3', points: [{x: 3, y: 46}]}
                    },
                    variables: {
                        'code0': {
                            oid: 'code0',
                            variableDescription: 'code0 desc',
                            variableCode: {
                                value: '00060'
                            }
                        },
                        'code1': {
                            oid: 'code1',
                            variableDescription: 'code1 desc',
                            variableCode: {
                                value: '00061'
                            }
                        },
                        'code2': {
                            oid: 'code2',
                            variableDescription: 'code2 desc',
                            variableCode: {
                                value: '00062'
                            }
                        },
                        'code3': {
                            oid: 'code3',
                            variableDescription: 'code3 desc',
                            variableCode: {
                                value: '00063'
                            }
                        }
                    }
                },
                timeSeriesState: {
                    currentVariableID: 'code0'
                }
            });
            // Series are ordered by parameter code and have expected values.
            expect(available).toEqual([
                ['00060', {variableID: 'code0', description: 'code0 desc', selected: true, currentTimeSeriesCount: 1}],
                ['00061', {variableID: 'code1', description: 'code1 desc', selected: false, currentTimeSeriesCount: 1}],
                ['00062', {variableID: 'code2', description: 'code2 desc', selected: false, currentTimeSeriesCount: 1}]
            ]);
        });

        it('sets attributes correctly when not all series have data points', () => {
            const available = availableTimeSeriesSelector({
                series: {
                    timeSeries: {
                        'current:00060': {description: '00060', tsKey: 'current:P7D', variable: 'code0', points: [{x: 1, y: 2}]},
                        'current:00061': {description: '00061', tsKey: 'current:P7D', variable: 'code1', points: [{x: 2, y: 3}]},
                        'current:00062': {description: '00062', tsKey: 'current:P7D', variable: 'code2', points: [{x: 3, y: 4}]},
                        'compare:00061': {description: '00061', tsKey: 'compare:P7D', variable: 'code1', points: []},
                        'compare:00062': {description: '00062', tsKey: 'compare:P7D', variable: 'code2', points: [{x: 2, y: 18}]},
                        'compare:00063': {description: '00063', tsKey: 'compare:P7D', variable: 'code3', points: [{x: 3, y: 46}]}
                    },
                    variables: {
                        'code0': {
                            oid: 'code0',
                            variableDescription: 'code0 desc',
                            variableCode: {
                                value: '00060'
                            }
                        },
                        'code1': {
                            oid: 'code1',
                            variableDescription: 'code1 desc',
                            variableCode: {
                                value: '00061'
                            }
                        },
                        'code2': {
                            oid: 'code2',
                            variableDescription: 'code2 desc',
                            variableCode: {
                                value: '00062'
                            }
                        },
                        'code3': {
                            oid: 'code3',
                            variableDescription: 'code3 desc',
                            variableCode: {
                                value: '00063'
                            }
                        }
                    }
                },
                timeSeriesState: {
                    currentVariableID: 'code0'
                }
            });
            // Series are ordered by parameter code and have expected values.
            expect(available).toEqual([
                ['00060', {variableID: 'code0', description: 'code0 desc', selected: true, currentTimeSeriesCount: 1}],
                ['00061', {variableID: 'code1', description: 'code1 desc', selected: false, currentTimeSeriesCount: 1}],
                ['00062', {variableID: 'code2', description: 'code2 desc', selected: false, currentTimeSeriesCount: 1}]
            ]);
        });

        it('timeseries without data points are considered unavailable', () => {
            const available = availableTimeSeriesSelector({
                series: {
                    timeSeries: {
                        'current:00060': {description: '00060', tsKey: 'current:P7D', variable: 'code0', points: [{x: 1, y: 2}]},
                        'current:00061': {description: '00061', tsKey: 'current:P7D', variable: 'code1', points: []},
                        'current:00062': {description: '00062', tsKey: 'current:P7D', variable: 'code2', points: [{x: 3, y: 4}]},
                        'compare:00061': {description: '00061', tsKey: 'compare:P7D', variable: 'code1', points: []},
                        'compare:00062': {description: '00062', tsKey: 'compare:P7D', variable: 'code2', points: [{x: 2, y: 18}]},
                        'compare:00063': {description: '00063', tsKey: 'compare:P7D', variable: 'code3', points: [{x: 3, y: 46}]}
                    },
                    variables: {
                        'code0': {
                            oid: 'code0',
                            variableDescription: 'code0 desc',
                            variableCode: {
                                value: '00060'
                            }
                        },
                        'code1': {
                            oid: 'code1',
                            variableDescription: 'code1 desc',
                            variableCode: {
                                value: '00061'
                            }
                        },
                        'code2': {
                            oid: 'code2',
                            variableDescription: 'code2 desc',
                            variableCode: {
                                value: '00062'
                            }
                        },
                        'code3': {
                            oid: 'code3',
                            variableDescription: 'code3 desc',
                            variableCode: {
                                value: '00063'
                            }
                        }
                    }
                },
                timeSeriesState: {
                    currentVariableID: 'code0'
                }
            });
            // Series are ordered by parameter code and have expected values.
            expect(available).toEqual([
                ['00060', {variableID: 'code0', description: 'code0 desc', selected: true, currentTimeSeriesCount: 1}],
                ['00062', {variableID: 'code2', description: 'code2 desc', selected: false, currentTimeSeriesCount: 1}]
            ]);
        });
    });

    describe('plotSeriesSelectTable', () => {
        let tableDivSelection;

        const data = [12, 13, 14, 15, 16].map(day => {
            return {
                dateTime: new Date(`2018-01-${day}T00:00:00.000Z`),
                qualifiers: ['P'],
                value: day
            };
        });

        const availableTimeSeries = [
            ['00010', {variableID: '00010ID', description: 'Temperature', selected: true, currentTimeSeriesCount: 1}],
            ['00067', {variableID: '00067ID', description: 'Ruthenium (VI) Fluoride', selected: false, currentTimeSeriesCount: 1}],
            ['00093', {variableID: '00093ID', description: 'Uranium (V) Oxide', selected: false, currentTimeSeriesCount: 1}]
        ];

        const lineSegmentsByParmCd = {
            '00010': [[{'classes': {approved: false, estimated: false, dataMask: null}, points: data}]],
            '00093': [[{'classes': {approved: false, estimated: false, dataMask: null}, points: data}]]
        };

        const timeSeriesScalesByParmCd = {
            '00010': {x: scaleLinear(new Date(2018, 0, 12), new Date(2018, 0, 16)), y: scaleLinear(0, 100)},
            '00093': {x: scaleLinear(new Date(2018, 0, 12), new Date(2018, 0, 16)), y: scaleLinear(0, 100)}
        };

        const testArgsWithData = {
            siteno: '12345678',
            availableTimeSeries: availableTimeSeries,
            lineSegmentsByParmCd: lineSegmentsByParmCd,
            timeSeriesScalesByParmCd: timeSeriesScalesByParmCd
        };

        const testArgsWithoutData = {
            availableTimeSeries: [],
            lineSegmentsByParmCd: {},
            timeSeriesScalesByParmCd: {}
        };

        beforeEach(() => {
            tableDivSelection = select('body').append('div');
        });

        afterEach(() => {
            select('div').remove();
        });

        it('creates a row for each parameter in a table', () => {
            plotSeriesSelectTable(tableDivSelection, testArgsWithData);
            expect(tableDivSelection.selectAll('tbody tr').size()).toEqual(3);
        });

        it('creates a the correct number svg sparklines in a table', () => {
            plotSeriesSelectTable(tableDivSelection, testArgsWithData);
            expect(tableDivSelection.selectAll('svg').size()).toEqual(3);
            expect(tableDivSelection.selectAll('svg path').size()).toEqual(2);
        });

        it('does not create the table when there are no timeseries', () => {
            plotSeriesSelectTable(tableDivSelection, testArgsWithoutData);
            expect(tableDivSelection.selectAll('table').size()).toEqual(0);
        });
    });



    describe('addSparkline', () => {
        let svg;
        const tsDataSinglePoint = {
            scales: {
                x: scaleLinear(new Date(2015, 1, 2), new Date(2015, 1, 3)),
                y: scaleLinear(0, 100)
            },
            seriesLineSegments: [
                {
                    classes: {approved: false, estimated: false, dataMask: null},
                    points: [
                        {dateTime: new Date(2015, 1, 2), value: 16}
                    ]
                }
            ]
        };
        const tsDataSingleLine = {
            scales: {
                x: scaleLinear(new Date(2015, 1, 2), new Date(2015, 1, 3)),
                y: scaleLinear(0, 100)
            },
            seriesLineSegments: [
                {
                    classes: {approved: false, estimated: false, dataMask: null},
                    points: [
                        {dateTime: new Date(2015, 1, 2), value: 16},
                        {dateTime: new Date(2015, 1, 3), value: 17}
                    ]
                }
            ]
        };
        const tsDataMasked = {
            scales: {
                x: scaleLinear(new Date(2015, 1, 2), new Date(2015, 1, 3)),
                y: scaleLinear(0, 100)
            },
            seriesLineSegments: [
                {
                    classes: {approved: false, estimated: false, dataMask: 'ice'},
                    points: [
                        {dateTime: new Date(2015, 1, 2), value: null},
                        {dateTime: new Date(2015, 1, 3), value: null}
                    ]
                }
            ]
        };

        const tsDataMasked2 = {
            scales: {
                x: scaleLinear(new Date(2015, 1, 2), new Date(2015, 1, 3)),
                y: scaleLinear(0, 100)
            },
            seriesLineSegments: [
                {
                    classes: {approved: false, estimated: false, dataMask: 'fld'},
                    points: [
                        {dateTime: new Date(2015, 1, 2), value: null},
                        {dateTime: new Date(2015, 1, 3), value: null}
                    ]
                }
            ]
        };
        const tsDataMultipleMasks = {
            scales: {
                x: scaleLinear(new Date(2015, 1, 13), new Date(2015, 1, 18)),
                y: scaleLinear(0, 100)
            },
            seriesLineSegments: [
                {
                    classes: {approved: false, estimated: false, dataMask: 'fld'},
                    points: [
                        {dateTime: new Date(2015, 1, 13), value: null},
                        {dateTime: new Date(2015, 1, 14), value: null}
                    ]
                },
                {
                    classes: {approved: false, estimated: false, dataMask: 'ice'},
                    points: [
                        {dateTime: new Date(2015, 1, 15), value: null},
                        {dateTime: new Date(2015, 1, 16), value: null}
                    ]
                }
            ]
        };
        const tsDataMixed = {
            scales: {
                x: scaleLinear(new Date(2015, 1, 13), new Date(2015, 1, 18)),
                y: scaleLinear(0, 100)
            },
            seriesLineSegments: [
                {
                    classes: {approved: false, estimated: false, dataMask: null},
                    points: [
                        {dateTime: new Date(2015, 1, 13), value: 84},
                        {dateTime: new Date(2015, 1, 14), value: 91}
                    ]
                },
                {
                    classes: {approved: false, estimated: false, dataMask: 'ice'},
                    points: [
                        {dateTime: new Date(2015, 1, 15), value: null},
                        {dateTime: new Date(2015, 1, 16), value: null}
                    ]
                },
                {
                    classes: {approved: false, estimated: false, dataMask: null},
                    points: [
                        {dateTime: new Date(2015, 1, 17), value: 77},
                        {dateTime: new Date(2015, 1, 18), value: 85}
                    ]
                }
            ]
        };

        beforeEach(() => {
            svg = select('body').append('svg');
        });

        afterEach(() => {
            select('svg').remove();
        });

        it('adds a point for a single point of data', () => {
            addSparkLine(svg, tsDataSinglePoint);
            expect(svg.selectAll('circle').size()).toEqual(1);
        });

        it('adds a path for a line', () => {
            addSparkLine(svg, tsDataSingleLine);
            expect(svg.selectAll('path').size()).toEqual(1);
        });

        it('adds multiline text for masked data if the label has more than one word', () => {
            addSparkLine(svg, tsDataMasked);
            expect(svg.selectAll('text.sparkline-text').size()).toEqual(1);
            expect(svg.selectAll('text.sparkline-text tspan').size()).toEqual(2);
        });

        it('adds a single line of text if mask label is one word', () => {
            addSparkLine(svg, tsDataMasked2);
            expect(svg.selectAll('text.sparkline-text').size()).toEqual(1);
            expect(svg.selectAll('text.sparkline-text tspan').size()).toEqual(0);
        });

        it('handles labels if there is more than one mask', () => {
            addSparkLine(svg, tsDataMultipleMasks);
            expect(svg.selectAll('text.sparkline-text').size()).toEqual(1);
            expect(svg.select('text.sparkline-text').text()).toEqual('Masked');
        });

        it('adds multiple paths if there are breaks in the data', () => {
            addSparkLine(svg, tsDataMixed);
            expect(svg.selectAll('path').size()).toEqual(2);
        });
    });
});
