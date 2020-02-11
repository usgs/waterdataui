import {select} from 'd3-selection';

import {configureStore, Actions} from '../../store';

import {attachToNode} from './index';

describe('components/dailyValueHydrograph/index', () => {
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
            currentTimeSeriesId: '12345'
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

        spyOn(Actions, 'retrieveDailyValueData').and.callThrough();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
        testDiv.remove();
    });

    it('Expects that an empty siteno will render an error alert', () => {
        attachToNode(configureStore(), testDiv.node());

        expect(testDiv.selectAll('.usa-alert--error').size()).toBe(1);
        expect(Actions.retrieveDailyValueData).not.toHaveBeenCalled();
    });

    it('Expects that if siteno and timeSeriesId are defined the daily value data will be fetched and the loading indicator shown', () => {
        attachToNode(configureStore(), testDiv.node(), {siteno: '1213', timeSeriesId: '12345'});

        expect(testDiv.selectAll('.usa-alert--error').size()).toBe(0);
        expect(Actions.retrieveDailyValueData).toHaveBeenCalledWith('USGS-1213', '12345') ;
        expect(testDiv.selectAll('.loading-indicator').size()).toBe(1);
    });

    it('Expects that if the fetch is successful the current observations time series id is updated in the store and the loading indicatoris no longer visible', (done) => {
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

    it('graph-container should be hidden if no current observations time series is set', () => {
        let store = configureStore({
            ...TEST_STATE,
            observationsState: {}
        });
        attachToNode(store, testDiv.node(), {siteno: '1213', timeSeriesId: '12345'});

        expect(testDiv.select('.graph-container').attr('hidden')).toBe('true');
    });

    it('graph-container should be hidden if no current observations time series is set', () => {
        let store = configureStore(TEST_STATE);
        attachToNode(store, testDiv.node(), {siteno: '1213', timeSeriesId: '12345'});

        expect(testDiv.select('.graph-container').attr('hidden')).toBeNull();
    });

    it('Should render the hydrograph container', () => {
        attachToNode(configureStore(), testDiv.node(), {siteno: '1213', timeSeriesId: '12345'});

        expect(testDiv.select('.graph-container').selectAll('.hydrograph-container').size()).toBe(1);
    });
});