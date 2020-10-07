import {isPeriodWithinAcceptableRange, isPeriodCustom, parsePeriodCode} from './hydrograph-utils';

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