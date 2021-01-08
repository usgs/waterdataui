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
            },
            '45807042_F': {
                'variableCode': {
                    'value': '00010F',
                    'network': 'NWIS',
                    'vocabulary': 'NWIS:UnitValues',
                    'variableID': '45807042F',
                    'default': true
                },
                'variableName': 'Temperature, water, °F (calculated)',
                'variableDescription': 'Temperature, water, degrees Fahrenheit (calculated)',
                'valueType': 'Derived Value',
                'unit': {
                    'unitCode': 'deg F'
                },
                'options': [
                    '00000'
                ],
                'note': [],
                'noDataValue': -999999,
                'variableProperty': [],
                'oid': '45807042_F'
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
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609521300000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609522200000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609523100000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609524000000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609524900000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609525800000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609526700000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609527600000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609528500000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609529400000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609530300000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609531200000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609532100000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609533000000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609533900000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609534800000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609535700000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609536600000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609537500000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609538400000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609539300000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609540200000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609541100000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609542000000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609542900000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609543800000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609544700000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609545600000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609546500000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609547400000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609548300000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609549200000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609550100000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609551000000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609551900000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609552800000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609553700000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609554600000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609555500000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609556400000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609557300000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609558200000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609559100000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609560000000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609560900000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609561800000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609562700000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609563600000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609564500000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609565400000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609566300000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609567200000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609568100000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609569000000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609569900000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609570800000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609571700000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609572600000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609573500000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609574400000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609575300000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609576200000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609577100000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609578000000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609578900000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609579800000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609580700000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609581600000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609582500000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609583400000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609584300000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609585200000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609586100000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609587000000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609587900000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609588800000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609589700000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609590600000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609591500000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609592400000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609593300000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609594200000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609595100000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609596000000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609596900000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609597800000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609598700000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609599600000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609600500000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609601400000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609602300000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609603200000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609604100000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609605000000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609605900000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609606800000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609607700000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609608600000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609609500000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609610400000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609611300000
                    },
                    {
                        'value': 3.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609612200000
                    },
                    {
                        'value': 3.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609613100000
                    },
                    {
                        'value': 3.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609614000000
                    },
                    {
                        'value': 3.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609614900000
                    },
                    {
                        'value': 3.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609615800000
                    },
                    {
                        'value': 3.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609616700000
                    },
                    {
                        'value': 3.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609617600000
                    },
                    {
                        'value': 3.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609618500000
                    },
                    {
                        'value': 3.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609619400000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609620300000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609621200000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609622100000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609623000000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609623900000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609624800000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609625700000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609626600000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609627500000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609628400000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609629300000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609630200000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609631100000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609632000000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609632900000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609633800000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609634700000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609635600000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609636500000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609637400000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609638300000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609639200000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609640100000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609641000000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609641900000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609642800000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609643700000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609644600000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609645500000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609646400000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609647300000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609648200000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609649100000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609650000000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609650900000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609651800000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609652700000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609653600000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609654500000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609655400000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609656300000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609657200000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609658100000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609659000000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609659900000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609660800000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609661700000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609662600000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609663500000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609664400000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609665300000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609666200000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609667100000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609668000000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609668900000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609669800000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609670700000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609671600000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609672500000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609673400000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609674300000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609675200000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609676100000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609677000000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609677900000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609678800000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609679700000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609680600000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609681500000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609682400000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609683300000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609684200000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609685100000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609686000000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609686900000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609687800000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609688700000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609689600000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609690500000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609691400000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609692300000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609693200000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609694100000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609695000000
                    },
                    {
                        'value': 3.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609695900000
                    },
                    {
                        'value': 3.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609696800000
                    },
                    {
                        'value': 3.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609697700000
                    },
                    {
                        'value': 3.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609698600000
                    },
                    {
                        'value': 3.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609699500000
                    },
                    {
                        'value': 3.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609700400000
                    },
                    {
                        'value': 3.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609701300000
                    },
                    {
                        'value': 3.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609702200000
                    },
                    {
                        'value': 3.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609703100000
                    },
                    {
                        'value': 3.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609704000000
                    },
                    {
                        'value': 3.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609704900000
                    },
                    {
                        'value': 3.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609705800000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609706700000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609707600000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609708500000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609709400000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609710300000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609711200000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609712100000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609713000000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609713900000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609714800000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609715700000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609716600000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609717500000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609718400000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609719300000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609720200000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609721100000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609722000000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609722900000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609723800000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609724700000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609725600000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609726500000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609727400000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609728300000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609729200000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609730100000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609731000000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609731900000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609732800000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609733700000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609734600000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609735500000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609736400000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609737300000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609738200000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609739100000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609740000000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609740900000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609741800000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609742700000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609743600000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609744500000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609745400000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609746300000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609747200000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609748100000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609749000000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609749900000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609750800000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609751700000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609752600000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609753500000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609754400000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609755300000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609756200000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609757100000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609758000000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609758900000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609759800000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609760700000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609761600000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609762500000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609763400000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609764300000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609765200000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609766100000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609767000000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609767900000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609768800000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609769700000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609770600000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609771500000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609772400000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609773300000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609774200000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609775100000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609776000000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609776900000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609777800000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609778700000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609779600000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609780500000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609781400000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609782300000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609783200000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609784100000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609785000000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609785900000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609786800000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609787700000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609788600000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609789500000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609790400000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609791300000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609792200000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609793100000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609794000000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609794900000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609795800000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609796700000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609797600000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609798500000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609799400000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609800300000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609801200000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609802100000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609803000000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609803900000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609804800000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609805700000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609806600000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609807500000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609808400000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609809300000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609810200000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609811100000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609812000000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609812900000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609813800000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609814700000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609815600000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609816500000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609817400000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609818300000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609819200000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609820100000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609821000000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609821900000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609822800000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609823700000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609824600000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609825500000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609826400000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609827300000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609828200000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609829100000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609830000000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609830900000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609831800000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609832700000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609833600000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609834500000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609835400000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609836300000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609837200000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609838100000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609839000000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609839900000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609840800000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609841700000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609842600000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609843500000
                    },
                    {
                        'value': 2.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609844400000
                    },
                    {
                        'value': 2.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609845300000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609846200000
                    },
                    {
                        'value': 2.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609847100000
                    },
                    {
                        'value': 2.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609848000000
                    },
                    {
                        'value': 2.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609848900000
                    },
                    {
                        'value': 2.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609849800000
                    },
                    {
                        'value': 2.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609850700000
                    },
                    {
                        'value': 2.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609851600000
                    },
                    {
                        'value': 2.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609852500000
                    },
                    {
                        'value': 2.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609853400000
                    },
                    {
                        'value': 2.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609854300000
                    },
                    {
                        'value': 2.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609855200000
                    },
                    {
                        'value': 2.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609856100000
                    },
                    {
                        'value': 2.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609857000000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609857900000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609858800000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609859700000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609860600000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609861500000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609862400000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609863300000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609864200000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609865100000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609866000000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609866900000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609867800000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609868700000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609869600000
                    },
                    {
                        'value': 3.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609870500000
                    },
                    {
                        'value': 3.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609871400000
                    },
                    {
                        'value': 3.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609872300000
                    },
                    {
                        'value': 3.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609873200000
                    },
                    {
                        'value': 3.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609874100000
                    },
                    {
                        'value': 3.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609875000000
                    },
                    {
                        'value': 3.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609875900000
                    },
                    {
                        'value': 3.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609876800000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609877700000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609878600000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609879500000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609880400000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609881300000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609882200000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609883100000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609884000000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609884900000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609885800000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609886700000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609887600000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609888500000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609889400000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609890300000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609891200000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609892100000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609893000000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609893900000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609894800000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609895700000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609896600000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609897500000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609898400000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609899300000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609900200000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609901100000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609902000000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609902900000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609903800000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609904700000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609905600000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609906500000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609907400000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609908300000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609909200000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609910100000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609911000000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609911900000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609912800000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609913700000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609914600000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609915500000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609916400000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609917300000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609918200000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609919100000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609920000000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609920900000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609921800000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609922700000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609923600000
                    },
                    {
                        'value': 2.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609924500000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609925400000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609926300000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609927200000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609928100000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609929000000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609929900000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609930800000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609931700000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609932600000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609933500000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609934400000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609935300000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609936200000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609937100000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609938000000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609938900000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609939800000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609940700000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609941600000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609942500000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609943400000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609944300000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609945200000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609946100000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609947000000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609947900000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609948800000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609949700000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609950600000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609951500000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609952400000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609953300000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609954200000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609955100000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609956000000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609956900000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609957800000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609958700000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609959600000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609960500000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609961400000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609962300000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609963200000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609964100000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609965000000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609965900000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609966800000
                    },
                    {
                        'value': 3.2,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609967700000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609968600000
                    },
                    {
                        'value': 3.1,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609969500000
                    },
                    {
                        'value': 3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609970400000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609971300000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609972200000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609973100000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609974000000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609974900000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609975800000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609976700000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609977600000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609978500000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609979400000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609980300000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609981200000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609982100000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609983000000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609983900000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609984800000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609985700000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609986600000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609987500000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609988400000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609989300000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609990200000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609991100000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609992000000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609992900000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609993800000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609994700000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609995600000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609996500000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609997400000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609998300000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609999200000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610000100000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610001000000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610001900000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610002800000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610003700000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610004600000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610005500000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610006400000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610007300000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610008200000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610009100000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610010000000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610010900000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610011800000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610012700000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610013600000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610014500000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610015400000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610016300000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610017200000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610018100000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610019000000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610019900000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610020800000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610021700000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610022600000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610023500000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610024400000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610025300000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610026200000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610027100000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610028000000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610028900000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610029800000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610030700000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610031600000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610032500000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610033400000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610034300000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610035200000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610036100000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610037000000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610037900000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610038800000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610039700000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610040600000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610041500000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610042400000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610043300000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610044200000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610045100000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610046000000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610046900000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610047800000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610048700000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610049600000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610050500000
                    },
                    {
                        'value': 2.9,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610051400000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610052300000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610053200000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610054100000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610055000000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610055900000
                    },
                    {
                        'value': 2.8,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610056800000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610057700000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610058600000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610059500000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610060400000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610061300000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610062200000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610063100000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610064000000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610064900000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610065800000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610066700000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610067600000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610068500000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610069400000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610070300000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610071200000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610072100000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610073000000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610073900000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610074800000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610075700000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610076600000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610077500000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610078400000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610079300000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610080200000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610081100000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610082000000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610082900000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610083800000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610084700000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610085600000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610086500000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610087400000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610088300000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610089200000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610090100000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610091000000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610091900000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610092800000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610093700000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610094600000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610095500000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610096400000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610097300000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610098200000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610099100000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610100000000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610100900000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610101800000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610102700000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610103600000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610104500000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610105400000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610106300000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610107200000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610108100000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610109000000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610109900000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610110800000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610111700000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610112600000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610113500000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610114400000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610115300000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610116200000
                    },
                    {
                        'value': 2.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610117100000
                    },
                    {
                        'value': 2.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610118000000
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
                'points': [
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609515000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609515900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609516800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609517700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609518600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609519500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609520400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609521300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609522200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609523100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609524000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609524900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609525800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609526700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609527600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609528500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609529400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609530300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609531200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609532100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609533000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609533900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609534800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609535700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609536600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609537500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609538400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609539300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609540200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609541100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609542000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609542900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609543800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609544700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609545600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609546500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609547400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609548300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609549200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609550100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609551000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609551900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609552800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609553700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609554600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609555500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609556400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609557300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609558200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609559100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609560000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609560900000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609561800000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609562700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609563600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609564500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609565400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609566300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609567200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609568100000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609569000000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609569900000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609570800000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609571700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609572600000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609573500000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609574400000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609575300000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609576200000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609577100000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609578000000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609578900000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609579800000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609580700000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609581600000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609582500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609583400000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609584300000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609585200000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609586100000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609587000000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609587900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609588800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609589700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609590600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609591500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609592400000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609593300000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609594200000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609595100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609596000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609596900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609597800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609598700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609599600000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609600500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609601400000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609602300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609603200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609604100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609605000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609605900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609606800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609607700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609608600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609609500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609610400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609611300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609612200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609613100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609614000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609614900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609615800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609616700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609617600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609618500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609619400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609620300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609621200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609622100000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609623000000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609623900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609624800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609625700000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609626600000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609627500000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609628400000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609629300000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609630200000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609631100000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609632000000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609632900000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609633800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609634700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609635600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609636500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609637400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609638300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609639200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609640100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609641000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609641900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609642800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609643700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609644600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609645500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609646400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609647300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609648200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609649100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609650000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609650900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609651800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609652700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609653600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609654500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609655400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609656300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609657200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609658100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609659000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609659900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609660800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609661700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609662600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609663500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609664400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609665300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609666200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609667100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609668000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609668900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609669800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609670700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609671600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609672500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609673400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609674300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609675200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609676100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609677000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609677900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609678800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609679700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609680600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609681500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609682400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609683300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609684200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609685100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609686000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609686900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609687800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609688700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609689600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609690500000
                    },
                    {
                        'value': 22.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609691400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609692300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609693200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609694100000
                    },
                    {
                        'value': 22.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609695000000
                    },
                    {
                        'value': 22.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609695900000
                    },
                    {
                        'value': 22.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609696800000
                    },
                    {
                        'value': 22.6,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609697700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609698600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609699500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609700400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609701300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609702200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609703100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609704000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609704900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609705800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609706700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609707600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609708500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609709400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609710300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609711200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609712100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609713000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609713900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609714800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609715700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609716600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609717500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609718400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609719300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609720200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609721100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609722000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609722900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609723800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609724700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609725600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609726500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609727400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609728300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609729200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609730100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609731000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609731900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609732800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609733700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609734600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609735500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609736400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609737300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609738200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609739100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609740000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609740900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609741800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609742700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609743600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609744500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609745400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609746300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609747200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609748100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609749000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609749900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609750800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609751700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609752600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609753500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609754400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609755300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609756200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609757100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609758000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609758900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609759800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609760700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609761600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609762500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609763400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609764300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609765200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609766100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609767000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609767900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609768800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609769700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609770600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609771500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609772400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609773300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609774200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609775100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609776000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609776900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609777800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609778700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609779600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609780500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609781400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609782300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609783200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609784100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609785000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609785900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609786800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609787700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609788600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609789500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609790400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609791300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609792200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609793100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609794000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609794900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609795800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609796700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609797600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609798500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609799400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609800300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609801200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609802100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609803000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609803900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609804800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609805700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609806600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609807500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609808400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609809300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609810200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609811100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609812000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609812900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609813800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609814700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609815600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609816500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609817400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609818300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609819200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609820100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609821000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609821900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609822800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609823700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609824600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609825500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609826400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609827300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609828200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609829100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609830000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609830900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609831800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609832700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609833600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609834500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609835400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609836300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609837200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609838100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609839000000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609839900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609840800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609841700000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609842600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609843500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609844400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609845300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609846200000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609847100000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609848000000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609848900000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609849800000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609850700000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609851600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609852500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609853400000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609854300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609855200000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609856100000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609857000000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609857900000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609858800000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609859700000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609860600000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609861500000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609862400000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609863300000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609864200000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609865100000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609866000000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609866900000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609867800000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609868700000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609869600000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609870500000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609871400000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609872300000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609873200000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609874100000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609875000000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609875900000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609876800000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609877700000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609878600000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609879500000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609880400000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609881300000
                    },
                    {
                        'value': 22.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609882200000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609883100000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609884000000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609884900000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609885800000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609886700000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609887600000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609888500000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609889400000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609890300000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609891200000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609892100000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609893000000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609893900000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609894800000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609895700000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609896600000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609897500000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609898400000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609899300000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609900200000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609901100000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609902000000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609902900000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609903800000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609904700000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609905600000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609906500000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609907400000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609908300000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609909200000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609910100000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609911000000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609911900000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609912800000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609913700000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609914600000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609915500000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609916400000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609917300000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609918200000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609919100000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609920000000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609920900000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609921800000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609922700000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609923600000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609924500000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609925400000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609926300000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609927200000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609928100000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609929000000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609929900000
                    },
                    {
                        'value': 22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609930800000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609931700000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609932600000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609933500000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609934400000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609935300000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609936200000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609937100000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609938000000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609938900000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609939800000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609940700000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609941600000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609942500000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609943400000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609944300000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609945200000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609946100000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609947000000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609947900000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609948800000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609949700000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609950600000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609951500000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609952400000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609953300000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609954200000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609955100000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609956000000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609956900000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609957800000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609958700000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609959600000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609960500000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609961400000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609962300000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609963200000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609964100000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609965000000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609965900000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609966800000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609967700000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609968600000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609969500000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609970400000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609971300000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609972200000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609973100000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609974000000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609974900000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609975800000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609976700000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609977600000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609978500000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609979400000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609980300000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609981200000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609982100000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609983000000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609983900000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609984800000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609985700000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609986600000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609987500000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609988400000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609989300000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609990200000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609991100000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609992000000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609992900000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609993800000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609994700000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609995600000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609996500000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609997400000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609998300000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609999200000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610000100000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610001000000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610001900000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610002800000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610003700000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610004600000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610005500000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610006400000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610007300000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610008200000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610009100000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610010000000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610010900000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610011800000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610012700000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610013600000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610014500000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610015400000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610016300000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610017200000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610018100000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610019000000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610019900000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610020800000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610021700000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610022600000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610023500000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610024400000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610025300000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610026200000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610027100000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610028000000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610028900000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610029800000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610030700000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610031600000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610032500000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610033400000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610034300000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610035200000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610036100000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610037000000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610037900000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610038800000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610039700000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610040600000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610041500000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610042400000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610043300000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610044200000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610045100000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610046000000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610046900000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610047800000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610048700000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610049600000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610050500000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610051400000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610052300000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610053200000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610054100000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610055000000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610055900000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610056800000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610057700000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610058600000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610059500000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610060400000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610061300000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610062200000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610063100000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610064000000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610064900000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610065800000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610066700000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610067600000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610068500000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610069400000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610070300000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610071200000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610072100000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610073000000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610073900000
                    },
                    {
                        'value': 21.7,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610074800000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610075700000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610076600000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610077500000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610078400000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610079300000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610080200000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610081100000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610082000000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610082900000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610083800000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610084700000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610085600000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610086500000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610087400000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610088300000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610089200000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610090100000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610091000000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610091900000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610092800000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610093700000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610094600000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610095500000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610096400000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610097300000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610098200000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610099100000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610100000000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610100900000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610101800000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610102700000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610103600000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610104500000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610105400000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610106300000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610107200000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610108100000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610109000000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610109900000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610110800000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610111700000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610112600000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610113500000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610114400000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610115300000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610116200000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610117100000
                    },
                    {
                        'value': 21.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610118000000
                    }
                ]
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
                'points': [
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609515000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609515900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609516800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609517700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609518600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609519500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609520400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609521300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609522200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609523100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609524000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609524900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609525800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609526700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609527600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609528500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609529400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609530300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609531200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609532100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609533000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609533900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609534800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609535700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609536600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609537500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609538400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609539300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609540200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609541100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609542000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609542900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609543800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609544700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609545600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609546500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609547400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609548300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609549200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609550100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609551000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609551900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609552800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609553700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609554600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609555500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609556400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609557300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609558200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609559100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609560000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609560900000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609561800000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609562700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609563600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609564500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609565400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609566300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609567200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609568100000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609569000000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609569900000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609570800000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609571700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609572600000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609573500000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609574400000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609575300000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609576200000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609577100000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609578000000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609578900000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609579800000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609580700000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609581600000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609582500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609583400000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609584300000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609585200000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609586100000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609587000000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609587900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609588800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609589700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609590600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609591500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609592400000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609593300000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609594200000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609595100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609596000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609596900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609597800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609598700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609599600000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609600500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609601400000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609602300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609603200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609604100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609605000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609605900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609606800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609607700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609608600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609609500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609610400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609611300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609612200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609613100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609614000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609614900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609615800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609616700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609617600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609618500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609619400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609620300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609621200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609622100000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609623000000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609623900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609624800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609625700000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609626600000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609627500000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609628400000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609629300000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609630200000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609631100000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609632000000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609632900000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609633800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609634700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609635600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609636500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609637400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609638300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609639200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609640100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609641000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609641900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609642800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609643700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609644600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609645500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609646400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609647300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609648200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609649100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609650000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609650900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609651800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609652700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609653600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609654500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609655400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609656300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609657200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609658100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609659000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609659900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609660800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609661700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609662600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609663500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609664400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609665300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609666200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609667100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609668000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609668900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609669800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609670700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609671600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609672500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609673400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609674300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609675200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609676100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609677000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609677900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609678800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609679700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609680600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609681500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609682400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609683300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609684200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609685100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609686000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609686900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609687800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609688700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609689600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609690500000
                    },
                    {
                        'value': 12.35,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609691400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609692300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609693200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609694100000
                    },
                    {
                        'value': 12.35,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609695000000
                    },
                    {
                        'value': 12.35,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609695900000
                    },
                    {
                        'value': 12.35,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609696800000
                    },
                    {
                        'value': 12.35,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609697700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609698600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609699500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609700400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609701300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609702200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609703100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609704000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609704900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609705800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609706700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609707600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609708500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609709400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609710300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609711200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609712100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609713000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609713900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609714800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609715700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609716600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609717500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609718400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609719300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609720200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609721100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609722000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609722900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609723800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609724700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609725600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609726500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609727400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609728300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609729200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609730100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609731000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609731900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609732800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609733700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609734600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609735500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609736400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609737300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609738200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609739100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609740000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609740900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609741800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609742700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609743600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609744500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609745400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609746300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609747200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609748100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609749000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609749900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609750800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609751700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609752600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609753500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609754400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609755300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609756200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609757100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609758000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609758900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609759800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609760700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609761600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609762500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609763400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609764300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609765200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609766100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609767000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609767900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609768800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609769700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609770600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609771500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609772400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609773300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609774200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609775100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609776000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609776900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609777800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609778700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609779600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609780500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609781400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609782300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609783200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609784100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609785000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609785900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609786800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609787700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609788600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609789500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609790400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609791300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609792200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609793100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609794000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609794900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609795800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609796700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609797600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609798500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609799400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609800300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609801200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609802100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609803000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609803900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609804800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609805700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609806600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609807500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609808400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609809300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609810200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609811100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609812000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609812900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609813800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609814700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609815600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609816500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609817400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609818300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609819200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609820100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609821000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609821900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609822800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609823700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609824600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609825500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609826400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609827300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609828200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609829100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609830000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609830900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609831800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609832700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609833600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609834500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609835400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609836300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609837200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609838100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609839000000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609839900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609840800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609841700000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609842600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609843500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609844400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609845300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609846200000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609847100000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609848000000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609848900000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609849800000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609850700000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609851600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609852500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609853400000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609854300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609855200000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609856100000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609857000000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609857900000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609858800000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609859700000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609860600000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609861500000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609862400000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609863300000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609864200000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609865100000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609866000000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609866900000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609867800000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609868700000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609869600000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609870500000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609871400000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609872300000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609873200000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609874100000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609875000000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609875900000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609876800000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609877700000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609878600000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609879500000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609880400000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609881300000
                    },
                    {
                        'value': 12.34,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609882200000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609883100000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609884000000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609884900000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609885800000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609886700000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609887600000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609888500000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609889400000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609890300000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609891200000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609892100000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609893000000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609893900000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609894800000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609895700000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609896600000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609897500000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609898400000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609899300000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609900200000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609901100000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609902000000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609902900000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609903800000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609904700000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609905600000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609906500000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609907400000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609908300000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609909200000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609910100000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609911000000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609911900000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609912800000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609913700000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609914600000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609915500000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609916400000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609917300000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609918200000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609919100000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609920000000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609920900000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609921800000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609922700000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609923600000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609924500000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609925400000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609926300000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609927200000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609928100000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609929000000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609929900000
                    },
                    {
                        'value': 12.33,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609930800000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609931700000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609932600000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609933500000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609934400000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609935300000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609936200000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609937100000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609938000000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609938900000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609939800000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609940700000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609941600000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609942500000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609943400000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609944300000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609945200000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609946100000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609947000000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609947900000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609948800000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609949700000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609950600000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609951500000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609952400000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609953300000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609954200000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609955100000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609956000000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609956900000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609957800000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609958700000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609959600000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609960500000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609961400000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609962300000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609963200000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609964100000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609965000000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609965900000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609966800000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609967700000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609968600000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609969500000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609970400000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609971300000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609972200000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609973100000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609974000000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609974900000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609975800000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609976700000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609977600000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609978500000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609979400000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609980300000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609981200000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609982100000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609983000000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609983900000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609984800000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609985700000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609986600000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609987500000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609988400000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609989300000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609990200000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609991100000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609992000000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609992900000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609993800000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609994700000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609995600000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609996500000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609997400000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609998300000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609999200000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610000100000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610001000000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610001900000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610002800000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610003700000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610004600000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610005500000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610006400000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610007300000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610008200000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610009100000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610010000000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610010900000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610011800000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610012700000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610013600000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610014500000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610015400000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610016300000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610017200000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610018100000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610019000000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610019900000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610020800000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610021700000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610022600000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610023500000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610024400000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610025300000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610026200000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610027100000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610028000000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610028900000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610029800000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610030700000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610031600000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610032500000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610033400000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610034300000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610035200000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610036100000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610037000000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610037900000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610038800000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610039700000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610040600000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610041500000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610042400000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610043300000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610044200000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610045100000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610046000000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610046900000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610047800000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610048700000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610049600000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610050500000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610051400000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610052300000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610053200000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610054100000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610055000000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610055900000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610056800000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610057700000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610058600000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610059500000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610060400000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610061300000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610062200000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610063100000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610064000000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610064900000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610065800000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610066700000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610067600000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610068500000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610069400000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610070300000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610071200000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610072100000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610073000000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610073900000
                    },
                    {
                        'value': 12.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610074800000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610075700000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610076600000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610077500000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610078400000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610079300000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610080200000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610081100000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610082000000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610082900000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610083800000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610084700000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610085600000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610086500000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610087400000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610088300000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610089200000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610090100000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610091000000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610091900000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610092800000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610093700000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610094600000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610095500000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610096400000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610097300000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610098200000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610099100000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610100000000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610100900000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610101800000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610102700000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610103600000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610104500000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610105400000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610106300000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610107200000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610108100000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610109000000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610109900000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610110800000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610111700000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610112600000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610113500000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610114400000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610115300000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610116200000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610117100000
                    },
                    {
                        'value': 12.31,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610118000000
                    }
                ]
            },
            '157775:current:P7D:00010F': {
                'qualifier': [
                    'P'
                ],
                'qualityControlLevel': [],
                'method': 157775,
                'source': [],
                'offset': [],
                'sample': [],
                'censorCode': [],
                'variable': '45807042_F',
                'tsKey': 'current:P7D',
                'points': [
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609515000000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609515900000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609516800000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609517700000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609518600000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609519500000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609520400000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609521300000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609522200000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609523100000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609524000000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609524900000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609525800000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609526700000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609527600000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609528500000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609529400000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609530300000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609531200000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609532100000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609533000000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609533900000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609534800000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609535700000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609536600000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609537500000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609538400000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609539300000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609540200000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609541100000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609542000000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609542900000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609543800000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609544700000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609545600000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609546500000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609547400000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609548300000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609549200000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609550100000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609551000000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609551900000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609552800000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609553700000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609554600000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609555500000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609556400000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609557300000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609558200000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609559100000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609560000000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609560900000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609561800000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609562700000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609563600000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609564500000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609565400000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609566300000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609567200000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609568100000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609569000000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609569900000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609570800000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609571700000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609572600000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609573500000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609574400000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609575300000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609576200000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609577100000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609578000000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609578900000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609579800000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609580700000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609581600000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609582500000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609583400000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609584300000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609585200000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609586100000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609587000000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609587900000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609588800000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609589700000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609590600000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609591500000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609592400000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609593300000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609594200000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609595100000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609596000000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609596900000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609597800000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609598700000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609599600000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609600500000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609601400000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609602300000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609603200000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609604100000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609605000000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609605900000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609606800000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609607700000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609608600000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609609500000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609610400000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609611300000
                    },
                    {
                        'value': 37.94,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609612200000
                    },
                    {
                        'value': 37.94,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609613100000
                    },
                    {
                        'value': 38.12,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609614000000
                    },
                    {
                        'value': 38.12,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609614900000
                    },
                    {
                        'value': 38.12,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609615800000
                    },
                    {
                        'value': 38.12,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609616700000
                    },
                    {
                        'value': 38.12,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609617600000
                    },
                    {
                        'value': 38.12,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609618500000
                    },
                    {
                        'value': 37.94,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609619400000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609620300000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609621200000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609622100000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609623000000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609623900000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609624800000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609625700000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609626600000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609627500000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609628400000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609629300000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609630200000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609631100000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609632000000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609632900000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609633800000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609634700000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609635600000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609636500000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609637400000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609638300000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609639200000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609640100000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609641000000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609641900000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609642800000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609643700000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609644600000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609645500000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609646400000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609647300000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609648200000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609649100000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609650000000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609650900000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609651800000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609652700000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609653600000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609654500000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609655400000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609656300000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609657200000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609658100000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609659000000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609659900000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609660800000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609661700000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609662600000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609663500000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609664400000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609665300000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609666200000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609667100000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609668000000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609668900000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609669800000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609670700000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609671600000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609672500000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609673400000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609674300000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609675200000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609676100000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609677000000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609677900000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609678800000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609679700000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609680600000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609681500000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609682400000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609683300000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609684200000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609685100000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609686000000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609686900000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609687800000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609688700000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609689600000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609690500000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609691400000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609692300000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609693200000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609694100000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609695000000
                    },
                    {
                        'value': 37.94,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609695900000
                    },
                    {
                        'value': 38.12,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609696800000
                    },
                    {
                        'value': 38.12,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609697700000
                    },
                    {
                        'value': 38.12,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609698600000
                    },
                    {
                        'value': 38.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609699500000
                    },
                    {
                        'value': 38.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609700400000
                    },
                    {
                        'value': 38.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609701300000
                    },
                    {
                        'value': 38.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609702200000
                    },
                    {
                        'value': 38.3,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609703100000
                    },
                    {
                        'value': 38.12,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609704000000
                    },
                    {
                        'value': 38.12,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609704900000
                    },
                    {
                        'value': 37.94,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609705800000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609706700000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609707600000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609708500000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609709400000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609710300000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609711200000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609712100000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609713000000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609713900000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609714800000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609715700000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609716600000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609717500000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609718400000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609719300000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609720200000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609721100000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609722000000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609722900000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609723800000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609724700000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609725600000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609726500000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609727400000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609728300000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609729200000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609730100000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609731000000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609731900000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609732800000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609733700000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609734600000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609735500000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609736400000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609737300000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609738200000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609739100000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609740000000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609740900000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609741800000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609742700000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609743600000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609744500000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609745400000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609746300000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609747200000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609748100000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609749000000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609749900000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609750800000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609751700000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609752600000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609753500000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609754400000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609755300000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609756200000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609757100000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609758000000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609758900000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609759800000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609760700000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609761600000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609762500000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609763400000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609764300000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609765200000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609766100000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609767000000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609767900000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609768800000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609769700000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609770600000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609771500000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609772400000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609773300000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609774200000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609775100000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609776000000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609776900000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609777800000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609778700000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609779600000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609780500000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609781400000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609782300000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609783200000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609784100000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609785000000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609785900000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609786800000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609787700000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609788600000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609789500000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609790400000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609791300000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609792200000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609793100000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609794000000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609794900000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609795800000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609796700000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609797600000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609798500000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609799400000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609800300000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609801200000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609802100000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609803000000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609803900000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609804800000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609805700000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609806600000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609807500000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609808400000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609809300000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609810200000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609811100000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609812000000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609812900000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609813800000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609814700000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609815600000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609816500000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609817400000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609818300000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609819200000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609820100000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609821000000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609821900000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609822800000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609823700000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609824600000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609825500000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609826400000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609827300000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609828200000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609829100000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609830000000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609830900000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609831800000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609832700000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609833600000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609834500000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609835400000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609836300000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609837200000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609838100000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609839000000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609839900000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609840800000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609841700000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609842600000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609843500000
                    },
                    {
                        'value': 36.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609844400000
                    },
                    {
                        'value': 36.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609845300000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609846200000
                    },
                    {
                        'value': 36.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609847100000
                    },
                    {
                        'value': 36.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609848000000
                    },
                    {
                        'value': 36.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609848900000
                    },
                    {
                        'value': 36.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609849800000
                    },
                    {
                        'value': 36.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609850700000
                    },
                    {
                        'value': 36.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609851600000
                    },
                    {
                        'value': 36.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609852500000
                    },
                    {
                        'value': 36.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609853400000
                    },
                    {
                        'value': 36.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609854300000
                    },
                    {
                        'value': 36.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609855200000
                    },
                    {
                        'value': 36.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609856100000
                    },
                    {
                        'value': 36.32,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609857000000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609857900000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609858800000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609859700000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609860600000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609861500000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609862400000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609863300000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609864200000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609865100000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609866000000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609866900000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609867800000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609868700000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609869600000
                    },
                    {
                        'value': 37.94,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609870500000
                    },
                    {
                        'value': 37.94,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609871400000
                    },
                    {
                        'value': 38.12,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609872300000
                    },
                    {
                        'value': 38.12,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609873200000
                    },
                    {
                        'value': 38.12,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609874100000
                    },
                    {
                        'value': 38.12,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609875000000
                    },
                    {
                        'value': 38.12,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609875900000
                    },
                    {
                        'value': 37.94,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609876800000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609877700000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609878600000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609879500000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609880400000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609881300000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609882200000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609883100000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609884000000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609884900000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609885800000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609886700000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609887600000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609888500000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609889400000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609890300000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609891200000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609892100000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609893000000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609893900000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609894800000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609895700000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609896600000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609897500000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609898400000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609899300000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609900200000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609901100000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609902000000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609902900000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609903800000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609904700000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609905600000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609906500000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609907400000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609908300000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609909200000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609910100000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609911000000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609911900000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609912800000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609913700000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609914600000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609915500000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609916400000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609917300000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609918200000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609919100000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609920000000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609920900000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609921800000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609922700000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609923600000
                    },
                    {
                        'value': 36.5,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609924500000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609925400000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609926300000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609927200000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609928100000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609929000000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609929900000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609930800000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609931700000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609932600000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609933500000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609934400000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609935300000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609936200000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609937100000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609938000000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609938900000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609939800000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609940700000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609941600000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609942500000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609943400000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609944300000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609945200000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609946100000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609947000000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609947900000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609948800000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609949700000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609950600000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609951500000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609952400000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609953300000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609954200000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609955100000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609956000000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609956900000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609957800000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609958700000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609959600000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609960500000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609961400000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609962300000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609963200000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609964100000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609965000000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609965900000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609966800000
                    },
                    {
                        'value': 37.76,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609967700000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609968600000
                    },
                    {
                        'value': 37.58,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609969500000
                    },
                    {
                        'value': 37.4,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609970400000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609971300000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609972200000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609973100000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609974000000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609974900000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609975800000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609976700000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609977600000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609978500000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609979400000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609980300000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609981200000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609982100000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609983000000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609983900000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609984800000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609985700000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609986600000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609987500000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609988400000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609989300000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609990200000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609991100000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609992000000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609992900000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609993800000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609994700000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609995600000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609996500000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609997400000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609998300000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1609999200000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610000100000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610001000000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610001900000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610002800000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610003700000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610004600000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610005500000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610006400000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610007300000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610008200000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610009100000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610010000000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610010900000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610011800000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610012700000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610013600000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610014500000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610015400000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610016300000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610017200000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610018100000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610019000000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610019900000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610020800000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610021700000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610022600000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610023500000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610024400000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610025300000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610026200000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610027100000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610028000000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610028900000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610029800000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610030700000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610031600000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610032500000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610033400000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610034300000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610035200000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610036100000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610037000000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610037900000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610038800000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610039700000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610040600000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610041500000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610042400000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610043300000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610044200000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610045100000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610046000000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610046900000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610047800000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610048700000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610049600000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610050500000
                    },
                    {
                        'value': 37.22,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610051400000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610052300000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610053200000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610054100000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610055000000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610055900000
                    },
                    {
                        'value': 37.04,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610056800000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610057700000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610058600000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610059500000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610060400000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610061300000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610062200000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610063100000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610064000000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610064900000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610065800000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610066700000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610067600000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610068500000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610069400000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610070300000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610071200000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610072100000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610073000000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610073900000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610074800000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610075700000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610076600000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610077500000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610078400000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610079300000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610080200000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610081100000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610082000000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610082900000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610083800000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610084700000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610085600000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610086500000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610087400000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610088300000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610089200000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610090100000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610091000000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610091900000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610092800000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610093700000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610094600000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610095500000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610096400000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610097300000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610098200000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610099100000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610100000000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610100900000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610101800000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610102700000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610103600000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610104500000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610105400000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610106300000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610107200000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610108100000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610109000000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610109900000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610110800000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610111700000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610112600000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610113500000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610114400000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610115300000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610116200000
                    },
                    {
                        'value': 36.68,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610117100000
                    },
                    {
                        'value': 36.86,
                        'qualifiers': [
                            'P'
                        ],
                        'dateTime': 1610118000000
                    }
                ]
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
