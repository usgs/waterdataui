import {getAllGroundwaterLevels, getIVCurrentVariableGroundwaterLevels} from './discrete-data-selector';

describe('monitoring-location/selectors/discrete-data-selector', () => {
    describe('getAllGroundwaterLevels', () => {
        it('Return null if no groundwater levels are available', () => {
            expect(getAllGroundwaterLevels({
                discreteData: {}
            })).toBeNull();
            expect(getAllGroundwaterLevels({
                discreteData: {
                    groundwaterLevels: null
                }
            })).toBeNull();
        });

        it('Return all groundwater levels', () => {
            const TEST_DATA = {
                '45807042': {
                    variable: {
                        variableCode: [{
                            value: '72019'
                        }],
                        oid: '45807042'
                    },
                    values: [
                        {value: '11.5', qualifiers: [], date: 1586354400000}
                    ]
                },
                55807042: {
                    variable: {
                        variableCode: [{
                            value: '65433'
                        }],
                        oid: '55807042'
                    },
                    values: [
                        {value: '15.5', qualifiers: [], date: 1586354400000},
                        {value: '24.3', qualifiers: [], date: 1588946400000}
                    ]
                }
            };
            expect(getAllGroundwaterLevels({
                discreteData: {
                    groundwaterLevels: TEST_DATA
                }
            })).toEqual(TEST_DATA);
        });
    });

    describe('getIVCurrentVariableGroundwaterLevels', () => {
        const TEST_IV_TIME_SERIES_DATA = {
            ivTimeSeriesData: {
                variables: {
                    '45807042': {
                        variableCode: {
                            'value': '72019'
                        }
                    },
                    '45807142': {
                        variableCode: {
                            'value': '00010'
                        }
                    }
                }
            }
        };
        const TEST_IV_TIME_SERIES_STATE = {
            ivTimeSeriesState: {
                currentIVVariableID: '45807042'
            }
        };

        const TEST_GROUNDWATER_LEVELS = {
            discreteData : {
                groundwaterLevels : {
                    '45807042': {
                        variable: {
                            variableCode: [{
                                value: '72019'
                            }],
                            oid: '45807042'
                        },
                        values: [
                            {
                                value: '34.5',
                                qualifiers: [],
                                dateTime: 1604775600000
                            },
                            {
                                value: '40.2',
                                qualifiers: [],
                                datetime: 1607972400000
                            }
                        ]
                    }
                }
            }
        };

        it('Return empty object if no groundwater levels and current IV variable is not defined', () => {
            expect(getIVCurrentVariableGroundwaterLevels({
                discreteData: {groundwaterLevels: null},
                ivTimeSeriesState: {},
                ivTimeSeriesData: {}
            })).toEqual({});
        });

        it('Return empty object if no groundwater levels but current IV variable is defined', () => {
            expect(getIVCurrentVariableGroundwaterLevels({
                discreteData: {groundwaterLevels: null},
                ...TEST_IV_TIME_SERIES_DATA,
                ...TEST_IV_TIME_SERIES_STATE
            })).toEqual({});
        });

        it('Return empty object if groundwater levels exist but no current IV variable is defined', () => {
            expect(getIVCurrentVariableGroundwaterLevels({
                ivTimeSeriesState: {},
                ...TEST_IV_TIME_SERIES_DATA,
                ...TEST_GROUNDWATER_LEVELS
            })).toEqual({});
        });

        it('Should return an empty object if no groundwater levels exist for selected IV variable', () => {
            expect(getIVCurrentVariableGroundwaterLevels({
                ivTimeSeriesState: {
                   currentIVVariableID: '45807142'
                },
                ...TEST_IV_TIME_SERIES_DATA,
                ...TEST_GROUNDWATER_LEVELS
            })).toEqual({});
        });

        it('Should return the groundwater levels for selected IV variable', () => {
            expect(getIVCurrentVariableGroundwaterLevels({
                ...TEST_IV_TIME_SERIES_DATA,
                ...TEST_IV_TIME_SERIES_STATE,
                ...TEST_GROUNDWATER_LEVELS
            })).toEqual(TEST_GROUNDWATER_LEVELS.discreteData.groundwaterLevels['45807042']);
        });
    });
});