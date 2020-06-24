import {select} from 'd3-selection';

import {configureStore} from '../../store';
import {Actions} from '../../store/daily-value-time-series';

import {attachToNode} from './index';

describe('monitoring-location/components/dailyValueHydrograph/index', () => {
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
                mean: '1123',
                max: '1122'
            },
            dvGraphCursorOffset: 1262476800000
        },
        ui: {
            windowWidth: 1024,
            width: 800
        }
    };

    let testDiv;

    beforeEach(() => {
        jasmine.Ajax.install();
        testDiv = select('body').append('div');
        testDiv.append('div')
            .attr('class', 'loading-indicator-container');
        testDiv.append('div')
            .attr('class', 'graph-container');
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
        testDiv.remove();
    });

    it('Expects that an empty siteno will render an error alert', () => {
        attachToNode(configureStore(), testDiv.node());

        expect(testDiv.selectAll('.usa-alert--error').size()).toBe(1);
        expect(jasmine.Ajax.requests.count()).toBe(0);
    });

    it('Expects that if siteno is defined, the available time series is fetched', () => {
        spyOn(Actions, 'retrieveAvailableDVTimeSeries').and.callThrough();
        attachToNode(configureStore(), testDiv.node(), {siteno: '12345'});

        expect(testDiv.selectAll('.usa-alert--error').size()).toBe(0);
        expect(testDiv.selectAll('.loading-indicator').size()).toBe(1);
        expect(Actions.retrieveAvailableDVTimeSeries).toHaveBeenCalledWith('USGS-12345');
    });

    describe('Tests after available time series is fetched', () => {
        beforeEach(() => {
            spyOn(Actions, 'retrieveAvailableDVTimeSeries').and.returnValue(function () {
                return Promise.resolve({});
            });
            spyOn(Actions, 'retrieveDVTimeSeries').and.callThrough();
        });

        it('Expects that once the available time series is fetched and contains a valid time series id, the time series is fetched', (done) => {
            attachToNode(configureStore({
                dailyValueTimeSeriesData: {
                    availableDVTimeSeries: TEST_STATE.dailyValueTimeSeriesData.availableDVTimeSeries
                }
            }), testDiv.node(), {siteno: '12345'});

            window.requestAnimationFrame(() => {
                expect(Actions.retrieveDVTimeSeries.calls.count()).toBe(2);
                expect(Actions.retrieveDVTimeSeries.calls.argsFor(0)).toEqual(['USGS-12345', '1122']);
                expect(Actions.retrieveDVTimeSeries.calls.argsFor(1)).toEqual(['USGS-12345', '1123']);

                done();
            });
        });

        it('Expects that if there is not a valid time series that the alert is shown indicating no data', (done) => {
            attachToNode(configureStore({
                dailyValueTimeSeriesData: {
                    availableDVTimeSeries: TEST_STATE.dailyValueTimeSeriesData.availableDVTimeSeries.slice(2)
                }
            }), testDiv.node(), {siteno: '12345'});
            window.requestAnimationFrame(() => {
                expect(Actions.retrieveDVTimeSeries).not.toHaveBeenCalled();
                expect(testDiv.selectAll('.usa-alert--info').size()).toBe(1);
                expect(testDiv.selectAll('.loading-indicator').size()).toBe(0);

                done();
            });
        });
    });

    describe('Tests after successful fetch of the dv series', () => {
        let store;
        beforeEach(() => {
            spyOn(Actions, 'retrieveAvailableDVTimeSeries').and.returnValue(function () {
                return Promise.resolve({});
            });
            spyOn(Actions, 'retrieveDVTimeSeries').and.returnValue(function () {
                return Promise.resolve({});
            });

            store = configureStore(TEST_STATE);
        });

        it('Expect that a successful fetch of the dv series removes loading indicator and renders the expected elements', (done) => {
            attachToNode(store, testDiv.node(), {siteno: '12345'});

            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                    expect(testDiv.selectAll('.loading-indicator').size()).toBe(0);
                    expect(testDiv.selectAll('.usa-alert--info').size()).toBe(0);

                    done();
                });
            });
        });

        it('Expect that the hydrograph svg is rendered', (done) => {
            attachToNode(store, testDiv.node(), {siteno: '12345'});

            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                    expect(testDiv.select('.graph-container').selectAll('.hydrograph-svg').size()).toBe(1);

                    done();
                });
            });
        });

        it('Expect that the legend is rendered', (done) => {
            attachToNode(store, testDiv.node(), {siteno: '12345'});

            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                    expect(testDiv.select('.graph-container').selectAll('.dv-legend-container').size()).toBe(1);

                    done();
                });
            });
        });

        it('Expect that the brush is rendered', (done) => {
            attachToNode(store, testDiv.node(), {siteno: '12345'});

            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                    expect(testDiv.select('.graph-container').selectAll('.brush').size()).toBe(1);

                    done();
                });
            });
        });

        it('Expect that the cursor slider is rendered', (done) => {
            attachToNode(store, testDiv.node(), {siteno: '12345'});

            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                    expect(testDiv.select('.graph-container').selectAll('.cursor-slider-svg').size()).toBe(1);

                    done();
                });
            });
        });
    });
});
