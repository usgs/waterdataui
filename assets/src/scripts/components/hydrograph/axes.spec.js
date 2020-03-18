import {DateTime} from 'luxon';

import {generateDateTicks } from './axes';


describe('Chart axes', () => {

    const timeZone = 'America/Chicago';

    fdescribe('generateDateTicks', () => {
        const startTime = 1551471524000;
        it('Generates day length tick marks with format MMM dd when length is 7 days', () => {
            const endTime = DateTime.fromMillis(startTime).plus({days: 7}).toMillis();
            const result = generateDateTicks(startTime, endTime, timeZone);

            expect(result.dates.length).toBe(7);
            expect(result.dates.map(result.format)).toEqual(
                ['Mar 02', 'Mar 03', 'Mar 04', 'Mar 05', 'Mar 06', 'Mar 07', 'Mar 08']
            );
        });
        it('Generates day length tick marks with format MMM dd when length is 4 days', () => {
            const endTime = DateTime.fromMillis(startTime).plus({days: 3}).toMillis();
            const result = generateDateTicks(startTime, endTime, timeZone);

            expect(result.dates.length).toBe(3);
            expect(result.dates.map(result.format)).toEqual(
                ['Mar 02', 'Mar 03', 'Mar 04']
            );
        });

        it('Generates every other day tick marks with format MMM dd when length is 8 days', () => {
            const endTime = DateTime.fromMillis(startTime).plus({days: 8}).toMillis();
            const result = generateDateTicks(startTime, endTime, timeZone);

            expect(result.dates.length).toBe(4);
            expect(result.dates.map(result.format)).toEqual(
                ['Mar 02', 'Mar 04', 'Mar 06', 'Mar 08']
            );
        });

        it('Generates every other day tick marks with format MM dd when length is 14', () => {
            const endTime = DateTime.fromMillis(startTime).plus({days: 14}).toMillis();
            const result = generateDateTicks(startTime, endTime, timeZone);

            expect(result.dates.length).toBe(7);
            expect(result.dates.map(result.format)).toEqual(
                ['Mar 02', 'Mar 04', 'Mar 06', 'Mar 08', 'Mar 10', 'Mar 12', 'Mar 14']
            );
        });

        it('Generates every fourth day tick marks with format MM dd when length is 15', () => {
            const endTime = DateTime.fromMillis(startTime).plus({days: 15}).toMillis();
            const result = generateDateTicks(startTime, endTime, timeZone);

            expect(result.dates.length).toBe(4);
            expect(result.dates.map(result.format)).toEqual(
                ['Mar 02', 'Mar 06', 'Mar 10', 'Mar 14']
            );
        });

        it('Generates every fourth day tick marks with format MM dd when length is 28', () => {
            const endTime = DateTime.fromMillis(startTime).plus({days: 28}).toMillis();
            const result = generateDateTicks(startTime, endTime, timeZone);

            expect(result.dates.length).toBe(7);
            expect(result.dates.map(result.format)).toEqual(
                ['Mar 02', 'Mar 06', 'Mar 10', 'Mar 14', 'Mar 18', 'Mar 22', 'Mar 26']
            );
        });

        it('Generates every week tick marks with format MM dd when day count is 29', () => {
            const endTime = DateTime.fromMillis(startTime).plus({days: 29}).toMillis();
            const result = generateDateTicks(startTime, endTime, timeZone);

            expect(result.dates.length).toBe(4);
            expect(result.dates.map(result.format)).toEqual(
                ['Mar 04', 'Mar 11', 'Mar 18', 'Mar 25']
            );
        });

        it('Generates every week tick marks with format MM dd when week count is 8', () => {
            const endTime = DateTime.fromMillis(startTime).plus({days: 50}).toMillis();
            const result = generateDateTicks(startTime, endTime, timeZone);

            expect(result.dates.length).toBe(7);
            expect(result.dates.map(result.format)).toEqual(
                ['Mar 04', 'Mar 11', 'Mar 18', 'Mar 25', 'Apr 01', 'Apr 08', 'Apr 15']
            );
        });

        it('Generates every week tick marks with format MM dd when day count is 29', () => {
            const endTime = DateTime.fromMillis(startTime).plus({days: 51}).toMillis();
            const result = generateDateTicks(startTime, endTime, timeZone);

            expect(result.dates.length).toBe(4);
            expect(result.dates.map(result.format)).toEqual(
                ['Mar 08', 'Mar 22', 'Apr 04', 'Apr 18']
            );
        });
/*
        const endDate = 1504215240000;
        const startP7D = 1503610440000;
        const startP30D = 1501623240000;
        const startP1Y = 1472679240000;
        const startCustomUnderOneDecade = 1274590800000;
        const startCustomOverTwoDecades = 651906000000;

        it('creates tick marks for a 7 day period', () => {
            const result = generateDateTicks(startP7D, endDate, 'P7D', timeZone);
            expect(result).toEqual([
                1503644400000,
                1503730800000,
                1503817200000,
                1503903600000,
                1503990000000,
                1504076400000,
                1504162800000
            ]);
        });

        it('uses weekly ticks for 7 or fewer days for a custom date range', () => {
            const result = generateDateTicks(startP7D, endDate, 'custom', timeZone);
            expect(result).toEqual([
                1503644400000,
                1503730800000,
                1503817200000,
                1503903600000,
                1503990000000,
                1504076400000,
                1504162800000
            ]);
        });

        it('creates tick marks for a 30 day period', () => {
            const result = generateDateTicks(startP30D, endDate, 'P30D', timeZone);
            expect(result).toEqual([
                1502002800000,
                1502607600000,
                1503212400000,
                1503817200000
            ]);
        });

        it('uses weekly ticks for a different of days 7 between 30 for a custom date range', () => {
            const result = generateDateTicks(startP30D, endDate, 'custom', timeZone);
            expect(result).toEqual([
                1502002800000,
                1502607600000,
                1503212400000,
                1503817200000
            ]);
        });

        it('creates tick marks for a 1 year period', () => {
            const result = generateDateTicks(startP1Y, endDate, 'P1Y', timeZone);
            expect(result.length).toBeGreaterThanOrEqual(6);
            expect(result.includes(1475305200000)).toBe(true);
            expect(result.includes(1480579200000)).toBe(true);
            expect(result.includes(1496300400000)).toBe(true);
            expect(result.includes(1501570800000)).toBe(true);
        });

        it('custom uses monthly marks for 30 days through a year', () => {
            const result = generateDateTicks(startP1Y, endDate, 'custom', timeZone);
            expect(result.length).toBeGreaterThanOrEqual(6);
            expect(result.includes(1475305200000)).toBe(true);
            expect(result.includes(1480579200000)).toBe(true);
            expect(result.includes(1496300400000)).toBe(true);
            expect(result.includes(1501570800000)).toBe(true);
        });

        it('custom ticks are correctly generated for dates under one decade', () => {
            const result = generateDateTicks(startCustomUnderOneDecade, endDate, 'custom', timeZone);
            expect(result).toEqual([
                1293868800000,
                1314860400000,
                1335855600000,
                1357027200000,
                1378018800000,
                1398927600000,
                1420099200000,
                1441090800000,
                1462086000000,
                1483257600000
            ]);
        });

        it('custom ticks use correctly for dates over two decades', () => {
            const result = generateDateTicks(startCustomOverTwoDecades, endDate, 'custom', timeZone);
            expect(result).toEqual([
                723196800000,
                796723200000,
                870418800000,
                944035200000,
                1017648000000,
                1091343600000,
                1164960000000,
                1238569200000,
                1312182000000,
                1385884800000,
                1459494000000
            ]);
        });
        */
    });
});
