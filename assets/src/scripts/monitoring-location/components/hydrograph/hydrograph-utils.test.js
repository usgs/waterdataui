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
                    'network': 'NWIS',
                    'vocabulary': 'NWIS:UnitValues',
                    'variableID': 45807042,
                    'default': true
                },
                'variableName': 'Temperature, water, °C',
                'variableDescription': 'Temperature, water, degrees Celsius',
                'valueType': 'Derived Value',
                'unit': {
                    'unitCode': 'deg C'
                },
                'options': [
                    '00000'
                ],
                'note': [],
                'noDataValue': -999999,
                'variableProperty': [],
                'oid': '45807042'
            },
            '45807197': {
                'variableCode': {
                    'value': '00060',
                    'network': 'NWIS',
                    'vocabulary': 'NWIS:UnitValues',
                    'variableID': 45807197,
                    'default': true
                },
                'variableName': 'Streamflow, ft³/s',
                'variableDescription': 'Discharge, cubic feet per second',
                'valueType': 'Derived Value',
                'unit': {
                    'unitCode': 'ft3/s'
                },
                'options': [
                    '00000'
                ],
                'note': [],
                'noDataValue': -999999,
                'variableProperty': [],
                'oid': '45807197'
            },
            '45807202': {
                'variableCode': {
                    'value': '00065',
                    'network': 'NWIS',
                    'vocabulary': 'NWIS:UnitValues',
                    'variableID': 45807202,
                    'default': true
                },
                'variableName': 'Gage height, ft',
                'variableDescription': 'Gage height, feet',
                'valueType': 'Derived Value',
                'unit': {
                    'unitCode': 'ft'
                },
                'options': [
                    '00000'
                ],
                'note': [],
                'noDataValue': -999999,
                'variableProperty': [],
                'oid': '45807202'
            }
        },
        'timeSeries': {
            '157775:current:P7D': {
                'qualifier': [
                    'P'
                ],
                'qualityControlLevel': [],
                'method': 157775,
                'source': [],
                'offset': [],
                'sample': [],
                'censorCode': [],
                'variable': '45807042',
                'tsKey': 'current:P7D',
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
                'qualifier': [
                    'P'
                ],
                'qualityControlLevel': [],
                'method': 157776,
                'source': [],
                'offset': [],
                'sample': [],
                'censorCode': [],
                'variable': '45807197',
                'tsKey': 'current:P7D',
                'points': []
            },
            '237348:current:P7D': {
                'qualifier': [
                    'P'
                ],
                'qualityControlLevel': [],
                'method': 237348,
                'source': [],
                'offset': [],
                'sample': [],
                'censorCode': [],
                'variable': '45807202',
                'tsKey': 'current:P7D',
                'points': []
            }
        },
        'timeSeriesCollections': {
            'USGS:05370000:00010:00000:current:P7D': {
                'sourceInfo': '05370000',
                'variable': '45807042',
                'name': 'USGS:05370000:00010:00000',
                'timeSeries': [
                    '157775:current:P7D'
                ]
            },
            'USGS:05370000:00060:00000:current:P7D': {
                'sourceInfo': '05370000',
                'variable': '45807197',
                'name': 'USGS:05370000:00060:00000',
                'timeSeries': [
                    '157776:current:P7D'
                ]
            },
            'USGS:05370000:00065:00000:current:P7D': {
                'sourceInfo': '05370000',
                'variable': '45807202',
                'name': 'USGS:05370000:00065:00000',
                'timeSeries': [
                    '237348:current:P7D'
                ]
            }
        }
    };
    const testCollectionConverted = {};
    
    it('will convert a Celsius time series to Fahrenheit and add it to a time series collection', () => {
        expect(convertTemperatureSeriesAndAddToCollection(testCollection)).toEqual(testCollectionConverted);
    });
});
