import mockConsole from 'jest-mock-console';
import * as luxon from 'luxon';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import {default as thunk} from 'redux-thunk';
import sinon from 'sinon';

import {MOCK_IV_DATA, MOCK_GWLEVEL_DATA, MOCK_STATISTICS_JSON} from 'ui/mock-service-data';

import * as ivDataService from 'ui/web-services/instantaneous-values';
import * as groundwaterLevelService from 'ui/web-services/groundwater-levels';
import * as statisticsDataService from 'ui/web-services/statistics-data';

import config from 'ui/config';

import {hydrographDataReducer, retrieveHydrographData, retrieveMedianStatistics, retrievePriorYearIVData } from './hydrograph-data';

describe('monitoring-location/store/hydrograph-data', () => {
    let store;
    let fakeServer;
    let restoreConsole;

    config.locationTimeZone = 'America/Chicago';

    ivDataService.fetchTimeSeries =
        jest.fn().mockReturnValue(Promise.resolve(JSON.parse(MOCK_IV_DATA)));
    groundwaterLevelService.fetchGroundwaterLevels =
        jest.fn().mockReturnValue(Promise.resolve(JSON.parse(MOCK_GWLEVEL_DATA)));
    statisticsDataService.fetchSiteStatistics =
        jest.fn().mockReturnValue(Promise.resolve(MOCK_STATISTICS_JSON));

    luxon.DateTime.local = jest.fn().mockReturnValue(luxon.DateTime.fromISO('2021-02-10T12:00'));
    beforeEach(() => {
        store = createStore(
            combineReducers({
                hydrographData: hydrographDataReducer
            }),
            {
                hydrographData: {}
            },
            applyMiddleware(thunk)
        );
        fakeServer = sinon.createFakeServer();
        restoreConsole = mockConsole();
    });

    afterEach(() => {
        fakeServer.restore();
        restoreConsole();
    });

    describe('retrieveHydrographData', () => {
        describe('The correct web services are called', () => {
            it('Expects to retrieve groundwater and IV data if both are in the period of record', () => {
                config.uvPeriodOfRecord = {
                    '00060': {begin_date: '2010-01-01', end_date: '2020-01-01'}
                };
                config.gwPeriodOfRecord = {
                    '00060': {begin_date: '2010-01-01', end_date: '2020-01-01'}
                };

                store.dispatch(retrieveHydrographData('11112222', {
                    parameterCode: '00060',
                    period: 'P7D',
                    startTime: null,
                    endTime: null,
                    loadCompare: false,
                    loadMedian: false
                }));

                const mockIVCalls = ivDataService.fetchTimeSeries.mock.calls;
                const mockGWCalls = groundwaterLevelService.fetchGroundwaterLevels.mock.calls;
                const mockStatsCalls = statisticsDataService.fetchSiteStatistics.mock.calls;
                expect(mockIVCalls).toHaveLength(1);
                expect(mockIVCalls).toContainEqual([{
                    sites: ['11112222'],
                    parameterCode: '00060',
                    period: 'P7D',
                    startTime: null,
                    endTime: null
                }]);
                expect(mockGWCalls).toHaveLength(1);
                expect(mockGWCalls).toContainEqual([{
                    site: '11112222',
                    parameterCode: '00060',
                    period: 'P7D',
                    startTime: null,
                    endTime: null
                }]);
                expect(mockStatsCalls).toHaveLength(0);
            });

            it('Expects to retrieve all data when all are available or requested', () => {
                config.uvPeriodOfRecord = {
                    '00060': {begin_date: '2010-01-01', end_date: '2020-01-01'}
                };
                config.gwPeriodOfRecord = {
                    '00060': {begin_date: '2010-01-01', end_date: '2020-01-01'}
                };

                store.dispatch(retrieveHydrographData('11112222', {
                    parameterCode: '00060',
                    period: 'P7D',
                    startTime: null,
                    endTime: null,
                    loadCompare: true,
                    loadMedian: true
                }));

                const mockIVCalls = ivDataService.fetchTimeSeries.mock.calls;
                const mockGWCalls = groundwaterLevelService.fetchGroundwaterLevels.mock.calls;
                const mockStatsCalls = statisticsDataService.fetchSiteStatistics.mock.calls;
                expect(mockIVCalls).toHaveLength(2);
                expect(mockIVCalls[0][0]).toEqual({
                    sites: ['11112222'],
                    parameterCode: '00060',
                    period: 'P7D',
                    startTime: null,
                    endTime: null
                });
                expect(mockIVCalls[1][0]).toEqual({
                    sites: ['11112222'],
                    parameterCode: '00060',
                    period: undefined,
                    startTime: '2020-02-04T12:00:00.000-06:00',
                    endTime: '2020-02-11T12:00:00.000-06:00'
                });
                expect(mockGWCalls).toHaveLength(1);
                expect(mockGWCalls).toContainEqual([{
                    site: '11112222',
                    parameterCode: '00060',
                    period: 'P7D',
                    startTime: null,
                    endTime: null
                }]);
                expect(mockStatsCalls).toHaveLength(1);
                expect(mockStatsCalls[0][0]).toEqual({
                    siteno: '11112222',
                    statType: 'median',
                    params: ['00060']
                });
            });

            it('Expects to retrieve iv current and stats when requested', () => {
                config.ivPeriodOfRecord = {
                    '00060': {begin_date: '2010-01-01', end_date: '2020-01-01'}
                };
                config.gwPeriodOfRecord = {};

                store.dispatch(retrieveHydrographData('11112222', {
                    parameterCode: '00060',
                    period: 'P7D',
                    startTime: null,
                    endTime: null,
                    loadCompare: false,
                    loadMedian: true
                }));

                const mockIVCalls = ivDataService.fetchTimeSeries.mock.calls;
                const mockGWCalls = groundwaterLevelService.fetchGroundwaterLevels.mock.calls;
                const mockStatsCalls = statisticsDataService.fetchSiteStatistics.mock.calls;
                expect(mockIVCalls).toHaveLength(1);
                expect(mockIVCalls[0][0]).toEqual({
                    sites: ['11112222'],
                    parameterCode: '00060',
                    period: 'P7D',
                    startTime: null,
                    endTime: null
                });
                expect(mockGWCalls).toHaveLength(0);
                expect(mockStatsCalls).toHaveLength(1);
                expect(mockStatsCalls[0][0]).toEqual({
                    siteno: '11112222',
                    statType: 'median',
                    params: ['00060']
                });
            });

            it('Only gw if no parameter iv in the period of record', () => {
                config.uvPeriodOfRecord = {};
                config.gwPeriodOfRecord = {
                    '00060': {begin_date: '2010-01-01', end_date: '2020-01-01'}
                };

                store.dispatch(retrieveHydrographData('11112222', {
                    parameterCode: '00060',
                    period: 'P7D',
                    startTime: null,
                    endTime: null,
                    loadCompare: true,
                    loadMedian: true
                }));

                const mockIVCalls = ivDataService.fetchTimeSeries.mock.calls;
                const mockGWCalls = groundwaterLevelService.fetchGroundwaterLevels.mock.calls;
                const mockStatsCalls = statisticsDataService.fetchSiteStatistics.mock.calls;
                expect(mockIVCalls).toHaveLength(0);

                expect(mockGWCalls).toHaveLength(1);
                expect(mockGWCalls[0][0]).toEqual({
                    site: '11112222',
                    parameterCode: '00060',
                    period: 'P7D',
                    startTime: null,
                    endTime: null
                });
                expect(mockStatsCalls).toHaveLength(0);
            });
        });
        /*
        TODO: Tests to consider adding: Tests to make sure data is inserted into the store correctly,
        Tests to see if temperature calculation for fahrenheit works.
         */
    });
});

