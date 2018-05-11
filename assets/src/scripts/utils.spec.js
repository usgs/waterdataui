const { select } = require('d3-selection');

const { unicodeHtmlEntity, getHtmlFromString, deltaDays, replaceHtmlEntities,
    setEquality, wrap, mediaQuery, calcStartTime, callIf } = require('./utils');


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

    describe('replaceHtmlEntities', () => {

        it('replaces html entities with unicode', () => {
            expect(replaceHtmlEntities('kg * m&#178;/s&#179;')).toEqual('kg * m\u00B2/s\u00B3');
        }) ;
    });

    describe('setEquality', () => {

        const testSet1 = new Set(['a', 'b', 'c']);
        const testSet2 = new Set(['a', 'b', 'c']);
        const testSet3 = new Set(['a', 'b']);
        const testSet4 = new Set(['x', 'y', 'z']);

        it('returns true if sets are equal', () => {
            expect(setEquality(testSet1, testSet2)).toBe(true);
        });

        it('returns false if set lengths are unequal', () => {
            expect(setEquality(testSet1, testSet3)).toBe(false);
        });

        it('returns false if set items are unequal', () => {
            expect(setEquality(testSet1, testSet4)).toBe(false);
        });

    });

    describe('wrap() fits long text', () => {
        const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
        let elem;
        let maxWordWidth;

        beforeEach(() => {
            elem = select('body').append('svg').append('text');

            // Get the width of the single largest word.
            maxWordWidth = Math.max.apply(null, lorem.split(/\s+/).map(word => {
                elem.text(word);
                return elem.node().getComputedTextLength();
            }));

            // Set the text to a long string.
            elem.text(lorem);
        });

        afterEach(() => {
            select('svg').remove();
        });

        function testWidth(width) {
            elem.call(wrap, width);
            elem.selectAll('tspan').each(function () {
                expect(this.getComputedTextLength()).toBeLessThanOrEqual(width);
            });
        }

        it('in width of maxWordWidth', () => {
            testWidth(maxWordWidth);
        });

        it('in width of maxWordWidth * 2', () => {
            testWidth(maxWordWidth * 2);
        });

        it('in width of maxWordWidth * 10', () => {
            testWidth(maxWordWidth * 10);
        });

        it('and words are in correct order', () => {
            elem.call(wrap, maxWordWidth * 2);

            let tspans = [];
            elem.selectAll('tspan').each(function () {
                tspans.push(this.textContent);
            });

            expect(tspans.join(' ')).toEqual(lorem);
        });
    });

    describe('mediaQuery', () => {
        it('returns a boolean', () => {
            expect(typeof mediaQuery(-100)).toEqual('boolean');
            expect(typeof mediaQuery(0)).toEqual('boolean');
            expect(typeof mediaQuery(100)).toEqual('boolean');
            expect(typeof mediaQuery(200)).toEqual('boolean');
        }) ;
    });

    describe('calcStartTime', () => {

        const someDate = 1490562900000;
        const timeZone = 'America/Chicago';

        it('correctly handles a seven day interval', () => {
            expect(calcStartTime('P7D', someDate, timeZone)).toEqual(1489958100000);
        });

        it('correctly handles a 30 day interval', () => {
            expect(calcStartTime('P30D', someDate, timeZone)).toEqual(1487974500000);
        });

        it('correctly handles a year interval', () => {
            expect(calcStartTime('P1Y', someDate, timeZone)).toEqual(1459026900000);
        });
    });

    describe('callIf', () => {
        let spy;

        beforeEach(() => {
            spy = jasmine.createSpy('callIf');
        });

        it('calls on true', () => {
            callIf(true, spy)();
            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledWith();
        });

        it('calls on true with arguments', () => {
            callIf(true, spy)(1, 2, 3);
            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledWith(1, 2, 3);
        });

        it('no-ops on false', () => {
            callIf(false, spy)();
            expect(spy).not.toHaveBeenCalled();
        });
    });
});
