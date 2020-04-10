import {select} from 'd3-selection';

import{configureStore} from '../../store';

import {drawGraphBrush} from './graph-brush';

describe ('graph-brush module', () => {

    const TEST_STATE = {
        observationsData: {
            dvTimeSeries: {
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
            currentDVTimeSeriesId: '12345',
            dvGraphCursorOffset: 1262476800000,
            dvGraphBrushOffset: undefined
        },
        ui: {
            windowWidth: 1024,
            width: 800
        }
    };

    describe('DV: drawGraphBrush', () => {
        let div, store;

        beforeEach(() => {
            div = select('body').append('div');
            store = configureStore(TEST_STATE);
        });

        afterEach(() => {
            div.remove();
        });

        it('Should create a brush svg element', () => {
            div.call(drawGraphBrush, store);

            expect(div.select('svg').size()).toBe(1);
            expect(div.select('.brush').size()).toBe(1);
            expect(div.select('.overlay').size()).toBe(1);
            expect(div.select('.selection').size()).toBe(1);
            expect(div.selectAll('.handle').size()).toBe(2);
        });

        it('Should create a DV line, and an x-axis', () => {
            div.call(drawGraphBrush, store);

            expect(div.selectAll('#daily-values-lines-group').size()).toBe(1);
            expect(div.selectAll('.x-axis').size()).toBe(1);
        });
    });
});