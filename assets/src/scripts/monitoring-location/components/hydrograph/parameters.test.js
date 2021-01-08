import {scaleLinear} from 'd3-scale';
import {select} from 'd3-selection';

import config from 'ui/config';
import {configureStore} from 'ml/store';

import {addSparkLine, plotSeriesSelectTable} from './parameters';

describe('monitoring-location/components/hydrograph/parameters module', () => {
    config.uvPeriodOfRecord = {
        '00010': {
            begin_date: '01-02-2001',
            end_date: '10-15-2015'
        },
        '00060': {
            begin_date: '04-01-1991',
            end_date: '10-15-2007'
        },
        '00093': {
            begin_date: '11-25-2001',
            end_date: '03-01-2020'
        },
        '00067': {
            begin_date: '04-01-1990',
            end_date: '10-15-2006'
        }
    };

     describe('plotSeriesSelectTable', () => {
        let tableDivSelection;

        const data = [12, 13, 14, 15, 16].map(day => {
            return {
                dateTime: new Date(`2018-01-${day}T00:00:00.000Z`),
                qualifiers: ['P'],
                value: day
            };
        });

        const availableParameterCodes = [
            {variableID: '00010ID', parameterCode: '00010', description: 'Temperature', selected: true, timeSeriesCount: 1},
            {variableID: '00010IDF', parameterCode: '00010F', description: 'Temperature in F', selected: false, timeSeriesCount: 1},
            {variableID: '00067ID', parameterCode: '00067', description: 'Ruthenium (VI) Fluoride', selected: false, timeSeriesCount: 1},
            {variableID: '00093ID', parameterCode: '00093', description: 'Uranium (V) Oxide', selected: false, timeSeriesCount: 1}
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
            availableParameterCodes: availableParameterCodes,
            lineSegmentsByParmCd: lineSegmentsByParmCd,
            timeSeriesScalesByParmCd: timeSeriesScalesByParmCd
        };

        const testArgsWithoutData = {
            siteno: '12345678',
            availableParameterCodes: [],
            lineSegmentsByParmCd: {},
            timeSeriesScalesByParmCd: {}
        };

        let store = configureStore();
        beforeEach(() => {
            tableDivSelection = select('body').append('div');
        });

        afterEach(() => {
            tableDivSelection.remove();
        });

        it('creates a row for each parameter in a table', () => {
            plotSeriesSelectTable(tableDivSelection, testArgsWithData, store);
            expect(tableDivSelection.selectAll('tbody tr').size()).toEqual(4);
        });

        it('creates a the correct number svg sparklines in a table', () => {
            plotSeriesSelectTable(tableDivSelection, testArgsWithData, store);
            expect(tableDivSelection.selectAll('svg').size()).toEqual(4);
            expect(tableDivSelection.selectAll('svg path').size()).toEqual(2);
        });

        it('does not create the table when there are no time series', () => {
            plotSeriesSelectTable(tableDivSelection, testArgsWithoutData, store);
            expect(tableDivSelection.selectAll('table').size()).toEqual(0);
        });

        it('creates a radio button input for each parameter in the table', () => {
            plotSeriesSelectTable(tableDivSelection, testArgsWithData, store);
            expect(tableDivSelection.selectAll('input').size()).toEqual(4);
        });

         it('creates a WaterAlert subscribe link each parameter in the table supported by WaterAlert', () => {
             plotSeriesSelectTable(tableDivSelection, testArgsWithData, store);
             expect(tableDivSelection.selectAll('.wateralert-available').size()).toEqual(2);
         });

         it('creates WaterAlert not available text for each parameter in the table NOT supported by WaterAlert', () => {
             plotSeriesSelectTable(tableDivSelection, testArgsWithData, store);
             expect(tableDivSelection.selectAll('.wateralert-unavailable').size()).toEqual(2);
         });

        it('updates the radio button input checked property for the corresponding selected parameter', () => {
            plotSeriesSelectTable(tableDivSelection, testArgsWithData, store);

            let selectedParamRow = tableDivSelection.selectAll('tr').filter('.selected');
            let selectedParamTD = selectedParamRow.select('td');
            let selectedParamRowInput = selectedParamTD.select('input');
            expect(selectedParamRowInput.property('checked')).toBeTruthy();
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
