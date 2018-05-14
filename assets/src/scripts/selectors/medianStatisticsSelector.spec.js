const { getMedianStatistics, getMedianStatisticsByParmCd, getCurrentVariableMedianStatistics,
    getCurrentVariableMedianStatPointsInDateRange} = require('./medianStatisticsSelector');

describe('medianStatisticsSelector', () => {
    describe('getMedianStatistics', () => {
        it('Return empty object if median is not in the statisticsData in the state', () => {
            expect(getMedianStatistics({
                statisticsData: {}
            })).toEqual({});
        });

        it('Return median data if it exists', () => {
            expect(getMedianStatistics({
                statisticsData: {
                    median: {
                        '00010': [],
                        '00020': []
                    }
                }
            })).toEqual({
                '00010': [],
                '00020': []
            });
        });
    });

    describe('getMedianStatisticsByParmCd', () => {
        it('Return null if median statistics are not in the state', () => {
            expect(getMedianStatisticsByParmCd('00010')({
                statisticsData: {}
            })).toBeNull();
        });

        it('Return null if the parameter cd is not in the state', () => {
            expect(getMedianStatisticsByParmCd('00010')({
                statisticsData: {
                    median: {
                        '00060': [1, 2, 3]
                    }
                }
            })).toBeNull();
        });

        it('Return the median data for the parameter cd', () => {
            expect(getMedianStatisticsByParmCd('00010')({
                statisticsData: {
                    median: {
                        '00060': [1, 2, 3],
                        '00010': [4, 5]
                    }
                }
            })).toEqual([4, 5]);
        });
    });

    describe('getCurrentVariableMedianStatistics', () => {
        const TEST_VARS = {
            '45807042': {
                variableCode: {
                    'value': '00060'
                }
            },
            '450807142': {
                variableCode: {
                    'value': '00010'
                }
            }
        };

        const TEST_STATE = {
            series: {
                variables: TEST_VARS
            },
            statisticsData : {
                median: {}
            },
            timeSeriesState: {
                currentVariableID: '45807042'
            }
        };

        it('Return null if no median data', () => {
            expect(getCurrentVariableMedianStatistics(TEST_STATE)).toBeNull();
        });

        it('Return null if the parameter is not in the median data', () => {
            expect(getCurrentVariableMedianStatistics({
                ...TEST_STATE,
                statisticsData: {
                    median: {
                        '00010': [1, 2, 3]
                    }
                }
            })).toBeNull();
        });

        it('Return the median data for the current variable', () => {
            expect(getCurrentVariableMedianStatistics({
                ...TEST_STATE,
                statisticsData: {
                    median: {
                        '00010': [1, 2, 3],
                        '00060': [4, 5]
                    }
                }
            })).toEqual([4, 5]);
        });
    });

    describe('getCurrentVariableMedianStatsPointInDateRange', () => {
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
            series: {
                queryInfo: {
                    'current:P7D': {
                        notes: {
                            requestDT: new Date('2017-03-01 11:15'),
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
                    '00010': [
                        {
                            month_nu: '2',
                            day_nu: '20',
                            p50_va: '40'
                        }, {
                            month_nu: '2',
                            day_nu: '21',
                            p50_va: '41'
                        }, {
                            month_nu: '2',
                            day_nu: '22',
                            p50_va: '42'
                        }, {
                            month_nu: '2',
                            day_nu: '23',
                            p50_va: '43'
                        }, {
                            month_nu: '2',
                            day_nu: '24',
                            p50_va: '44'
                        }, {
                            month_nu: '2',
                            day_nu: '25',
                            p50_va: '43'
                        }, {
                            month_nu: '2',
                            day_nu: '26',
                            p50_va: '42'
                        }, {
                            month_nu: '2',
                            day_nu: '27',
                            p50_va: '41'
                        }, {
                            month_nu: '2',
                            day_nu: '28',
                            p50_va: '40'
                        }, {
                            month_nu: '3',
                            day_nu: '1',
                            p50_va: '39'
                        }, {
                            month_nu: '3',
                            day_nu: '2',
                            p50_va: '38'
                        }
                    ]
                }
            },
            timeSeriesState: {
                currentVariableID: '45807142',
                currentDateRange: 'P7D'
            }
        };

        it('Return the expected data points', () =>  {
            let result = getCurrentVariableMedianStatPointsInDateRange(TEST_STATE);
            expect(result.length).toBe(8);
            expect(result[0]).toEqual({
                value: '42',
                date: new Date('2017-02-22 00:00')
            });
            expect(result[7]).toEqual({
                value: '39',
                date: new Date('2017-03-01 00:00')
            });
        });

        it('Return empty array of no median data for the selected current variable exists', () => {
            const newTestState = {
                ...TEST_STATE,
                timeSeriesState: {
                    ...TEST_STATE.timeSeriesState,
                    currentVariableID: '45807042'
                }
            };
            expect(getCurrentVariableMedianStatPointsInDateRange(newTestState)).toEqual([]);
        });
    });
});