import {select, selectAll} from 'd3-selection';
import {configureStore} from '../../store';
import {Actions} from '../../store/daily-value-time-series';
import {drawGraphControls} from './graph-controls';


// Tests for the graph-controls module
describe('monitoring-location/components/dailyValueHydrograph/graphControls', () => {
    const TEST_STATE = {
        dailyValueTimeSeriesData: {
            availableDVTimeSeries: [{
                parameterCode: '72019',
                statisticCode: '00001',
                id: 'USGS-12345-1122'
            },{
                parameterCode: '72019',
                statisticCode: '00003',
                id: 'USGS-12345-1123'
            },{
                parameterCode: '00060',
                statisticCode: '00001',
                id: 'USGS-12345-1124'
            }],
            dvTimeSeries: {
                '1122' : {
                    type: 'Feature',
                    id: '1122',
                    properties: {
                        observationType: 'MeasureTimeseriesObservation',
                        phenomenonTimeStart: '2010-01-01',
                        phenomenonTimeEnd: '2010-01-04',
                        observedPropertyName: 'Water level, depth LSD',
                        observedPropertyReference: null,
                        samplingFeatureName: 'CT-SC    22 SCOTLAND',
                        statistic: 'MAXIMUM',
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
                },
                '1123' : {
                    type: 'Feature',
                    id: '1123',
                    properties: {
                        observationType: 'MeasureTimeseriesObservation',
                        phenomenonTimeStart: '2010-01-01',
                        phenomenonTimeEnd: '2010-01-04',
                        observedPropertyName: 'Water level, depth LSD',
                        observedPropertyReference: null,
                        samplingFeatureName: 'CT-SC    22 SCOTLAND',
                        statistic: 'MEAN',
                        statisticReference: null,
                        unitOfMeasureName: 'ft',
                        unitOfMeasureReference: null,
                        timeStep: ['2010-01-01', '2010-01-02', '2010-01-03', '2010-01-04'],
                        result: ['3.5', '2.2', '3.6', '1.9'],
                        nilReason: [null, null, null, null],
                        approvals: [['Approved'], ['Approved'], ['Approved'], ['Approved']],
                        qualifiers: [null, null, null, null],
                        grades: [['50'], ['50'], ['50'], ['50']]
                    }
                }
            }
        },
        dailyValueTimeSeriesState: {
            currentDVTimeSeriesId: {
                min: null,
                mean: '1122',
                max: '1122'
            },
            dvGraphCursorOffset: 1262476800000
        },
        ui: {
            windowWidth: 1024,
            width: 800
        }
    };

    const TEST_STATE_ONE_PARAM_CODE = {
        ...TEST_STATE,
        dailyValueTimeSeriesData: {
            ...TEST_STATE.dailyValueTimeSeriesData,
            availableDVTimeSeries: [{
                parameterCode: '72019',
                statisticCode: '00001',
                id: 'USGS-12345-1122'
            }, {
                parameterCode: '72019',
                statisticCode: '00003',
                id: 'USGS-12345-1123'
            }]
        }
    };

    const TEST_STATE_NO_DATA = {
        dailyValueTimeSeriesData: {
            availableDVTimeSeries: [],
            dvTimeSeries: {}
        },
        dailyValueTimeSeriesState: {
            currentDVTimeSeriesId: {
                min: null,
                mean: null,
                max: null
            },
            dvGraphCursorOffset: 0
        },
        ui: {
            windowWidth: 1024,
            width: 800
        }
    };

    fdescribe('drawGraphControls with data', () => {

        let div;
        let store;

        beforeEach(() => {

            div = select('body').append('div');
            store = configureStore(TEST_STATE);
            div.call(drawGraphControls, store);
        });

        afterEach(() => {
            div.remove();
        });

        it('Should render the radio buttons', () => {
            const radioButtons = selectAll('input[type="radio"]');
            const firstRadioButton = select('#code-72019-radio');
            expect(radioButtons.size()).toBe(2);
            expect(firstRadioButton.property('checked')).toBe(true);
        });
    });

    describe('drawGraphControls with one param code', () => {

        let div;
        let store;

        beforeEach(() => {
            div = select('body').append('div');
            store = configureStore(TEST_STATE_ONE_PARAM_CODE);
            div.call(drawGraphControls, store);
        });

        it('Should not render the radio buttons', () => {
            const radioButtons = selectAll('input[type="radio"]');
            expect(radioButtons.size()).toBe(0);
        });
    });

    describe('drawGraphControls with no param code', () => {

        let div;
        let store;

        beforeEach(() => {
            div = select('body').append('div');
            store = configureStore(TEST_STATE_NO_DATA);
            div.call(drawGraphControls, store);
        });

        it('Should not render the radio buttons', () => {
            const radioButtons = selectAll('input[type="radio"]');
            expect(radioButtons.size()).toBe(0);
        });
    });
});
