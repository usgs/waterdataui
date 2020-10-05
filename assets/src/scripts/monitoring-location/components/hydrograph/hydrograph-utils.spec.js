import {isPeriodCustom, parsePeriodCode} from './hydrograph-utils';


describe('isCustomPeriod', () => {
    it('will return correct boolean value', () => {
        expect(isPeriodCustom('P7D')).toEqual(false);
        expect(isPeriodCustom('P30D')).toEqual(false);
        expect(isPeriodCustom('P1Y')).toEqual(false);
        expect(isPeriodCustom('P32D')).toEqual(true);
    });
});

describe('parsePeriodCode', () => {
    it('will break down the period code into input selection button and the number of days the user entered', () => {
        expect(parsePeriodCode('P32D'))
            .toEqual({currentUserInputCustomTimeRangeSelectionButton: 'custom', userInputNumberOfDays: '32'});
        expect(parsePeriodCode('P1Y'))
            .toEqual({currentUserInputCustomTimeRangeSelectionButton: 'P1Y', userInputNumberOfDays: ''});
        expect(parsePeriodCode(null))
            .toEqual({'currentUserInputCustomTimeRangeSelectionButton' : 'P7D', 'userInputNumberOfDays': ''});
    });
});