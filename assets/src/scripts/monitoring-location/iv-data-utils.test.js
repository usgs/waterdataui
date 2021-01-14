import {
    convertCelsiusCollectionsToFahrenheitAndMerge,
    isPeriodCustom,
    isPeriodWithinAcceptableRange,
    parsePeriodCode
} from './iv-data-utils';
import {combineReducers, createStore} from 'redux';

import {ivTimeSeriesDataReducer} from 'ml/store/instantaneous-value-time-series-data';

describe('isPeriodWithinAcceptableRange', () => {
    it('will return correct boolean value if the url parameters for time period a within an acceptable range', () => {
        expect(isPeriodWithinAcceptableRange('totalNonsense')).toEqual(false);
        expect(isPeriodWithinAcceptableRange('P700000D')).toEqual(false);
        expect(isPeriodWithinAcceptableRange('P2Y')).toEqual(false);
        expect(isPeriodWithinAcceptableRange('P1Y')).toEqual(true);
        expect(isPeriodWithinAcceptableRange('P32D')).toEqual(true);
    });
});

describe('isCustomPeriod', () => {
    it('will return correct boolean value is period is custom', () => {
        expect(isPeriodCustom('P7D')).toEqual(false);
        expect(isPeriodCustom('P30D')).toEqual(false);
        expect(isPeriodCustom('P1Y')).toEqual(false);
        expect(isPeriodCustom('P32D')).toEqual(true);
    });
});

describe('parsePeriodCode', () => {
    it('will break down the period code into input selection button and the number of days the user entered', () => {
        expect(parsePeriodCode('P32D'))
            .toEqual({mainTimeRangeSelectionButton: 'custom', numberOfDaysFieldValue: '32'});
        expect(parsePeriodCode('P1Y'))
            .toEqual({mainTimeRangeSelectionButton: 'P1Y', numberOfDaysFieldValue: ''});
        expect(parsePeriodCode(null))
            .toEqual({'mainTimeRangeSelectionButton' : 'P7D', 'numberOfDaysFieldValue': ''});
    });
});


