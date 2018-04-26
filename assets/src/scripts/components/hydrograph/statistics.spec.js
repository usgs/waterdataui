const { coerceStatisticalSeries } = require('./statistics');


describe('Statistics module', () => {

    describe('coerceStatisticalSeries', () => {
        const points = [
            {
                dateTime: null,
                month: 0,
                day: 1,
                value: 16
            },
            {
                dateTime: null,
                month: 0,
                day: 17,
                value: 85
            },
            {
                dateTime: null,
                month: 0,
                day: 18,
                value: 86
            },
            {
                dateTime: null,
                month: 1,
                day: 28,
                value: 85
            },
            {
                dateTime: null,
                month: 1,
                day: 29,
                value: 41
            },
            {
                dateTime: null,
                month: 2,
                day: 5,
                value: 91
            },
            {
                dateTime: null,
                month: 2,
                day: 6,
                value: 94
            },
            {
                dateTime: null,
                month: 11,
                day: 31,
                value: 42
            }
        ];
        const series1 = {
            points: points,
            startTime: new Date(2015, 0, 18),
            endTime: new Date(2015, 2, 6)
        };

        const series2 = {
            points: points,
            startTime: new Date(2014, 0, 1),
            endTime: new Date(2018, 5, 2)
        };

        const series3 = {
            points: points,
            startTime: new Date(2014, 0, 17, 14, 5),
            endTime: new Date(2018, 2, 6, 19, 26)
        };

        const series4 = {
            points: points,
            startTime: new Date(2014, 11, 31, 19, 32),
            endTime: new Date(2015, 0, 10, 18, 20)
        };

        it('handles coercion to a single year of data', () => {
            let result = coerceStatisticalSeries(series1);
            expect(result.length).toEqual(4);
            expect(result[0]).toEqual({
                dateTime: new Date(2015, 0, 18),
                month: 0,
                day: 18,
                value: 86
            });
            expect(result[3]).toEqual({
                dateTime: new Date(2015, 2, 6),
                month: 2,
                day: 6,
                value: 94
            });
        });

        it('handles coercion of multi-year data', () => {
            let result = coerceStatisticalSeries(series2);
            let dateArr = result.map(x => x.dateTime);
            expect(dateArr).toContain(new Date(2016, 1, 29));
            expect(dateArr).not.toContain(new Date(2014, 1, 29));
            expect(dateArr).not.toContain(new Date(2015, 1, 29));
            expect(dateArr).not.toContain(new Date(2017, 1, 29));
            expect(dateArr).not.toContain(new Date(2018, 1, 29));
        });

        it('handles both left and right plot terminus', () => {
            let result =  coerceStatisticalSeries(series3);
            const first = result[0];
            const last = result[result.length - 1];
            expect(first.dateTime).toEqual(new Date(2014, 0, 17, 14, 5));
            expect(first.value).toEqual(85);
            expect(last.dateTime).toEqual(new Date(2018, 2, 6, 19, 26));
            expect(last.value).toEqual(94);
        });

        it('handles times around new year well', () => {
            let result = coerceStatisticalSeries(series4);
            expect(result.length).toEqual(3);
            expect(result[0].value).toEqual(42);
        });
    });
});
