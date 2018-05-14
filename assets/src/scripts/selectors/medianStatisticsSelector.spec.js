const { getMedianStatistics, getMedianStatisticsByParmCd, getCurrentVariableMedianStatistics,
    getCurrentVariableMedianStatisticsInDateRange} = require('./medianStatisticsSelector');

fdescribe('medianStatisticsSelector', () => {
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

    describe('getCurrentVariableMedianStatisticsInDateRange', () => {

    })
});