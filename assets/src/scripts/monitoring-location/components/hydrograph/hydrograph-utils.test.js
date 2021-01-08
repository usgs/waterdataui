import {isPeriodWithinAcceptableRange,
    isPeriodCustom,
    parsePeriodCode,
    convertTemperatureSeriesAndAddToCollection
} from './hydrograph-utils';

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

describe('convertTemperatureSeriesAndAddToCollection', () => {
    const testCollection = {
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
    const convertedCollection = convertTemperatureSeriesAndAddToCollection(testCollection);
    const convertedVariableKey = '45807042_F';
    const convertedTimeSeriesKey = '157775:current:P7D:00010F';
    const convertedVariableValue = 
        {'oid': '45807042_F',
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
            'value': 37.22
        },
        {
            'dateTime': 1609515900000,
            'qualifiers': [
                'P'
            ],
            'value': 37.4
        },
        {
            'dateTime': 1609516800000,
            'qualifiers': [
                'P'
            ],
            'value': 37.4
        },
        {
            'dateTime': 1609517700000,
            'qualifiers': [
                'P'
            ],
            'value': 37.4
        },
        {
            'dateTime': 1609518600000,
            'qualifiers': [
                'P'
            ],
            'value': 37.58
        },
        {
            'dateTime': 1609519500000,
            'qualifiers': [
                'P'
            ],
            'value': 37.58
        },
        {
            'dateTime': 1609520400000,
            'qualifiers': [
                'P'
            ],
            'value': 37.58
        }
    ];

    it('will create a new variables key with the correct suffix', () => {
        expect(Object.keys(convertedCollection.variables).includes(convertedVariableKey)).toBeTruthy();
    });

    it('will create a new variable with the correct properties', () => {
        expect(convertedCollection.variables[convertedVariableKey]).toStrictEqual(convertedVariableValue);
    });

    it('adds only the expected number of variables to the collection', () => {
        expect(Object.entries(convertedCollection.variables)).toHaveLength(4);
    });

    it('will create a new timeSeries key with the expected name', () => {
        expect(Object.keys(convertedCollection.timeSeries).includes(convertedTimeSeriesKey)).toBeTruthy();
    });

    it('will create a new timeSeries with correct variable', () => {
        expect(convertedCollection.timeSeries[convertedTimeSeriesKey].variable).toEqual(convertedVariableKey);
    });

    it('will create a new set of converted temperature points', () => {
        expect(convertedCollection.timeSeries[convertedTimeSeriesKey].points).toStrictEqual(convertedPoints);
    });
});
