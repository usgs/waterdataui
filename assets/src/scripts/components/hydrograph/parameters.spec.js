const { select } = require('d3-selection');
const { scaleLinear } = require('d3-scale');

const { addSparkLine, availableTimeseriesSelector, plotSeriesSelectTable } = require('./parameters');


describe('Parameters module', () => {

    describe('availableTimeseriesSelector', () => {
        it('sets attributes correctly when all series have data points', () => {
            const available = availableTimeseriesSelector({
                series: {
                    timeSeries: {
                        'current:00060': {description: '00060', tsKey: 'current', variable: 'code0', points: [{x: 1, y: 2}]},
                        'current:00061': {description: '00061', tsKey: 'current', variable: 'code1', points: [{x: 2, y: 3}]},
                        'current:00062': {description: '00062', tsKey: 'current', variable: 'code2', points: [{x: 3, y: 4}]},
                        'compare:00061': {description: '00061', tsKey: 'compare', variable: 'code1', points: [{x: 1, y: 17}]},
                        'compare:00062': {description: '00062', tsKey: 'compare', variable: 'code2', points: [{x: 2, y: 18}]},
                        'compare:00063': {description: '00063', tsKey: 'compare', variable: 'code3', points: [{x: 3, y: 46}]}
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
                currentVariableID: 'code0'
            });
            // Series are ordered by parameter code and have expected values.
            expect(available).toEqual([
                ['00060', {variableID: 'code0', description: 'code0 desc', selected: true, currentTimeseriesCount: 1, compareTimeseriesCount: 0, medianTimeseriesCount: 0}],
                ['00061', {variableID: 'code1', description: 'code1 desc', selected: false, currentTimeseriesCount: 1, compareTimeseriesCount: 1, medianTimeseriesCount: 0}],
                ['00062', {variableID: 'code2', description: 'code2 desc', selected: false, currentTimeseriesCount: 1, compareTimeseriesCount: 1, medianTimeseriesCount: 0}],
                ['00063', {variableID: 'code3', description: 'code3 desc', selected: false, currentTimeseriesCount: 0, compareTimeseriesCount: 1, medianTimeseriesCount: 0}]
            ]);
        });

        it('sets attributes correctly when not all series have data points', () => {
            const available = availableTimeseriesSelector({
                series: {
                    timeSeries: {
                        'current:00060': {description: '00060', tsKey: 'current', variable: 'code0', points: [{x: 1, y: 2}]},
                        'current:00061': {description: '00061', tsKey: 'current', variable: 'code1', points: [{x: 2, y: 3}]},
                        'current:00062': {description: '00062', tsKey: 'current', variable: 'code2', points: [{x: 3, y: 4}]},
                        'compare:00061': {description: '00061', tsKey: 'compare', variable: 'code1', points: []},
                        'compare:00062': {description: '00062', tsKey: 'compare', variable: 'code2', points: [{x: 2, y: 18}]},
                        'compare:00063': {description: '00063', tsKey: 'compare', variable: 'code3', points: [{x: 3, y: 46}]}
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
                currentVariableID: 'code0'
            });
            // Series are ordered by parameter code and have expected values.
            expect(available).toEqual([
                ['00060', {variableID: 'code0', description: 'code0 desc', selected: true, currentTimeseriesCount: 1, compareTimeseriesCount: 0, medianTimeseriesCount: 0}],
                ['00061', {variableID: 'code1', description: 'code1 desc', selected: false, currentTimeseriesCount: 1, compareTimeseriesCount: 0, medianTimeseriesCount: 0}],
                ['00062', {variableID: 'code2', description: 'code2 desc', selected: false, currentTimeseriesCount: 1, compareTimeseriesCount: 1, medianTimeseriesCount: 0}],
                ['00063', {variableID: 'code3', description: 'code3 desc', selected: false, currentTimeseriesCount: 0, compareTimeseriesCount: 1, medianTimeseriesCount: 0}]
            ]);
        });

        it('timeseries without data points are considered unavailable', () => {
            const available = availableTimeseriesSelector({
                series: {
                    timeSeries: {
                        'current:00060': {description: '00060', tsKey: 'current', variable: 'code0', points: [{x: 1, y: 2}]},
                        'current:00061': {description: '00061', tsKey: 'current', variable: 'code1', points: []},
                        'current:00062': {description: '00062', tsKey: 'current', variable: 'code2', points: [{x: 3, y: 4}]},
                        'compare:00061': {description: '00061', tsKey: 'compare', variable: 'code1', points: []},
                        'compare:00062': {description: '00062', tsKey: 'compare', variable: 'code2', points: [{x: 2, y: 18}]},
                        'compare:00063': {description: '00063', tsKey: 'compare', variable: 'code3', points: [{x: 3, y: 46}]}
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
                currentVariableID: 'code0'
            });
            // Series are ordered by parameter code and have expected values.
            expect(available).toEqual([
                ['00060', {variableID: 'code0', description: 'code0 desc', selected: true, currentTimeseriesCount: 1, compareTimeseriesCount: 0, medianTimeseriesCount: 0}],
                ['00062', {variableID: 'code2', description: 'code2 desc', selected: false, currentTimeseriesCount: 1, compareTimeseriesCount: 1, medianTimeseriesCount: 0}],
                ['00063', {variableID: 'code3', description: 'code3 desc', selected: false, currentTimeseriesCount: 0, compareTimeseriesCount: 1, medianTimeseriesCount: 0}]
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

        const availableTimeseries = [
            ['00010', {variableID: '00010ID', description: 'Temperature', selected: true, currentTimeseriesCount: 1, compareTimeseriesCount: 1}],
            ['00067', {variableID: '00067ID', description: 'Ruthenium (VI) Fluoride', selected: false, currentTimeseriesCount: 1, compareTimeseriesCount: 1}],
            ['00093', {variableID: '00093ID', description: 'Uranium (V) Oxide', selected: false, currentTimeseriesCount: 1, compareTimeseriesCount: 1}]
        ];

        const lineSegmentsByParmCd = {
            '00010': [[{'classes': {approved: false, estimated: false, dataMask: null}, points: data}]],
            '00093': [[{'classes': {approved: false, estimated: false, dataMask: null}, points: data}]]
        };

        const timeSeriesScalesByParmCd = {
            '00010': {x: scaleLinear(new Date(2018, 0, 12), new Date(2018, 0, 16)), y: scaleLinear(0, 100)},
            '00093': {x: scaleLinear(new Date(2018, 0, 12), new Date(2018, 0, 16)), y: scaleLinear(0, 100)}
        };

        const layout = {
            width: 800,
            height: 400,
            windowWidth: 1080
        };

        const testArgsWithData = {
            availableTimeseries: availableTimeseries,
            lineSegmentsByParmCd: lineSegmentsByParmCd,
            timeSeriesScalesByParmCd: timeSeriesScalesByParmCd,
            layout: layout
        };

        const testArgsWithoutData = {
            availableTimeseries: [],
            lineSegmentsByParmCd: {},
            timeSeriesScalesByParmCd: {},
            layout: layout
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
        const tsDataSingle = {
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

        it('adds a path for a line', () => {
            addSparkLine(svg, tsDataSingle);
            expect(svg.selectAll('path').size()).toEqual(1);
        });

        it('does not add a path for masked data', () => {
            addSparkLine(svg, tsDataMasked);
            expect(svg.selectAll('path').size()).toEqual(0);
        });

        it('adds multiple paths if there are breaks in the data', () => {
            addSparkLine(svg, tsDataMixed);
            expect(svg.selectAll('path').size()).toEqual(2);
        });
    });
});