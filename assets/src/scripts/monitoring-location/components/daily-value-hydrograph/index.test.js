import {select} from 'd3-selection';
import sinon from 'sinon';

import * as utils from 'ui/utils';

import {configureStore} from 'ml/store';
import {Actions} from 'ml/store/daily-value-time-series';

import {attachToNode} from './index';

describe('monitoring-location/components/dailyValueHydrograph/index', () => {
    utils.mediaQuery = jest.fn().mockReturnValue(true);
    utils.wrap = jest.fn();

    let fakeServer;
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
        fakeServer = sinon.createFakeServer();
        testDiv = select('body').append('div');
        testDiv.append('div')
            .attr('class', 'loading-indicator-container');
        testDiv.append('div')
            .attr('class', 'graph-container');
    });

    afterEach(() => {
        fakeServer.restore();
        testDiv.remove();
    });

    it('Expects that an empty siteno will render an error alert', () => {
        attachToNode(configureStore(), testDiv.node());

        expect(testDiv.selectAll('.usa-alert--error').size()).toBe(1);
        expect(fakeServer.requests).toHaveLength(0);
    });

    it('Expects that if siteno is defined, the available time series is fetched', () => {
        jest.spyOn(Actions, 'retrieveAvailableDVTimeSeries');
        attachToNode(configureStore(), testDiv.node(), {siteno: '12345'});

        expect(testDiv.selectAll('.usa-alert--error').size()).toBe(0);
        expect(testDiv.selectAll('.loading-indicator').size()).toBe(1);
        expect(Actions.retrieveAvailableDVTimeSeries).toHaveBeenCalledWith('USGS-12345');
    });

    describe('Tests after available time series is fetched', () => {
        beforeEach(() => {
            jest.spyOn(Actions, 'retrieveAvailableDVTimeSeries').mockReturnValue(function() {
                return Promise.resolve({});
            });
            jest.spyOn(Actions, 'retrieveDVTimeSeries');
        });

        it('Expects that once the available time series is fetched and contains a valid time series id, the time series is fetched', () => {
            attachToNode(configureStore({
                dailyValueTimeSeriesData: {
                    availableDVTimeSeries: TEST_STATE.dailyValueTimeSeriesData.availableDVTimeSeries
                }
            }), testDiv.node(), {siteno: '12345'});

            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    expect(Actions.retrieveDVTimeSeries.mock.calls).toHaveLength(2);
                    expect(Actions.retrieveDVTimeSeries.mock.calls[0]).toEqual(['USGS-12345', '1122']);
                    expect(Actions.retrieveDVTimeSeries.mock.calls[1]).toEqual(['USGS-12345', '1123']);

                    resolve();
                });
            });
        });

        it('Expects that if there is not a valid time series that the alert is shown indicating no data', () => {
            attachToNode(configureStore({
                dailyValueTimeSeriesData: {
                    availableDVTimeSeries: []
                }
            }), testDiv.node(), {siteno: '12345'});
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    expect(Actions.retrieveDVTimeSeries).not.toHaveBeenCalled();
                    expect(testDiv.selectAll('.usa-alert--info').size()).toBe(1);
                    expect(testDiv.selectAll('.loading-indicator').size()).toBe(0);

                    resolve();
                });
            });
        });
    });

    describe('Tests after successful fetch of the dv series', () => {
        let store;
        beforeEach(() => {
            jest.spyOn(Actions, 'retrieveAvailableDVTimeSeries').mockReturnValue(function() {
                return Promise.resolve({});
            });
            jest.spyOn(Actions, 'retrieveDVTimeSeries').mockReturnValue(function() {
                return Promise.resolve({});
            });

            store = configureStore(TEST_STATE);
        });

        it('Expect that a successful fetch of the dv series removes loading indicator and renders the expected elements', () => {
            attachToNode(store, testDiv.node(), {siteno: '12345'});

            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(() => {
                        expect(testDiv.selectAll('.loading-indicator').size()).toBe(0);
                        expect(testDiv.selectAll('.usa-alert--info').size()).toBe(0);

                        resolve();
                    });
                });
            });
        });

        it('Expect that the hydrograph svg is rendered', () => {
            attachToNode(store, testDiv.node(), {siteno: '12345'});

            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(() => {
                        expect(testDiv.select('.graph-container').selectAll('.hydrograph-svg').size()).toBe(1);

                        resolve();
                    });
                });
            });
        });

        it('Expect that the legend is rendered', () => {
            attachToNode(store, testDiv.node(), {siteno: '12345'});

            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(() => {
                        expect(testDiv.select('.graph-container').selectAll('.dv-legend-container').size()).toBe(1);

                        resolve();
                    });
                });
            });
        });

        it('Expect that the brush is rendered', () => {
            attachToNode(store, testDiv.node(), {siteno: '12345'});

            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(() => {
                        expect(testDiv.select('.graph-container').selectAll('.brush').size()).toBe(1);

                        resolve();
                    });
                });
            });
        });

        it('Expect that the cursor slider is rendered', () => {
            attachToNode(store, testDiv.node(), {siteno: '12345'});

            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(() => {
                        expect(testDiv.select('.graph-container').selectAll('.cursor-slider-svg').size()).toBe(1);

                        resolve();
                    });
                });
            });
        });
    });
});
