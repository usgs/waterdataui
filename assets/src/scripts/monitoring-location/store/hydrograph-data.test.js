import mockConsole from 'jest-mock-console';
import * as luxon from 'luxon';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import {default as thunk} from 'redux-thunk';
import sinon from 'sinon';

import {MOCK_IV_DATA, MOCK_TEMP_C_IV_DATA, MOCK_GWLEVEL_DATA, MOCK_STATISTICS_JSON} from 'ui/mock-service-data';

import * as ivDataService from 'ui/web-services/instantaneous-values';
import * as groundwaterLevelService from 'ui/web-services/groundwater-levels';
import * as statisticsDataService from 'ui/web-services/statistics-data';

import config from 'ui/config';

import {hydrographDataReducer, retrieveHydrographData, retrieveMedianStatistics, retrievePriorYearIVData} from './hydrograph-data';

describe('monitoring-location/store/hydrograph-data', () => {
    let store;
    let fakeServer;
    let restoreConsole;

    config.locationTimeZone = 'America/Chicago';

    luxon.DateTime.local = jest.fn().mockReturnValue(luxon.DateTime.fromISO('2021-02-10T12:00', {zone: 'America/Chicago'}));
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
            beforeEach(() => {
                ivDataService.fetchTimeSeries =
                    jest.fn().mockReturnValue(Promise.resolve(JSON.parse(MOCK_IV_DATA)));
                groundwaterLevelService.fetchGroundwaterLevels =
                    jest.fn().mockReturnValue(Promise.resolve(JSON.parse(MOCK_GWLEVEL_DATA)));
                statisticsDataService.fetchSiteStatistics =
                    jest.fn().mockReturnValue(Promise.resolve(MOCK_STATISTICS_JSON));
            });

            it('Expects to retrieve groundwater and IV data if both are in the period of record', () => {
                config.ivPeriodOfRecord = {
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
                config.ivPeriodOfRecord = {
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
                config.ivPeriodOfRecord = {};
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

            it('Loads compare data if requested and period is not a custom period', () => {
                config.ivPeriodOfRecord = {
                    '00060': {begin_date: '2010-01-01', end_date: '2020-01-01'}
                };
                config.gwPeriodOfRecord = {};
                store.dispatch(retrieveHydrographData('11112222', {
                    parameterCode: '00060',
                    period: 'P7D',
                    startTime: null,
                    endTime: null,
                    loadCompare: true,
                    loadMedian: true
                }));

                expect(ivDataService.fetchTimeSeries.mock.calls).toHaveLength(2);
            });

            it('Does not load compare data if requested and period is a custom period', () => {
                config.ivPeriodOfRecord = {
                    '00060': {begin_date: '2010-01-01', end_date: '2020-01-01'}
                };
                config.gwPeriodOfRecord = {};
                store.dispatch(retrieveHydrographData('11112222', {
                    parameterCode: '00060',
                    period: 'P10D',
                    startTime: null,
                    endTime: null,
                    loadCompare: true,
                    loadMedian: true
                }));

                expect(ivDataService.fetchTimeSeries.mock.calls).toHaveLength(1);
            });

            it('Does not load compare data if requested and using custom start and end time', () => {
                config.ivPeriodOfRecord = {
                    '00060': {begin_date: '2010-01-01', end_date: '2020-01-01'}
                };
                config.gwPeriodOfRecord = {};
                store.dispatch(retrieveHydrographData('11112222', {
                    parameterCode: '00060',
                    period: null,
                    startTime: '2020-01-01',
                    endTime: '2020-01-31',
                    loadCompare: true,
                    loadMedian: true
                }));

                expect(ivDataService.fetchTimeSeries.mock.calls).toHaveLength(1);
            });
        });

        describe('data is loaded into the Redux store', () => {
            beforeEach(() => {
                ivDataService.fetchTimeSeries =
                    jest.fn().mockReturnValue(Promise.resolve(JSON.parse(MOCK_IV_DATA)));
                groundwaterLevelService.fetchGroundwaterLevels =
                    jest.fn().mockReturnValue(Promise.resolve(JSON.parse(MOCK_GWLEVEL_DATA)));
                statisticsDataService.fetchSiteStatistics =
                    jest.fn().mockReturnValue(Promise.resolve(MOCK_STATISTICS_JSON));
            });

            it('Expect IV data is stored when available', () => {
                config.ivPeriodOfRecord = {
                    '00060': {begin_date: '2010-01-01', end_date: '2020-01-01'}
                };
                config.gwPeriodOfRecord = {};

                return store.dispatch(retrieveHydrographData('11112222', {
                    parameterCode: '00060',
                    period: 'P7D',
                    startTime: null,
                    endTime: null,
                    loadCompare: false,
                    loadMedian: true
                })).then(() => {
                    const hydrographData = store.getState().hydrographData;

                    expect(hydrographData.currentTimeRange).toEqual({
                        start: 1612375200000,
                        end: 1612980000000
                    });
                    expect(hydrographData.primaryIVData.parameter).toEqual({
                        parameterCode: '00060',
                        name: 'Streamflow, ft&#179;/s',
                        description: 'Discharge, cubic feet per second',
                        unit: 'ft3/s'
                    });
                    expect(hydrographData.primaryIVData.values['158049'].points).toHaveLength(670);
                    expect(hydrographData.primaryIVData.values['158049'].points[0]).toEqual({
                        value: 302,
                        qualifiers: ['P'],
                        dateTime: 1514926800000
                    });
                });
            });

            it('Expect GW data is stored when requested', () => {
                config.ivPeriodOfRecord = {};
                config.gwPeriodOfRecord = {
                    '72019': {begin_date: '2010-01-01', end_date: '2020-01-01'}
                };

                return store.dispatch(retrieveHydrographData('11112222', {
                    parameterCode: '72019',
                    period: 'P7D',
                    startTime: null,
                    endTime: null,
                    loadCompare: false,
                    loadMedian: true
                })).then(() => {
                    const hydrographData = store.getState().hydrographData;

                    expect(hydrographData.currentTimeRange).toEqual({
                        start: 1612375200000,
                        end: 1612980000000
                    });

                    expect(hydrographData.groundwaterLevels.parameter).toEqual({
                        parameterCode: '72019',
                        name: 'Depth to water level, ft below land surface',
                        description: 'Depth to water level, feet below land surface',
                        unit: 'ft'
                    });
                    expect(hydrographData.groundwaterLevels.values).toHaveLength(7);
                    expect(hydrographData.groundwaterLevels.values[0]).toEqual({
                        value: 26.07,
                        qualifiers: ['A', '1'],
                        dateTime: 1579770360000
                    });
                });
            });
        });

        describe('retrieveHydrographData when calculated Fahrenheit is requested', () => {
            beforeEach(() => {
                ivDataService.fetchTimeSeries =
                    jest.fn().mockReturnValue(Promise.resolve(JSON.parse(MOCK_TEMP_C_IV_DATA)));
                config.ivPeriodOfRecord = {
                    '00010': {begin_date: '2010-01-01', end_date: '2020-01-01'}
                };
                config.gwPeriodOfRecord = {};
            });

            it('Expects celsius temperature to be retrieved when calculated is requested', () => {
                store.dispatch(retrieveHydrographData('11112222', {
                    parameterCode: '00010F',
                    period: 'P7D',
                    startTime: null,
                    endTime: null,
                    loadCompare: false,
                    loadMedian: true
                }));

                const mockIVCalls = ivDataService.fetchTimeSeries.mock.calls;
                expect(mockIVCalls).toHaveLength(1);
                expect(mockIVCalls[0][0]).toEqual({
                    sites: ['11112222'],
                    parameterCode: '00010',
                    period: 'P7D',
                    startTime: null,
                    endTime: null
                });
            });

            it('Expects calculated fahrenheit to be stored when requested', () => {
                return store.dispatch(retrieveHydrographData('11112222', {
                    parameterCode: '00010F',
                    period: 'P7D',
                    startTime: null,
                    endTime: null,
                    loadCompare: false,
                    loadMedian: true
                })).then(() => {
                    const hydrographData = store.getState().hydrographData;

                    expect(hydrographData.primaryIVData.parameter).toEqual({
                        parameterCode : '00010F',
                        name: 'Temperature, water, &#176;F (calculated)',
                        description: 'Temperature, water, degrees Fahrenheit (calculated)',
                        unit: 'deg F'
                    });
                    const values = hydrographData.primaryIVData.values['157775'].points.map(point => point.value);
                    expect(values).toHaveLength(3);
                    expect(values).toEqual([35.60, 32.00, 35.78]);
                });
            });
        });
    });

    describe('retrievePriorYearIVData', () => {
        beforeEach(() => {
            ivDataService.fetchTimeSeries =
                jest.fn().mockReturnValue(Promise.resolve(JSON.parse(MOCK_IV_DATA)));
            config.ivPeriodOfRecord = {
                '00060': {begin_date: '2010-01-01', end_date: '2020-01-01'}
            };

            return store.dispatch(retrieveHydrographData('11112222', {
                parameterCode: '00060',
                period: 'P7D',
                startTime: null,
                endTime: null,
                loadCompare: false,
                loadMedian: false
            }));
        });

        it('Expects a call to retrievePriorYearIVData sets the prioryearTimeRange and fetches the data', () => {
            const currentTimeRange = store.getState().hydrographData.currentTimeRange;
            return store.dispatch(retrievePriorYearIVData('11112222', {
                parameterCode: '00060',
                startTime: currentTimeRange.start,
                endTime: currentTimeRange.end
            })).then(() => {
                const hydrographData = store.getState().hydrographData;
                expect(hydrographData.prioryearTimeRange).toEqual({
                    start: 1580839200000,
                    end: 1581444000000
                });
                const mockIVCalls = ivDataService.fetchTimeSeries.mock.calls;
                expect(mockIVCalls).toHaveLength(2);
                expect(mockIVCalls[1][0]).toEqual({
                    sites: ['11112222'],
                    parameterCode: '00060',
                    period: undefined,
                    startTime: '2020-02-04T12:00:00.000-06:00',
                    endTime: '2020-02-11T12:00:00.000-06:00'
                });

                expect(hydrographData.compareIVData).toBeDefined();
            });
        });

        it('Expects a second call to retrievePriorYearIVData does not refetch the data', () => {
            const currentTimeRange = store.getState().hydrographData.currentTimeRange;
            const firstRetrieve = store.dispatch(retrievePriorYearIVData('11112222', {
                parameterCode: '00060',
                startTime: currentTimeRange.start,
                endTime: currentTimeRange.end
            }));
            return firstRetrieve.then(() => {
                return store.dispatch(retrievePriorYearIVData('11112222', {
                    parameterCode: '00060',
                    startTime: currentTimeRange.start,
                    endTime: currentTimeRange.end
                })).then(() => {
                    const mockIVCalls = ivDataService.fetchTimeSeries.mock.calls;
                    expect(mockIVCalls).toHaveLength(2);
                });
            });
        });
    });

    describe('retrieveMedianStatistics', () => {
        beforeEach(() => {
            ivDataService.fetchTimeSeries =
                jest.fn().mockReturnValue(Promise.resolve(JSON.parse(MOCK_IV_DATA)));
            statisticsDataService.fetchSiteStatistics =
                jest.fn().mockReturnValue(Promise.resolve(MOCK_STATISTICS_JSON));
            config.ivPeriodOfRecord = {
                '00060': {begin_date: '2010-01-01', end_date: '2020-01-01'}
            };

            return store.dispatch(retrieveHydrographData('11112222', {
                parameterCode: '00060',
                period: 'P7D',
                startTime: null,
                endTime: null,
                loadCompare: false,
                loadMedian: false
            }));
        });

        it('Expects median data to fetched and stored', () => {
            return store.dispatch(retrieveMedianStatistics('11112222', '00060')).then(() => {
                const mockStatsCalls = statisticsDataService.fetchSiteStatistics.mock.calls;
                expect(mockStatsCalls).toHaveLength(1);
                expect(mockStatsCalls[0][0]).toEqual({
                    siteno: '11112222',
                    statType: 'median',
                    params: ['00060']
                });
                expect(store.getState().hydrographData.medianStatisticsData).toBeDefined();
            });
        });

        it('Expects a second call to median data does not fetch the data again', () => {
            const firstRetrieve = store.dispatch(retrieveMedianStatistics('11112222', '00060'));
            return firstRetrieve.then(() => {
                store.dispatch(retrieveMedianStatistics('11112222', '00060'))
                    .then(() => {
                        const mockStatsCalls = statisticsDataService.fetchSiteStatistics.mock.calls;
                        expect(mockStatsCalls).toHaveLength(1);
                    });
            });
        });
    });
});