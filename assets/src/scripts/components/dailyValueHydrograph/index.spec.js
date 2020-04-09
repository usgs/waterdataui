import {select} from 'd3-selection';

import {configureStore, Actions} from '../../store';

import {attachToNode} from './index';

describe('components/dailyValueHydrograph/index', () => {
    const TEST_STATE = {
        observationsData: {
            availableDVTimeSeries: [{
                parameterCode: '72019',
                statisticCode: '00001',
                id: 'USGS-12345-1122'
            },{
                parameterCode: '72019',
                statisticCode: '00002',
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
            currentTimeSeriesId: '1122',
            cursorOffset: 1262476800000
        },
        ui: {
            windowWidth: 1024,
            width: 800
        }
    };

    let testDiv;

    const INITIAL_STATE = {
        observationsData: {},
        observationsState: {},
        ui: {
            windowWidth: 1024,
            width: 800
        }
    }
    let store;

    beforeEach(() => {
        jasmine.Ajax.install();
        testDiv = select('body').append('div');
        testDiv.append('div')
            .attr('class', 'loading-indicator-container');
        testDiv.append('div')
            .attr('class', 'graph-container');
        store = configureStore(INITIAL_STATE);
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
        testDiv.remove();
    });

    it('Expects that an empty siteno will render an error alert', () => {
        attachToNode(store, testDiv.node());

        expect(testDiv.selectAll('.usa-alert--error').size()).toBe(1);
        expect(jasmine.Ajax.requests.count()).toBe(0);
    });

    it('Expects that if siteno is defined, the available time series is fetched', () => {
        attachToNode(store, testDiv.node(), {siteno: '12345'});

        expect(testDiv.selectAll('.usa-alert--error').size()).toBe(0);
        expect(testDiv.selectAll('.loading-indicator').size()).toBe(1);
        expect(jasmine.Ajax.requests.mostRecent().url).toContain('USGS-12345');
    });

    it('Expects that once the available time series is fetched and contains a valid time series id, the time series is fetched', (done) => {
        attachToNode(store, testDiv.node(), {siteno: '12345'});
        jasmine.Ajax.requests.mostRecent().respondWith({
            status: 200,
            response: JSON.stringify({
                timeSeries: TEST_STATE.observationsData.availableDVTimeSeries
            })
        });

        window.setTimeout(() => {
            const url = jasmine.Ajax.requests.mostRecent().url;
            expect(store.getState().observationsData.availableDVTimeSeries).toEqual(TEST_STATE.observationsData.availableDVTimeSeries)
            expect(url).toContain('USGS-12345');
            expect(url).toContain('1122');
            done();
        }, 1000);
    });

    it('Expects that if there is not a valid time series that the alert is shown indicating no data', (done) => {
        attachToNode(store, testDiv.node(), {siteno: '12345'});
        jasmine.Ajax.requests.mostRecent().respondWith({
            status: 200,
            response: JSON.stringify({
                timeSeries: TEST_STATE.observationsData.availableDVTimeSeries.slice(1)
            })
        });
        window.setTimeout(() => {
            expect(jasmine.Ajax.requests.count()).toBe(1);
            expect(testDiv.selectAll('.usa-alert--info').size()).toBe(1);
            expect(testDiv.selectAll('.loading-indicator').size()).toBe(0);
            done();
        }, 1000);
    });

    fit('Expect that a successful fetch of the dv series removes loading indicator and renders the expected elements', (done) => {
        attachToNode(store, testDiv.node(), {siteno: '12345'});
        jasmine.Ajax.requests.mostRecent().respondWith({
            status: 200,
            response: JSON.stringify({
                timeSeries: TEST_STATE.observationsData.availableDVTimeSeries.slice(1)
            })
        });
        window.setTimeout(() => {
            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                responseText: JSON.stringify(TEST_STATE.observationsData.dvTimeSeries)
            });

            window.setTimeout(() => {
                console.log('Waiting for retrieving DV time series')
                expect(testDiv.selectAll('.loading-indicator').size()).toBe(0);
                done();
            }, 1000)

            done();
        }, 1000);

    });

    it('Expects that if the fetch is successful the current observations time series id is updated in the store and the loading indicator is no longer visible', (done) => {
        let store = configureStore();
        attachToNode(store, testDiv.node(), {siteno: '1213', timeSeriesId: '12345'});
        jasmine.Ajax.requests.mostRecent().respondWith({
            status: 200,
            response: JSON.stringify(TEST_STATE.observationsData.timeSeries['12345'])
        });

        window.requestAnimationFrame(() => {
            expect(store.getState().observationsState.currentTimeSeriesId).toEqual('12345');
            expect(testDiv.selectAll('.usa-alert--info').size()).toBe(0);
            expect(testDiv.selectAll('.loading-indicator').size()).toBe(0);

            done();
        });
    });

    it('Expect that if the fetch is not successful an info alert is shown and the loading indicator is no longer shown', (done) => {
        let store = configureStore();
        attachToNode(store, testDiv.node(), {siteno: '1213', timeSeriesId: '12345'});
        jasmine.Ajax.requests.mostRecent().respondWith({
            status: 500
        });

        window.requestAnimationFrame(() => {
            expect(store.getState().observationsState.currentTimeSeriesId).toBeUndefined();
            expect(testDiv.selectAll('.usa-alert--info').size()).toBe(1);
            expect(testDiv.selectAll('.loading-indicator').size()).toBe(0);

            done();
        });
    });

    it('Should render the hydrograph container', (done) => {
        attachToNode(configureStore(), testDiv.node(), {siteno: '1213', timeSeriesId: '12345'});
        jasmine.Ajax.requests.mostRecent().respondWith({
            status: 200,
            response: JSON.stringify(TEST_STATE.observationsData.timeSeries['12345'])
        });

        window.requestAnimationFrame(() => {
            expect(testDiv.select('.graph-container').selectAll('.hydrograph-container').size()).toBe(3);
            done();
        });
    });

    it('Should render the DV legend', (done) => {
        attachToNode(configureStore(TEST_STATE), testDiv.node(), {siteno: '1213', timeSeriesId: '12345'});
        jasmine.Ajax.requests.mostRecent().respondWith({
            status: 200,
            response: JSON.stringify(TEST_STATE.observationsData.timeSeries['12345'])
        });

        window.requestAnimationFrame(() => {
            expect(testDiv.select('.graph-container').selectAll('.dv-legend-controls-container').size()).toBe(1);
            done();
        });
    });

    it('Should render brush element for the DV graph', (done) => {
         attachToNode(configureStore(TEST_STATE), testDiv.node(), {siteno: '1213', timeSeriesId: '12345'});
        jasmine.Ajax.requests.mostRecent().respondWith({
            status: 200,
            response: JSON.stringify(TEST_STATE.observationsData.timeSeries['12345'])
        });
        window.requestAnimationFrame(() => {
            expect(testDiv.select('.graph-container').selectAll('.brush').size()).toBe(1);
            done();
        });
    });

    it('Should render the tooltip cursor slider', (done) => {
        attachToNode(configureStore(TEST_STATE), testDiv.node(), {siteno: '1213', timeSeriesId: '12345'});
        jasmine.Ajax.requests.mostRecent().respondWith({
            status: 200,
            response: JSON.stringify(TEST_STATE.observationsData.timeSeries['12345'])
        });

        window.requestAnimationFrame(() => {
            expect(testDiv.select('.graph-container').selectAll('.cursor-slider-svg').size()).toBe(1);
            done();
        });
    });
});
