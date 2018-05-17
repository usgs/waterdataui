const { extent } = require('d3-array');
const { DateTime } = require('luxon');

const { createXScale, createYScale, yScaleSelector } = require('./scales');


describe('scales', () => {
    const timeZone = 'America/Los_Angeles';
    const points = Array(23).fill(0).map((_, hour) => {
        return {
            dateTime: DateTime.fromObject({
                year: 2017,
                month: 10,
                day: 10,
                hour: hour,
                zone: timeZone
            }).valueOf(),
            value: hour
        };
    });
    const yDomain = extent(points.map(p => p.value));
    const xDomain = {
        start: points[0].dateTime,
        end: points[points.length - 1].dateTime
    };
    const xScale = createXScale(xDomain, 200);
    const yScale = createYScale('00060', yDomain, 100);
    const yScaleLinear = createYScale('ABCDE', yDomain, 100);

    it('scales created', () => {
        expect(xScale).toEqual(jasmine.any(Function));
        expect(yScale).toEqual(jasmine.any(Function));
    });

    it('xScale domain is correct', () => {
        let domain = xScale.domain();
        expect(domain[0]).toEqual(xDomain.start);
        expect(domain[1]).toEqual(xDomain.end);
    });

    it('xScale range is correctly left-oriented', () => {
        let range = xScale.range();
        expect(range[0]).toEqual(0);
        expect(range[1]).toEqual(200);
    });

    it('yScale range is correctly right-oriented', () => {
        let range = yScale.range();
        expect(range[0]).toEqual(100);
        expect(range[1]).toEqual(0);
    });

    it('WDFN-66: yScale deals with range [0,1] correctly', () => {
        expect(yScale(1)).not.toBeNaN();
        expect(yScale(.5)).not.toBeNaN();
        expect(yScale(.999)).not.toBeNaN();
        expect(yScale(0)).not.toBeNaN();
    });

    it('Expect parameter code for discharge (00060) to use a symlog scale', () => {
        const log10 = yScale(10);
        const log100 = yScale(100);
        const log1000 = yScale(1000);

        const singleLog10 = yScale(10);
        const singleLog100 = yScale(100);
        const singleLog1000 = yScale(1000);

        expect(log10 - log100).toBeCloseTo(log100 - log1000);
        expect(singleLog10 - singleLog100).toBeCloseTo(singleLog100 - singleLog1000);
    });

    it('Expect parameter code for not discharge to use a linear scale', () => {
        const linear10 = yScaleLinear(10);
        const linear20 = yScaleLinear(20);
        const linear30 = yScaleLinear(30);

        const singleLinear10 = yScaleLinear(10);
        const singleLinear20 = yScaleLinear(20);
        const singleLinear30 = yScaleLinear(30);

        expect(linear10 - linear20).toBeCloseTo(linear20 - linear30);
        expect(singleLinear10 - singleLinear20).toBeCloseTo(singleLinear20 - singleLinear30);
    });

    describe('yScaleSelector', () => {

        it('Creates a scale when there is no initial data', () => {
            expect(yScaleSelector({
                series: {},
                statisticsData: {},
                timeSeriesState: {
                    showSeries: {
                        current: true,
                        compare: false,
                        median: false
                    },
                    currentVariableID: null
                },
                ui: {
                    width: 200,
                    windowWidth: 600
                }
            }).name).toBe('scale');
        });

        it('Creates a scale when there is initial data', () => {
            expect(yScaleSelector({
                series: {
                    variables: {
                       '00060ID': {
                           variableCode: {
                               value: '00060'
                           }
                       }
                    },
                    timeSeries: {
                        '00060ID': {}
                    }
                },
                statisticsData: {},
                timeSeriesState: {
                    showSeries: {
                        current: true,
                        compare: false
                    },
                    currentVariableID: '00060ID'
                },
                ui: {
                    width: 200,
                    windowWidth: 600
                }
            }).name).toBe('scale');
        });
    });
});
