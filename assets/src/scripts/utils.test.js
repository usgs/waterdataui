import {select} from 'd3-selection';
import {
    unicodeHtmlEntity, getHtmlFromString, replaceHtmlEntities, setEquality,
    wrap, mediaQuery, calcStartTime, callIf, parseRDB, convertFahrenheitToCelsius,
    convertCelsiusToFahrenheit, sortedParameters, getNearestTime} from './utils';


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
           expect(result).toHaveLength(2);
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

    // Tests for wrap and matchMedia both require a real DOM rather than jsDOM so those functions are not tested.
    // For places where those functions are used in the tests, they have been mocked.

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
            spy = jest.fn();
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

    describe('parseRDB', () => {
        /* eslint no-use-before-define: 0 */
        it('parseRDB successfully parses RDB content', () => {
           let result = parseRDB(MOCK_RDB);
           expect(result).toHaveLength(13);
           expect(Object.keys(result[0])).toEqual(['agency_cd', 'site_no', 'parameter_cd', 'ts_id', 'loc_web_ds', 'month_nu',
               'day_nu', 'begin_yr', 'end_yr', 'count_nu', 'p50_va']);
        });

        it('parseRDB handles no data', () => {
           let result = parseRDB(MOCK_RDB_NO_DATA);
           expect(result).toHaveLength(0);
        });

        it('parseRDB handles no headers', () => {
           let result = parseRDB('#Some Stuff');
           expect(result).toHaveLength(0);
        });
    });

    describe('convertFahrenheitToCelsius', () => {
        it('converts from degrees F to degrees C correctly', () => {
            expect(convertFahrenheitToCelsius(212)).toEqual(100);
            expect(convertFahrenheitToCelsius(32)).toEqual(0);
            expect(convertFahrenheitToCelsius(-40)).toEqual(-40);
        });
    });

    describe('convertCelsiusToFahrenheit', () => {
        it('converts from degrees C to degrees F correctly', () => {
            expect(convertCelsiusToFahrenheit(100)).toEqual(212);
            expect(convertCelsiusToFahrenheit(0)).toEqual(32);
            expect(convertCelsiusToFahrenheit(-40)).toEqual(-40);
        });
    });

    describe('sortedParameters', () => {

        const testVars = {
            20214: {
                oid: '20214',
                variableCode: {'value': '00065', variableID: 20214},
                variableDescription: 'Gage Height, meters',
                variableName: 'Gage Height, m'
            },
            1701: {
                oid: '1701',
                variableCode: {value: '91102', variableID: 1701},
                variableDescription: 'Mass, cobalt(II) chloride, kilogram',
                variableName: 'Mass, cobalt(II) chloride, kg'
            },
            501: {
                oid: '501',
                variableCode: {value: '20018', variableID: 501},
                variableDescription: 'Volume, bromine, liter',
                variableName: 'Volume, bromine, L'
            },
            17778: {
                oid: '17778',
                variableCode: {value: '72019', variableID: 17778},
                variableDescription: 'Depth to water level, meters below land surface',
                variableName: 'Depth to water level, m'
            },
            42: {
                oid: '42',
                variableCode: {value: '83452', variableID: 42},
                variableDescription: 'Cross-sectional area, millibarn',
                variableName: 'Cross-sectional area, mb'
            },
            88450: {
                oid: '88450',
                variableCode: {value: '00060', variableID: 88450},
                variableDescription: 'Discharge, cubic meters per second',
                variableName: 'Discharge, m3/s'
            }
        };

        it('sorts a group of parameters', () => {
            expect(sortedParameters(testVars).map(x => x.oid)).toEqual(['20214', '88450', '17778', '42', '1701', '501']);
        });

        it('handles the case where variables are empty', () => {
            expect(sortedParameters({})).toHaveLength(0);
        });

        it('handles the case where variables are undefined', () => {
            expect(sortedParameters(undefined)).toHaveLength(0);
        });
    });

    describe('getNearestTime', () => {
        let testData = [12, 13, 14, 15, 16].map(hour => {
            return {
                dateTime: new Date(`2018-01-03T${hour}:00:00.000Z`).getTime(),
                qualifiers: ['P'],
                value: hour
            };
        });
        testData = testData.concat([
            {
                dateTime: 1514998800000,
                qualifiers: ['Fld', 'P'],
                value: null
            },
            {
                dateTime: 1515002400000,
                qualifiers: ['Mnt', 'P'],
                value: null
            }

        ]);
        it('Return null if the DATA array is empty', function() {
            expect(getNearestTime([], testData[0].dateTime)).toBeNull();
        });

        it('return correct DATA points via getNearestTime' , () => {
            // Check each date with the given offset against the hourly-spaced
            // test DATA.

            function expectOffset(offset, side) {
                testData.forEach((datum, index, thisArray) => {
                    let expected;
                    if (side === 'left' || index === thisArray.length - 1) {
                        expected = {datum, index};
                    } else {
                        expected = {datum: thisArray[index + 1], index: index + 1};
                    }
                    let time = new Date(datum.dateTime + offset);
                    let returned = getNearestTime(thisArray, time);

                    expect(returned.dateTime).toBe(expected.datum.dateTime);
                });
            }

            let hour = 3600000;  // 1 hour in milliseconds

            // Check each date against an offset from itself.
            expectOffset(0, 'left');
            expectOffset(1, 'left');
            expectOffset(hour / 2 - 1, 'left');
            expectOffset(hour / 2, 'left');
            expectOffset(hour / 2 + 1, 'right');
            expectOffset(hour - 1, 'right');
        });
    });
});

