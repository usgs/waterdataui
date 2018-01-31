const { unicodeHtmlEntity, getHtmlFromString} = require('./utils');

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

});