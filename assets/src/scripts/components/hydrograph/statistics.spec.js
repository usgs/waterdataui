const range = require('lodash/range');
const { coerceStatisticalSeries } = require('./statistics');
const { DateTime } = require('luxon');


describe('Statistics module', () => {

    describe('coerceStatisticalSeries', () => {
        // generate a year's worth of fake median data
        const MONTHS = range(0, 12);
        const DAYS = range(1, 32);
        const YEAR = 2016;
        let time = [];
        MONTHS.forEach(month => {
            DAYS.forEach(day => {
                let someDay = new Date(YEAR, month, day).getTime();
                if (!time.includes(someDay)) {
                    time.push(someDay);
                }
            });
        });

        const dates = time.map(t => new Date(t));
        const points = dates.map(dt => {
            const month = dt.getMonth() + 1;
            const day = dt.getDate();
            return {
                dateTime: null,
                month: month,
                day: day,
                value: month + day*2
            };
        });
        const series1 = {
            points: points,
            endTime: 1425362400000
        };

        const series2 = {
            points: points,
            endTime: 1456984800000
        };

        const series3 = {
            points: points,
            endTime: 1520385960000
        };

        const timeZone = 'America/Chicago';

        it('handles coercion to a single year of data without a leap day', () => {
            const result = coerceStatisticalSeries(series1, 'P7D', timeZone);
            const dates = result.map(x => DateTime.fromMillis(x.dateTime, {zone: timeZone}));
            expect(result.length).toEqual(8);
            dates.forEach(x => {
                expect(x.year).toEqual(2015);
            });
            expect(dates.map(x => x.day).includes(29)).toBe(false);
        });

        it('handles coercion to a single year of data with a leap day', () => {
            const result = coerceStatisticalSeries(series2, 'P7D', timeZone);
            const dates = result.map(x => DateTime.fromMillis(x.dateTime, {zone: timeZone}));
            expect(result.length).toEqual(8);
            dates.forEach(x => {
                expect(x.year).toEqual(2016);
            });
            expect(dates.map(x => x.day).includes(29)).toBe(true);
        });

        it('handles a 30 day period', () => {
            let result = coerceStatisticalSeries(series1, 'P30D', timeZone);
            expect(result.length).toEqual(31);
        });

        it('handles a non-leap year period', () => {
            const result = coerceStatisticalSeries(series1, 'P1Y', timeZone);
            const dates = result.map(x => DateTime.fromMillis(x.dateTime, {zone: timeZone}));
            const years = dates.map(x => x.year);
            expect(result.length).toEqual(365);
            expect(years.includes(2015)).toBe(true);
            expect(years.includes(2014)).toBe(true);
        });

        it('handles a leap year period', () => {
            const result = coerceStatisticalSeries(series2, 'P1Y', timeZone);
            const dates = result.map(x => DateTime.fromMillis(x.dateTime, {zone: timeZone}));
            const years = dates.map(x => x.year);
            expect(result.length).toEqual(367);
            expect(years.includes(2016)).toBe(true);
            expect(years.includes(2015)).toBe(true);
        });

        it('handles times in the middle of the day', () => {
            const result =  coerceStatisticalSeries(series3, 'P7D');
            expect(result.length).toEqual(9);
            expect(result[0].dateTime).toEqual(1519781160000);
            expect(result[1].dateTime).toEqual(1519797600000);
            expect(result[result.length - 2].dateTime).toEqual(1520316000000);
            expect(result[result.length - 1].dateTime).toEqual(1520385960000);
        });
    });
});
