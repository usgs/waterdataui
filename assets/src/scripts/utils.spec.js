const { unicodeHtmlEntity, getHtmlFromString, deltaDays} = require('./utils');

describe('Utils module', () => {

    describe('unicodeHtmlEntity', () => {

        it('Can determine the unicode of a decimal entity', () => {
           expect(unicodeHtmlEntity('&#179;')).toBe('\u00B3');
        });

        it('Returns empty string when it is given garbage', () => {
           expect(unicodeHtmlEntity('ABCD')).toBe('');
        });
    });

    describe('getHtmlFromString', () => {

        it('Returns null if an HTML entity is not found', () => {
           expect(getHtmlFromString('I have a cat')).toBeNull();
        });

        it('Returns information if an HTML entity is found', () => {
           let result = getHtmlFromString('kg * m&#178;/s&#179;');
           expect(result).toContain('&#178;');
           expect(result).toContain('&#179;');
           expect(result.length).toBe(2);
        });
    });

    describe('deltaDays', () => {

        const date1 = new Date(2017, 2, 26, 16, 15, 0);
        const date2 = new Date(2017, 3, 2, 4, 30, 0);
        const date3 = new Date(2017, 3, 2, 21, 15, 0);
        const date4 = new Date(2017, 2, 30, 16, 15, 0);

        it('Returns the correct number of days when it is a bit less than an integer number of days', () => {
           let result = deltaDays(date1, date2);
           expect(result).toBe(7);
        });

        it('Returns the correct number of days when it is a bit more than an integer number of days', () => {
           let result = deltaDays(date1, date3);
           expect(result).toBe(7);
        });

        it('Returns the correct number of days when it is an exact integer number days', () => {
           let result = deltaDays(date1, date4);
           expect(result).toBe(4);
        });
    });
});
