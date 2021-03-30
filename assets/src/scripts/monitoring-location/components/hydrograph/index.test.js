import {select, selectAll} from 'd3-selection';
import sinon from 'sinon';

import * as utils from 'ui/utils';
import config from 'ui/config';


import {configureStore} from 'ml/store';
import {Actions as floodDataActions} from 'ml/store/flood-inundation';
import * as hydrographData from 'ml/store/hydrograph-data';
import * as hydrographParameters from 'ml/store/hydrograph-parameters';

import {attachToNode} from './index';
import {
    TEST_CURRENT_TIME_RANGE,
    TEST_GW_LEVELS,
    TEST_HYDROGRAPH_PARAMETERS, TEST_MEDIAN_DATA,
    TEST_PRIMARY_IV_DATA
} from './mock-hydrograph-state';

describe('monitoring-location/components/hydrograph module', () => {
    utils.mediaQuery = jest.fn().mockReturnValue(true);
    utils.wrap = jest.fn();
    config.locationTimeZone = 'America/Chicago';
    config.ivPeriodOfRecord = {
        '72019': {
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

    config.gwPeriodOfRecord = {
        '72019': {
            begin_date: '01-02-2000',
            end_date: '10-15-2015'
        }
    };

    let graphNode;
    let fakeServer;
    let nodeElem;

    const INITIAL_PARAMETERS = {
        siteno: '11112222',
        agencyCode: 'USGS',
        sitename: 'Site name',
        parameterCode: '72019'
    };

    beforeEach(() => {
        let body = select('body');
        body.append('a')
            .attr('id', 'classic-page-link')
            .attr('href', 'https://fakeserver/link');
        let component = body.append('div')
            .attr('id', 'hydrograph');
        component.append('div').attr('id', 'hydrograph-method-picker-container');
        component.append('div').attr('class', 'graph-container')
            .append('div')
                .attr('id', 'hydrograph-loading-indicator-container')
                .attr('class', 'loading-indicator-container');
        component.append('div').attr('class', 'short-cut-days-before-container');
        component.append('div').attr('class', 'select-actions-container');
        component.append('div').attr('class', 'select-time-series-container');
        component.append('div').attr('id', 'iv-data-table-container');

        graphNode = document.getElementById('hydrograph');
        nodeElem = select(graphNode);

        fakeServer = sinon.createFakeServer();
    });

    afterEach(() => {
        fakeServer.restore();
        select('#hydrograph').remove();
        select('#classic-page-link').remove();
    });

    describe('Tests for initial data fetching and setting', () => {
        let store;
        let retrieveHydrographDataSpy, retrieveHydrographParametersSpy, retrieveWaterwatchDataSpy;

        beforeEach(() => {
            store = configureStore({
                hydrographData: {},
                hydrographState: {},
                hydrographParameters: {},
                floodData: {},
                ui: {
                    width: 1000
                }
            });
            retrieveHydrographDataSpy = jest.spyOn(hydrographData, 'retrieveHydrographData');
            retrieveHydrographParametersSpy = jest.spyOn(hydrographParameters, 'retrieveHydrographParameters');
            retrieveWaterwatchDataSpy = jest.spyOn(floodDataActions, 'retrieveWaterwatchData');
        });

        it('Loading indicator should be shown', () => {
            attachToNode(store, graphNode, INITIAL_PARAMETERS);
            expect(nodeElem.select('.loading-indicator').size()).toBe(1);
        });


        describe('Fetching initial hydrograph data', () => {
            it('With just parameter code set', () => {
                attachToNode(store, graphNode, INITIAL_PARAMETERS);
                expect(retrieveHydrographDataSpy).toHaveBeenCalledWith('11112222', {
                    parameterCode: '72019',
                    period: 'P7D',
                    startTime: null,
                    endTime: null,
                    loadCompare: false,
                    loadMedian: false
                });
                expect(store.getState().hydrographState).toEqual({
                    selectedParameterCode: '72019',
                    selectedTimeSpan: 'P7D',
                    showCompareIVData: false,
                    selectedIVMethodID: undefined
                });
            });

            it('With custom period', () => {
                attachToNode(store, graphNode, {
                    ...INITIAL_PARAMETERS,
                    period: 'P45D'
                });
                expect(retrieveHydrographDataSpy).toHaveBeenCalledWith('11112222', {
                    parameterCode: '72019',
                    period: 'P45D',
                    startTime: null,
                    endTime: null,
                    loadCompare: false,
                    loadMedian: false
                });
                expect(store.getState().hydrographState).toEqual({
                    selectedParameterCode: '72019',
                    selectedTimeSpan: 'P45D',
                    showCompareIVData: false,
                    selectedIVMethodID: undefined
                });
            });

            it('With custom time range', () => {
                attachToNode(store, graphNode, {
                    ...INITIAL_PARAMETERS,
                    startDT: '2020-02-01',
                    endDT: '2020-02-15'
                });
                expect(retrieveHydrographDataSpy).toHaveBeenCalledWith('11112222', {
                    parameterCode: '72019',
                    period: null,
                    startTime: '2020-02-01T00:00:00.000-06:00',
                    endTime: '2020-02-15T23:59:59.999-06:00',
                    loadCompare: false,
                    loadMedian: false
                });
                expect(store.getState().hydrographState).toEqual({
                    selectedParameterCode: '72019',
                    selectedTimeSpan: {
                        start: '2020-02-01',
                        end: '2020-02-15'
                    },
                    showCompareIVData: false,
                    selectedIVMethodID: undefined
                });
            });

            it('With compare enabled', () => {
                attachToNode(store, graphNode, {
                    ...INITIAL_PARAMETERS,
                    compare: true
                });
                expect(retrieveHydrographDataSpy).toHaveBeenCalledWith('11112222', {
                    parameterCode: '72019',
                    period: 'P7D',
                    startTime: null,
                    endTime: null,
                    loadCompare: true,
                    loadMedian: false
                });
                expect(store.getState().hydrographState).toEqual({
                    selectedParameterCode: '72019',
                    selectedTimeSpan: 'P7D',
                    showCompareIVData: true,
                    selectedIVMethodID: undefined
                });
            });
        });

        it('Should fetch the hydrograph parameters', () => {
            attachToNode(store, graphNode, INITIAL_PARAMETERS);
            expect(retrieveHydrographParametersSpy).toHaveBeenCalledWith('11112222');
        });

        it('Should fetch the waterwatch flood levels', () => {
            attachToNode(store, graphNode, INITIAL_PARAMETERS);
            expect(retrieveWaterwatchDataSpy).toHaveBeenCalledWith('11112222');
        });

        it('Should fetch the data and set the hydrograph state but not does not fetch hydrograph parameters when showOnlyGraph is true', () => {
            attachToNode(store, graphNode, {
                ...INITIAL_PARAMETERS,
                showOnlyGraph: true
            });

            expect(retrieveHydrographDataSpy).toHaveBeenCalledWith('11112222', {
                parameterCode: '72019',
                period: 'P7D',
                startTime: null,
                endTime: null,
                loadCompare: false,
                loadMedian: false
            });
            expect(store.getState().hydrographState).toEqual({
                selectedParameterCode: '72019',
                selectedTimeSpan: 'P7D',
                showCompareIVData: false
            });
            expect(retrieveWaterwatchDataSpy).toHaveBeenCalled();
            expect(retrieveHydrographParametersSpy).not.toHaveBeenCalled();
        });
    });

    describe('Tests for rendering once fetching is complete when showOnlyGraph is false', () => {
        let store;
        beforeEach(() => {
            store = configureStore({
                hydrographData: {
                    primaryIVData: TEST_PRIMARY_IV_DATA,
                    currentTimeRange: TEST_CURRENT_TIME_RANGE,
                    groundwaterLevels: TEST_GW_LEVELS,
                    medianStatisticsData: TEST_MEDIAN_DATA
                },
                hydrographState: {
                    selectedIVMethodID: '90649',
                    showMedianData: true
                },
                hydrographParameters: TEST_HYDROGRAPH_PARAMETERS,
                floodData: {},
                ui: {
                    width: 1000
                }
            });

            hydrographData.retrieveHydrographData = jest.fn(() => {
                return function() {
                    return Promise.resolve();
                };
            });
            hydrographParameters.retrieveHydrographParameters = jest.fn(() => {
                return function() {
                    return Promise.resolve();
                };
            });
            attachToNode(store, graphNode, {
                ...INITIAL_PARAMETERS,
                showOnlyGraph: false
            });
        });

        it('loading indicator should be hidden', () => {
            expect(nodeElem.select('.loading-indicator').size()).toBe(0);
        });

        it('should render the correct number of svg nodes', () => {
            expect(selectAll('svg').size()).toBe(4);
        });

        it('should have a title div', () => {
            const titleDiv = selectAll('.time-series-graph-title');
            expect(titleDiv.size()).toBe(1);
            expect(titleDiv.select('div').text()).toContain('Depth to water level');
            expect(titleDiv.select('.usa-tooltip').text()).toEqual('Depth to water level, feet');
        });

        it('should have a defs node', () => {
            expect(selectAll('defs').size()).toBe(1);
            expect(selectAll('defs mask').size()).toBe(1);
            expect(selectAll('defs pattern').size()).toBe(2);
        });

        it('should render time series data as a line', () => {
            // There should be four segments
            expect(selectAll('.hydrograph-svg .line-segment').size()).toBe(4);
        });

        it('should render a rectangle for masked data', () => {
            expect(selectAll('.hydrograph-svg g.iv-mask-group').size()).toBe(1);
        });

        it('should have a point for the median stat data with a label', () => {
            expect(selectAll('#median-points path').size()).toBe(1);
            expect(selectAll('#median-points text').size()).toBe(0);
        });

        it('should have brush element for the hydrograph', () => {
            expect(selectAll('.brush').size()).toBe(1);
        });

        it('should have .cursor-slider-svg element', () => {
            expect(selectAll('.cursor-slider-svg').size()).toBe(1);
        });

        it('should have date control form', () => {
            expect(selectAll('#change-time-span-container').size()).toBe(1);
        });

        it('should have download data form', () => {
            expect(selectAll('#download-graph-data-container').size()).toBe(1);
        })

        it('should have method select element', () => {
            expect(selectAll('#ts-method-select-container').size()).toBe(1);
        });

        it('should have the select time series element', () => {
            expect(selectAll('#select-time-series').size()).toBe(1);
        });

        it('should have data tables for hydrograph data', () => {
            expect(select('#iv-hydrograph-data-table-container').size()).toBe(1);
            expect(select('#gw-hydrograph-data-table-container').size()).toBe(1);
        });
    });

    describe('Tests for rendering once fetching is complete when showOnlyGraph is true', () => {
        let store;
        beforeEach(() => {
            store = configureStore({
                hydrographData: {
                    primaryIVData: TEST_PRIMARY_IV_DATA,
                    currentTimeRange: TEST_CURRENT_TIME_RANGE,
                    groundwaterLevels: TEST_GW_LEVELS,
                    medianStatisticsData: TEST_MEDIAN_DATA
                },
                hydrographState: {
                    selectedIVMethodID: '90649',
                    showMedianData: true
                },
                hydrographParameters: TEST_HYDROGRAPH_PARAMETERS,
                floodData: {},
                ui: {
                    width: 1000
                }
            });

            hydrographData.retrieveHydrographData = jest.fn(() => {
                return function() {
                    return Promise.resolve();
                };
            });
            hydrographParameters.retrieveHydrographParameters = jest.fn(() => {
                return function() {
                    return Promise.resolve();
                };
            });
            attachToNode(store, graphNode, {
                ...INITIAL_PARAMETERS,
                showOnlyGraph: true
            });
        });

        it('loading indicator should be hidden', () => {
            expect(nodeElem.select('.loading-indicator').size()).toBe(0);
        });

        it('should render the correct number of svg nodes', () => {
            expect(selectAll('svg').size()).toBe(2);
        });

        it('should have a title div', () => {
            const titleDiv = selectAll('.time-series-graph-title');
            expect(titleDiv.size()).toBe(1);
        });

        it('should have a defs node', () => {
            expect(selectAll('defs').size()).toBe(1);
            expect(selectAll('defs mask').size()).toBe(1);
            expect(selectAll('defs pattern').size()).toBe(2);
        });

        it('should render time series data as a line', () => {
            // There should be four segments
            expect(selectAll('.hydrograph-svg .line-segment').size()).toBe(4);
        });

        it('should render a rectangle for masked data', () => {
            expect(selectAll('.hydrograph-svg g.iv-mask-group').size()).toBe(1);
        });

        it('should have a point for the median stat data with a label', () => {
            expect(selectAll('#median-points path').size()).toBe(1);
            expect(selectAll('#median-points text').size()).toBe(0);
        });

        it('should not have brush element for the hydrograph', () => {
            expect(selectAll('.brush').size()).toBe(0);
        });

        it('should not have .cursor-slider-svg element', () => {
            expect(selectAll('.cursor-slider-svg').size()).toBe(0);
        });

        it('should not have time span elements', () => {
            expect(selectAll('#change-time-span-container').size()).toBe(0);
        });

        it('should not have the download data element', () => {
            expect(selectAll('#download-graph-data-container').size()).toBe(0);
        });

        it('should not have method select element', () => {
            expect(selectAll('#ts-method-select-container').size()).toBe(0);
        });

        it('should not have the select time series element', () => {
            expect(selectAll('#select-time-series').size()).toBe(0);
        });

        it('should not have data tables for hydrograph data', () => {
            expect(select('#iv-hydrograph-data-table-container').size()).toBe(0);
            expect(select('#gw-hydrograph-data-table-container').size()).toBe(0);
        });
    });
});