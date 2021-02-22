import {getTimeRange, getIVData, getMedianStatisticsData, getGroundwaterLevels, getIVValueRange,
    getGroundwaterLevelsValueRange, getPrimaryParameter, getPrimaryMethods, getPrimaryMedianStatisticsData,
    getPrimaryMedianStatisticsValueRange
} from './hydrograph-data-selector';

describe('monitoring-location/selectors/hydrograph-data-selectors', () => {

    const TEST_PRIMARY_IV_DATA = {
        parameter: {
            parameterCode: '00060',
            name: 'Streamflow ft3/s',
            description: 'Discharge, cubic feet per second',
            unit: 'ft3/s'
        },
        values: {
            '15776': {
                points: [
                    {value: 18.2, dateTime: 1613421000000},
                    {value: 20.2, dateTime: 1613421900000},
                    {value: 19.9, dateTime: 1613422800000}],
                method: {methodID: '15776'}
            }
        }
    };

    const TEST_COMPARE_IV_DATA = {
        parameter: {
            parameterCode: '00060',
            name: 'Streamflow ft3/s',
            description: 'Discharge, cubic feet per second',
            unit: 'ft3/s'
        },
        values: {
            '15776': {
                points: [
                    {value: 15.2, dateTime: 1581885000000},
                    {value: 13.2, dateTime: 1581885900000},
                    {value: 12.9, dateTime: 1581886800000}],
                method: {methodID: '15776'}
            }
        }
    };

    const TEST_MEDIAN_DATA = {
        '153885': [
            {month_nu: 2, day_nu: 1, p50_va: 16, ts_id: '153885', loc_web_ds: 'Method1', begin_yr: '2011', end_yr: '2020'},
            {month_nu: 2, day_nu: 2, p50_va: 16.2, ts_id: '153885', loc_web_ds: 'Method1', begin_yr: '2011', end_yr: '2020'},
            {month_nu: 2, day_nu: 3, p50_va: 15.9, ts_id: '153885', loc_web_ds: 'Method1', begin_yr: '2011', end_yr: '2020'},
            {month_nu: 2, day_nu: 4, p50_va: 16.3, ts_id: '153885', loc_web_ds: 'Method1', begin_yr: '2011', end_yr: '2020'},
            {month_nu: 2, day_nu: 4, p50_va: 16.4, ts_id: '153885', loc_web_ds: 'Method1', begin_yr: '2011', end_yr: '2020'},
            {month_nu: 2, day_nu: 4, p50_va: 16.5, ts_id: '153885', loc_web_ds: 'Method1', begin_yr: '2011', end_yr: '2020'}
            ]
    };

    const TEST_GROUNDWATER_LEVELS = {
        parameter: {
            parameterCode: '72019',
            name: 'Depth to water level, ft below land surface',
            description: 'Depth to water level, feet below land surface',
            unit: 'ft'
        },
        values: [
            {value: 27.33, dateTime: 1613421000000},
            {value: 26.2, dateTime: 1613421900000},
            {value: 26.8, dateTime: 1613422800000}
        ]
    };

    describe('getTimeRange', () => {
        it('returns null if time range is not defined', () => {
            expect(getTimeRange('current')({
                hydrographData: {}
            })).toBeNull();
        });

        it('returns the stored time range for the timeRangeKind', () => {
            expect(getTimeRange('current')({
                hydrographData: {
                    currentTimeRange: {
                        start: 1613413736967,
                        end: 1614018536967
                    },
                    prioryearTimeRange: {
                        start: 1581877736967,
                        end: 1582482536967
                    }
                }
            })).toEqual({
                start: 1613413736967,
                end: 1614018536967
            });
        });
    });

    describe('getIVData', () => {
        it('returns null if no iv data of data kind is store', () => {
            expect(getIVData('primary')({
                hydrographData: {}
            })).toBeNull();
        });

        it('Returns the selected IV Data', () => {
            expect(getIVData('primary')({
               hydrographData: {
                   primaryIVData: TEST_PRIMARY_IV_DATA,
                   compareIVData: TEST_COMPARE_IV_DATA
               }
            })).toEqual(TEST_PRIMARY_IV_DATA);
            expect(getIVData('compare')({
               hydrographData: {
                   primaryIVData: TEST_PRIMARY_IV_DATA,
                   compareIVData: TEST_COMPARE_IV_DATA
               }
            })).toEqual(TEST_COMPARE_IV_DATA);
        });
    });

    describe('getMedianStatistics', () => {
        it('Returns null if no median data', () => {
            expect(getMedianStatisticsData({
                hydrographData: {}
            })).toBeNull();
        });

        it('Returns the median data', () => {
            expect(getMedianStatisticsData({
                hydrographData: {
                    medianStatisticsData: TEST_MEDIAN_DATA
                }
            })).toEqual(TEST_MEDIAN_DATA);
        });
    });

    describe('getGroundwaterLevels', () => {
        it('Returns null if no groundwater level data', () => {
            expect(getGroundwaterLevels({
                hydrographData: {}
            })).toBeNull();
        });

        it('Returns groundwater level data', () => {
            expect(getGroundwaterLevels({
                hydrographData: {
                    groundwaterLevels: TEST_GROUNDWATER_LEVELS
                }
            })).toEqual(TEST_GROUNDWATER_LEVELS);
        });
    });

    describe('getIVValueRange', () => {
        it('Returns null if no iv data', () => {
            expect(getIVValueRange('primary')({
                hydrographData: {}
            })).toBeNull();
        });

        it('Returns value range of the iv data selected', () => {
            const testState = {
                'hydrographData': {
                    primaryIVData: TEST_PRIMARY_IV_DATA,
                    compareIVData: TEST_COMPARE_IV_DATA
                }
            };

            expect(getIVValueRange('primary')(testState)).toEqual([18.2, 20.2]);
            expect(getIVValueRange('compare')(testState)).toEqual([12.9, 15.2]);
        });
    });

    describe('getGroundwaterLevelsValueRange', () => {
        it('Returns null if no groundwater levels are defined', () => {
            expect(getGroundwaterLevelsValueRange({
                hydrographData: {}
            })).toBeNull();
        });

        it('Returns value range of the groundwater data', () => {
            expect(getGroundwaterLevelsValueRange({
                hydrographData: {
                    groundwaterLevels: TEST_GROUNDWATER_LEVELS
                }
            })).toEqual([26.2, 27.33]);
        });
    });

    describe('getPrimaryParameter', () => {
        it('Returns null if no IV or groundwater levels are defined', () => {
            expect(getPrimaryParameter({
                hydrographData: {}
            })).toBeNull();
        });

        it('Returns the parameter from IV if defined', () => {
            expect(getPrimaryParameter({
                hydrographData: {
                    primaryIVData: TEST_PRIMARY_IV_DATA,
                    groundwaterLevels: TEST_GROUNDWATER_LEVELS
                }
            })).toEqual(TEST_PRIMARY_IV_DATA.parameter);
        });

        it('Return the parameter from groundwater levels if no IV data', () => {
            expect(getPrimaryParameter({
                hydrographData: {
                    groundwaterLevels: TEST_GROUNDWATER_LEVELS
                }
            })).toEqual(TEST_GROUNDWATER_LEVELS.parameter);
        });
    });

    describe('getPrimaryMethods', () => {
        it('Returns empty array if no IV data', () => {
            expect(getPrimaryMethods({
                hydrographData: {}
            })).toEqual([]);
        });

        it('Returns the methods array if primary IV Data', () => {
            expect(getPrimaryMethods({
                hydrographData: {
                    primaryIVData: TEST_PRIMARY_IV_DATA
                }
            })).toEqual([{methodID: '15776'}]);
        });
    });

    describe('getPrimaryMedianStatisticsData', () => {
        it('Returns null if no median statistics data', () => {
            expect(getPrimaryMedianStatisticsData({
                hydrographData: {}
            })).toBeNull();
        });

        it('Returns median statistics data for current time range', () => {
            expect(getPrimaryMedianStatisticsData({
                hydrographData: {
                    currentTimeRange: {
                        start: 1612280374000,
                        end: 1612539574000
                    },
                    medianStatisticsData: TEST_MEDIAN_DATA
                }
            })).toEqual({
                '153885': {
                    values: [
                        {point: 16.2, dateTime: 1612280374000},
                        {point: 15.9, dateTime: 1612332000000},
                        {point: 16.3, dateTime: 1612418400000},
                        {point: 16.3, dateTime: 1612539574000}
                    ],
                    description: 'Method1',
                    beginYear: '2011',
                    endYear: '2020'
                }
            });
        });
    });

    describe('getPrimaryMedianStatisticsValueRange', () => {
        it('Return null if no statistics data', () => {
            expect(getPrimaryMedianStatisticsValueRange({
                hydrographData: {}
            })).toBeNull();
        });

        it('Returns median statistics value range for current time range', () => {
            expect(getPrimaryMedianStatisticsValueRange({
                hydrographData: {
                    currentTimeRange: {
                        start: 1612280374000,
                        end: 1612539574000
                    },
                    medianStatisticsData: TEST_MEDIAN_DATA
                }
            })).toEqual([15.9, 16.3]);
        });
    });
});