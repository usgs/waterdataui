import {select} from 'd3-selection';

import {configureStore, Actions} from '../../store';

import {drawTimeSeriesGraph} from './time-series-graph';

describe('components/dailyValueHydrograph/time-series-graph', () => {
    const TEST_STATE = {
        observationsData: {
            timeSeries: {
                '12345' : {
                    type: 'Feature',
                    id: '12345',
                    properties: {
                        observationType: 'MeasureTimeseriesObservation',
                        phenomenonTimeStart: '2010-01-01',
                        phenomenonTimeEnd: '2010-01-04',
                        observedPropertyName: 'Water level, depth LSD',
                        observedPropertyReference: null,
                        samplingFeatureName: 'CT-SC    22 SCOTLAND',
                        statistic: null,
                        statisticReference: null,
                        unitOfMeasureName: 'ft',
                        unitOfMeasureReference: null,
                        timeStep: ['2010-01-01', '2010-01-02', '2010-01-03', '2010-01-04'],
                        result: ['4.5', '3.2', '4.6', '2.9'],
                        nilReason: [null, null, null, null],
                        approvals: [['Approved'], ['Approved'], ['Approved'], ['Approved']],
                        qualifiers: [null, null, null, null],
                        grades: [['50'], ['50'], ['50'], ['50']]
                    }
                }
            }
        },
        observationsState: {
            currentTimeSeriesId: '12345',
            cursorOffset: 1262476800000
        },
        ui: {
            windowWidth: 1024,
            width: 800
        }
    };
    let testDiv;

    beforeEach(() => {
        testDiv = select('body').append('div');
    });

    afterEach(() => {
        testDiv.remove();
    });
    describe('drawTimeSeriesGraph', () => {
        let store;
        beforeEach(() => {
            store = configureStore(TEST_STATE);
            drawTimeSeriesGraph(testDiv, store);
        });

        it('Should contain an svg with accessibility elements', () => {
            const svg = testDiv.selectAll('svg');

            expect(svg.size()).toBe(1);
            expect(svg.selectAll('title').size()).toBe(1);
            expect(svg.selectAll('desc').size()).toBe(1);
        });

        it('svg should contain an x-axis group and y-axis group', () => {
            const svg = testDiv.selectAll('svg');

            expect(svg.selectAll('.x-axis').size()).toBe(1);
            expect(svg.selectAll('.y-axis').size()).toBe(1);
        });

        it('svg should contain a daily-values-lines-group with a single path', () => {
            const svg = testDiv.selectAll('svg');
            const group = svg.selectAll('#daily-values-lines-group');

            expect(group.size()).toBe(1);
            expect(group.selectAll('path').size()).toBe(1);
        });

        it('should render a circle if there is a one element line segment', (done) => {
            store.dispatch(Actions.setObservationsTimeSeries('12345', {
                    type: 'Feature',
                    id: '12345',
                    properties: {
                        observationType: 'MeasureTimeseriesObservation',
                        phenomenonTimeStart: '2010-01-01',
                        phenomenonTimeEnd: '2010-01-04',
                        observedPropertyName: 'Water level, depth LSD',
                        observedPropertyReference: null,
                        samplingFeatureName: 'CT-SC    22 SCOTLAND',
                        statistic: null,
                        statisticReference: null,
                        unitOfMeasureName: 'ft',
                        unitOfMeasureReference: null,
                        timeStep: ['2010-01-01', '2010-01-02', '2010-01-03', '2010-01-05', '2010-01-07', '2010-01-08'],
                        result: ['4.5', '3.2', '4.6', '2.9', '4.0', '4.5'],
                        nilReason: [null, null, null, null, null, null],
                        approvals: [['Approved'], ['Approved'], ['Approved'], ['Approved'], ['Approved'], ['Approved']],
                        qualifiers: [null, null, null, null, null, null],
                        grades: [['50'], ['50'], ['50'], ['50'], ['50'], ['50']]
                    }
                }));
            window.requestAnimationFrame(() => {
                const svg = testDiv.selectAll('svg');
                const group = svg.selectAll('#daily-values-lines-group');

                expect(group.selectAll('path').size()).toBe(2);
                expect(group.selectAll('circle').size()).toBe(1);

                done();
            });
        });

        it('Should render the tooltip elements in the svg', () => {
            const svg = testDiv.selectAll('svg');
            expect(svg.selectAll('.focus-line').size()).toBe(1);
            expect(svg.selectAll('.focus-circle').size()).toBe(1);
            expect(svg.selectAll('.focus-overlay').size()).toBe(1);
        });
    });
});