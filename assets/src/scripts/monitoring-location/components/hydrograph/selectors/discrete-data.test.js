import {getVisibleGroundwaterLevelPoints, anyVisibleGroundwaterLevels} from './discrete-data';

describe('monitoring-location/components/hydrograph/selectors/discrete-data', () => {

    const TEST_STATE = {
            ianaTimeZone: 'America/Chicago',
            ivTimeSeriesData: {
                queryInfo: {
                    'current:P7D': {
                        notes: {
                            requestDT: 1490936400000,
                            'filter:timeRange': {
                                mode: 'PERIOD',
                                periodDays: 7,
                                modifiedSince: null
                            }
                        }
                    }
                },
                variables: {
                    '45807042': {
                        variableCode: {
                            'value': '72019'
                        }
                    },
                    '45807041': {
                        variableCode: {
                            'value': '00060'
                        }
                    }
                }
            },
            ivTimeSeriesState: {
                currentIVDateRange: 'P7D',
                currentIVVariableID: '45807042'
            },
            discreteData: {
                groundwaterLevels: {
                    '45807042': {
                        variable: {
                            variableCode: {
                                value: '72019'
                            },
                            oid: '45807042'
                        },
                        values: [
                            {value: '14.0', dateTime: 1491055200000},
                            {value: '14.5', dateTime: 1490882400000},
                            {value: '13.0', dateTime: 1490536800000},
                            {value: '12.0', dateTime: 1489672800000}
                        ]
                    }
                }
            }
        };

    describe('getVisibleGroundWaterLevelPoints', () => {

        it('Return empty array if no groundwater levels are defined', () => {
            const testData = {
                ...TEST_STATE,
                discreteData: {
                    groundwaterLevels: null
                }
            };
            expect(getVisibleGroundwaterLevelPoints(testData)).toHaveLength(0);
        });

        it('Return an empty array if the current variable does not have ground water data', () => {
            const testData = {
                ...TEST_STATE,
                ivTimeSeriesState: {
                    ...TEST_STATE.ivTimeSeriesState,
                    currentIVVariableID: '45807041'
                }
            };
            expect(getVisibleGroundwaterLevelPoints(testData)).toHaveLength(0);
        });

        it('Return the ground water levels that are in the 7 day period', () => {
            const result = getVisibleGroundwaterLevelPoints(TEST_STATE);
            expect(result).toHaveLength(2);
        });
    });

    describe('anyVisibleGroundWaterLevels', () => {
        it('Return false if no visible ground water levels', () => {
            const testData = {
                ...TEST_STATE,
                discreteData: {
                    groundwaterLevels: null
                }
            };
            expect(anyVisibleGroundwaterLevels(testData)).toBe(false);
        });

        it('Return true if visible ground water levels', () => {
            expect(anyVisibleGroundwaterLevels(TEST_STATE)).toBe(true);
        });
    });
});