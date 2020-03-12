import {select, selectAll} from 'd3-selection';
import {drawSimpleLegend, drawTimeSeriesLegend} from '../legend';
import {lineMarker, rectangleMarker, textOnlyMarker} from "../../../d3-rendering/markers";
import {getLegendMarkerRows} from './legend-data';
import {configureStore} from "../../../store";


describe('DV: Legend module', () => {

    const TEST_STATE = {
        observationsData: {
            timeSeries: {
                '12345': {
                    type: 'Feature',
                    id: '12345',
                    properties: {
                        phenomenonTimeStart: '2018-01-02',
                        phenomenonTimeEnd: '2018-01-05',
                        timeStep: ['2018-01-02', '2018-01-03', '2018-01-04', '2018-01-05'],
                        result: ['5.0', '4.0', '6.1', '3.2'],
                        approvals: [['Approved'], ['Approved'], ['Approved'], ['Estimated']],
                        nilReason: [null, 'AA', null, null],
                        qualifiers: [null, null, ['ICE'], ['ICE']],
                        grades: [['50'], ['50'], ['60'], ['60']]
                    }
                }
            }
        },
        observationsState: {
            currentTimeSeriesId: '12345',
            showSeries: {
                current: true
            }
        },
        ui: {
            windowWidth: 1024,
            width: 800
        }
    };

    describe('DV: drawSimpleLegend', () => {
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


    describe('DV: legendMarkerRowSelector', () => {

        it('Should return no markers if no time series to show', () => {
            let newData = {
                ...TEST_STATE,
                observationsData: {
                    ...TEST_STATE.observationsData,
                    timeSeries: {}
                },
            };

            expect(getLegendMarkerRows(newData)).toEqual([]);
        });

        it('Should return markers for the selected variable', () => {
            const result = getLegendMarkerRows(TEST_STATE);

            expect(result.length).toBe(1);
            expect(result[0].length).toBe(3);
            expect(result[0][0].type).toEqual(textOnlyMarker);
            expect(result[0][1].type).toEqual(lineMarker);
        });

    });

    describe('DV: legend should render', () => {

        let graphNode;
        let store;

        beforeEach(() => {
            let body = select('body');
            let component = body.append('div').attr('id', 'hydrograph');
            component.append('div').attr('class', 'loading-indicator-container');
            component.append('div').attr('class', 'graph-container');

            graphNode = document.getElementById('hydrograph');

            store = configureStore(TEST_STATE);
            select(graphNode)
                .call(drawTimeSeriesLegend, store);

            jasmine.Ajax.install();
        });

        afterEach(() => {
            jasmine.Ajax.uninstall();
            select('#hydrograph').remove();
        });


        it('Should have 3 legend markers', () => {
            expect(selectAll('.legend g').size()).toBe(3);
        });

    });

});