describe('convertCelsiusCollectionsToFahrenheitAndMerge', () => {
    let store;
    const TEST_STATE = {
        'variables': {
            '45807042': {
                'variableCode': {
                    'value': '00010',
                    'variableID': 45807042
                },
                'variableName': 'Temperature, water, °C',
                'variableDescription': 'Temperature, water, degrees Celsius',
                'unit': {
                    'unitCode': 'deg C'
                },
                'oid': '45807042'
            },
            '45807197': {
                'variableCode': {
                    'value': '00060',
                    'variableID': 45807197
                },
                'variableName': 'Streamflow, ft³/s',
                'variableDescription': 'Discharge, cubic feet per second',
                'unit': {
                    'unitCode': 'ft3/s'
                },
                'oid': '45807197'
            },
            '45807202': {
                'variableCode': {
                    'value': '00065',
                    'variableID': 45807202
                },
                'variableName': 'Gage height, ft',
                'variableDescription': 'Gage height, feet',
                'unit': {
                    'unitCode': 'ft'
                },
                'oid': '45807202'
            }
        },
        'timeSeries': {
            '157775:current:P7D': {
                'variable': '45807042',
                'points': [
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609515000000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609515900000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609516800000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609517700000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609518600000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609519500000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609520400000
                    }
                ]
            },
            '157776:current:P7D': {
                'variable': '45807197'
            },
            '237348:current:P7D': {
                'variable': '45807202'
            }
        },
        'timeSeriesCollections': {
            'USGS:05370000:00010:00000:current:P7D': {
                'variable': '45807042',
                'name': 'USGS:05370000:00010:00000',
                'timeSeries': [
                    '157775:current:P7D'
                ]
            },
            'USGS:05370000:00060:00000:current:P7D': {
                'variable': '45807197',
                'name': 'USGS:05370000:00060:00000',
                'timeSeries': [
                    '157776:current:P7D'
                ]
            },
            'USGS:05370000:00065:00000:current:P7D': {
                'variable': '45807202',
                'name': 'USGS:05370000:00065:00000',
                'timeSeries': [
                    '237348:current:P7D'
                ]
            }
        }
    };

    beforeEach(() => {
        store = createStore(
            combineReducers({
                ivTimeSeriesData: ivTimeSeriesDataReducer
            }),
            {
                ivTimeSeriesData: {
                    ...TEST_STATE
                }
            }
        );
    });

    const convertedVariableValue =
        {'oid': '45807042F',
            'unit': {'unitCode': 'deg F'},
            'variableCode': {'value': '00010F', 'variableID': '45807042F'},
            'variableDescription': 'Temperature, water, degrees Fahrenheit (calculated)',
            'variableName': 'Temperature, water, °F (calculated)'
        };
    const convertedPoints = [
        {
            'dateTime': 1609515000000,
            'qualifiers': [
                'P'
            ],
            'value': '37.22'
        },
        {
            'dateTime': 1609515900000,
            'qualifiers': [
                'P'
            ],
            'value': '37.40'
        },
        {
            'dateTime': 1609516800000,
            'qualifiers': [
                'P'
            ],
            'value': '37.40'
        },
        {
            'dateTime': 1609517700000,
            'qualifiers': [
                'P'
            ],
            'value': '37.40'
        },
        {
            'dateTime': 1609518600000,
            'qualifiers': [
                'P'
            ],
            'value': '37.58'
        },
        {
            'dateTime': 1609519500000,
            'qualifiers': [
                'P'
            ],
            'value': '37.58'
        },
        {
            'dateTime': 1609520400000,
            'qualifiers': [
                'P'
            ],
            'value': '37.58'
        }
    ];

    const TEST_COLLECTION_WITH_MEASURED_FAHRENHEIT = {
        'variables': {
            '1': {
                'variableCode': {
                    'value': '00010',
                    'variableID': 1
                },
                'variableName': 'Temperature, water, °C',
                'variableDescription': 'Temperature, water, degrees Celsius',
                'unit': {
                    'unitCode': 'deg C'
                },
                'oid': '1'
            },
            '2': {
                'variableCode': {
                    'value': '00011',
                    'variableID': 2
                },
                'variableName': 'Temperature, water, °F',
                'variableDescription': 'Temperature, water, degrees Fahrenheit',
                'unit': {
                    'unitCode': 'deg F'
                },
                'oid': '2'
            }
        },
        'timeSeries': {
            '157775:current:P7D': {
                'variable': '1'
            },
            '157776:current:P7D': {
                'variable': '2'
            }
        }
    };


    it('will create a new variables key with the correct suffix in application state', () => {
        convertCelsiusCollectionsToFahrenheitAndMerge(TEST_STATE);
        const keyWithsuffix = '45807042F';
        const resultingState = Object.keys(store.getState().ivTimeSeriesData.variables);
        expect(resultingState.includes(keyWithsuffix)).toBeTruthy();
    });

    it('will create a new variable with the correct properties in application state', () => {
        convertCelsiusCollectionsToFahrenheitAndMerge(TEST_STATE);
        const keyWithsuffix = '45807042F';
        const resultingState = store.getState().ivTimeSeriesData.variables[keyWithsuffix];
        expect(resultingState).toStrictEqual(convertedVariableValue);
    });

    it('adds only the expected number of variables to the collection', () => {
        convertCelsiusCollectionsToFahrenheitAndMerge(TEST_STATE);
        const resultingState = Object.keys(store.getState().ivTimeSeriesData.variables);
        expect(resultingState).toHaveLength(4);
    });

    it('will create a new timeSeries key with the expected key name', () => {
        convertCelsiusCollectionsToFahrenheitAndMerge(TEST_STATE);
        const resultingState = Object.keys(store.getState().ivTimeSeriesData.timeSeries);
        const timeSeriesKey = '157775:current:P7D:00010F';
        expect(resultingState.includes(timeSeriesKey)).toBeTruthy();
    });

    it('will create a new set of converted temperature points', () => {
        convertCelsiusCollectionsToFahrenheitAndMerge(TEST_STATE);
        const timeSeriesKey = '157775:current:P7D:00010F';
        const resultingState = store.getState().ivTimeSeriesData.timeSeries[timeSeriesKey].points;
        expect(resultingState).toStrictEqual(convertedPoints);
    });

    it('will not add new keys if a measured Fahrenheit parameter already exists', () => {
        convertCelsiusCollectionsToFahrenheitAndMerge(TEST_COLLECTION_WITH_MEASURED_FAHRENHEIT);
        const convertedTimeSeriesKey = '157775:current:P7D:00010F';
        const resultingState = store.getState().ivTimeSeriesData;
        expect(convertedTimeSeriesKey in resultingState).not.toBeTruthy();
    });
});