const MOCK_RDB = `#
#
# US Geological Survey, Water Resources Data
# retrieved: 2018-01-25 16:05:49 -05:00	(natwebsdas01)
#
# This file contains USGS Daily Statistics
#
# Note:The statistics generated are based on approved daily-mean data and may not match those published by the USGS in official publications.
# The user is responsible for assessment and use of statistics from this site.
# For more details on why the statistics may not match, visit http://help.waterdata.usgs.gov/faq/about-statistics.
#
# Data heading explanations.
# agency_cd       -- agency code
# site_no         -- Site identification number
# parameter_cd    -- Parameter code
# station_nm      -- Site name
# loc_web_ds      -- Additional measurement description
#
# Data for the following 1 site(s) are contained in this file
# agency_cd   site_no      parameter_cd   station_nm (loc_web_ds)
# USGS        05370000     00060          EAU GALLE RIVER AT SPRING VALLEY, WI
#
# Explanation of Parameter Codes
# parameter_cd	Parameter Name
# 00060         Discharge, cubic feet per second
#
# Data heading explanations.
# month_nu    ... The month for which the statistics apply.
# day_nu      ... The day for which the statistics apply.
# begin_yr    ... First water year of data of daily mean values for this day.
# end_yr      ... Last water year of data of daily mean values for this day.
# count_nu    ... Number of values used in the calculation.
# p50_va      ... 50 percentile (median) of daily mean values for this day.
#
agency_cd	site_no	parameter_cd	ts_id	loc_web_ds	month_nu	day_nu	begin_yr	end_yr	count_nu	p50_va
5s	15s	5s	10n	15s	3n	3n	6n	6n	8n	12s
USGS	05370000	00060	153885		1	1	1969	2017	49	16
USGS	05370000	00060	153885		1	2	1969	2017	49	16
USGS	05370000	00060	153885		1	3	1969	2017	49	16
USGS	05370000	00060	153885		1	4	1969	2017	49	15
USGS	05370000	00060	153885		1	5	1969	2017	49	15
USGS	05370000	00060	153885		1	6	1969	2017	49	15
USGS	05370000	00060	153885		1	7	1969	2017	49	15
USGS	05370000	00060	153885		1	8	1969	2017	49	15
USGS	05370000	00060	153885		1	9	1969	2017	49	15
USGS	05370000	00060	153885		1	10	1969	2017	49	15
USGS	05370000	00060	153885		1	11	1969	2017	49	15
USGS	05370000	00060	153885		1	12	1969	2017	49	15
USGS	05370000	00060	153885		1	13	1969	2017	49	15
`;

const MOCK_RDB_NO_DATA = `#
#
# US Geological Survey, Water Resources Data
# retrieved: 2018-01-25 16:05:49 -05:00	(natwebsdas01)
#
# This file contains USGS Daily Statistics
#
# Note:The statistics generated are based on approved daily-mean data and may not match those published by the USGS in official publications.
# The user is responsible for assessment and use of statistics from this site.
# For more details on why the statistics may not match, visit http://help.waterdata.usgs.gov/faq/about-statistics.
#
# Data heading explanations.
# agency_cd       -- agency code
# site_no         -- Site identification number
# parameter_cd    -- Parameter code
# station_nm      -- Site name
# loc_web_ds      -- Additional measurement description
#
# Data for the following 1 site(s) are contained in this file
# agency_cd   site_no      parameter_cd   station_nm (loc_web_ds)
# USGS        05370000     00060          EAU GALLE RIVER AT SPRING VALLEY, WI
#
# Explanation of Parameter Codes
# parameter_cd	Parameter Name
# 00060         Discharge, cubic feet per second
#
# Data heading explanations.
# month_nu    ... The month for which the statistics apply.
# day_nu      ... The day for which the statistics apply.
# begin_yr    ... First water year of data of daily mean values for this day.
# end_yr      ... Last water year of data of daily mean values for this day.
# count_nu    ... Number of values used in the calculation.
# p50_va      ... 50 percentile (median) of daily mean values for this day.
#
agency_cd	site_no	parameter_cd	ts_id	loc_web_ds	month_nu	day_nu	begin_yr	end_yr	count_nu	p50_va
`;
