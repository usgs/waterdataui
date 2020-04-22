import { getMedianStatistics, getMedianStatisticsByParmCd, getCurrentVariableMedianStatistics, getCurrentVariableMedianMetadata } from './median-statistics-selector';

describe('median-statistics-selector', () => {
    const TEST_VARS = {
        '45807042': {
            variableCode: {
                'value': '00060'
            }
        },
        '45807142': {
            variableCode: {
                'value': '00010'
            }
        }
    };

    const TEST_STATE = {
        ivTimeSeriesData: {
            queryInfo: {
                'current:P7D': {
                    notes: {
                        requestDT: new Date('2017-03-01 11:15').getTime(),
                        'filter:timeRange': {
                            mode: 'PERIOD',
                            periodDays: 7,
                            modifiedSince: null
                        }
                    }
                }
            },
            variables: TEST_VARS
        },
        statisticsData : {
            median: {
                '00010': {
                    '1234': [
                        {
                            month_nu: '2',
                            day_nu: '20',
                            p50_va: '40',
                            begin_yr: '1970',
                            end_yr: '2017',
                            loc_web_ds: 'This method'
                        }, {
                            month_nu: '2',
                            day_nu: '21',
                            p50_va: '41',
                            begin_yr: '1970',
                            end_yr: '2017',
                            loc_web_ds: 'This method'
                        }, {
                            month_nu: '2',
                            day_nu: '22',
                            p50_va: '42',
                            begin_yr: '1970',
                            end_yr: '2017',
                            loc_web_ds: 'This method'
                        }, {
                            month_nu: '2',
                            day_nu: '23',
                            p50_va: '43',
                            begin_yr: '1970',
                            end_yr: '2017',
                            loc_web_ds: 'This method'
                        }, {
                            month_nu: '2',
                            day_nu: '24',
                            p50_va: '44',
                            begin_yr: '1970',
                            end_yr: '2017',
                            loc_web_ds: 'This method'
                        }, {
                            month_nu: '2',
                            day_nu: '25',
                            p50_va: '43',
                            begin_yr: '1970',
                            end_yr: '2017',
                            loc_web_ds: 'This method'
                        }, {
                            month_nu: '2',
                            day_nu: '26',
                            p50_va: '42',
                            begin_yr: '1970',
                            end_yr: '2017',
                            loc_web_ds: 'This method'
                        }, {
                            month_nu: '2',
                            day_nu: '27',
                            p50_va: '41',
                            begin_yr: '1970',
                            end_yr: '2017',
                            loc_web_ds: 'This method'
                        }, {
                            month_nu: '2',
                            day_nu: '28',
                            p50_va: '40',
                            begin_yr: '1970',
                            end_yr: '2017',
                            loc_web_ds: 'This method'
                        }, {
                            month_nu: '2',
                            day_nu: '29',
                            p50_va: '41',
                            begin_yr: '1970',
                            end_yr: '2017',
                            loc_web_ds: 'This method'
                        }, {
                            month_nu: '3',
                            day_nu: '1',
                            p50_va: '39',
                            begin_yr: '1970',
                            end_yr: '2017',
                            loc_web_ds: 'This method'
                        }, {
                            month_nu: '3',
                            day_nu: '2',
                            p50_va: '38',
                            begin_yr: '1970',
                            end_yr: '2017',
                            loc_web_ds: 'This method'
                        }
                    ]
                },
                '00060': {
                    '2': [{
                        month_nu: '3',
                        day_nu: '1',
                        p50_va: '39',
                        begin_yr: '1980',
                        end_yr: '2010',
                        loc_web_ds: 'That method'
                    }]
                }
            }
        },
        ivTimeSeriesState: {
            currentIVVariableID: '45807142',
            currentIVDateRangeKind: 'P7D'
        }
    };

    describe('getMedianStatistics', () => {
        it('Return empty object if median is not in the statisticsData in the state', () => {
            expect(getMedianStatistics({
                ...TEST_STATE,
                statisticsData: {}
            })).toEqual({});
        });

        it('Return median data if it exists', () => {
            expect(getMedianStatistics(TEST_STATE)).toEqual(TEST_STATE.statisticsData.median);
        });
    });

    describe('getMedianStatisticsByParmCd', () => {
        it('Return null if median statistics are not in the state', () => {
            expect(getMedianStatisticsByParmCd('00010')({
                ...TEST_STATE,
                statisticsData: {}
            })).toBeNull();
        });

        it('Return null if the parameter cd is not in the state', () => {
            expect(getMedianStatisticsByParmCd('00010')({
                ...TEST_STATE,
                statisticsData: {
                    ...TEST_STATE.statisticsData,
                    median: {
                        '00060': {
                            ...TEST_STATE.statisticsData.median['00060']
                        }
                    }
                }
            })).toBeNull();
        });

        it('Return the median data for the parameter cd', () => {
            expect(getMedianStatisticsByParmCd('00010')(TEST_STATE)).toEqual(TEST_STATE.statisticsData.median['00010']);
        });
    });

    describe('getCurrentVariableMedianStatistics', () => {

        it('Return null if no median data', () => {
            expect(getCurrentVariableMedianStatistics({
                ...TEST_STATE,
                statisticsData: {}
            })).toBeNull();
        });

        it('Return null if the parameter is not in the median data', () => {
            expect(getCurrentVariableMedianStatistics({
                ...TEST_STATE,
                statisticsData: {
                    ...TEST_STATE.statisticsData,
                    median: {
                        '00060': {
                            ...TEST_STATE.statisticsData.median['00060']
                        }
                    }
                }
            })).toBeNull();
        });

        it('Return the median data for the current variable', () => {
            expect(getCurrentVariableMedianStatistics(TEST_STATE)).toEqual(TEST_STATE.statisticsData.median['00010']);
        });
    });

    describe('getCurrentVariableMedianMetadata', () => {

        it('Returns an empty object if no current variable median stats', () => {
            expect(getCurrentVariableMedianMetadata({
                ...TEST_STATE,
                statisticsData: {
                    ...TEST_STATE.statisticsData,
                    median: {
                        '00060': {
                            ...TEST_STATE.statisticsData.median['00060']
                        }
                    }
                }
            })).toEqual({});
        });

        it('Returns the expected median stats for the current variable', () => {
            expect(getCurrentVariableMedianMetadata(TEST_STATE)).toEqual({
                '1234': {
                    beginYear: '1970',
                    endYear: '2017',
                    methodDescription: 'This method'
                }
            });
        });
    });
});
