const { createXScale, createYScale, singleSeriesYScale, yScaleSelector } = require('./scales');


describe('Charting scales', () => {
    let points = Array(23).fill(0).map((_, hour) => {
        return {
            dateTime: new Date(2017, 10, 10, hour, 0, 0, 0),
            value: hour
        };
    });
    let xScale = createXScale(points, 200);
    let yScale = createYScale('00060', [points], 100);
    let yScaleLinear = createYScale('ABCDE', [points], 100);
    let singleYScale = singleSeriesYScale('00060', points, 100);
    let singleYScaleLinear = singleSeriesYScale('ABCDE', points, 100);

    it('scales created', () => {
        expect(xScale).toEqual(jasmine.any(Function));
        expect(yScale).toEqual(jasmine.any(Function));
        expect(singleYScale).toEqual(jasmine.any(Function));
    });

    it('xScale domain is correct', () => {
        let domain = xScale.domain();
        expect(domain[0]).toEqual(points[0].dateTime);
        expect(domain[1]).toEqual(points[22].dateTime);
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

    it('singleYscale range is correctly right-oriented', () => {
        let range = singleYScale.range();
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

        const singleLog10 = singleYScale(10);
        const singleLog100 = singleYScale(100);
        const singleLog1000 = singleYScale(1000);

        expect(log10 - log100).toBeCloseTo(log100 - log1000);
        expect(singleLog10 - singleLog100).toBeCloseTo(singleLog100 - singleLog1000);
    });

    it('Expect parameter code for not discharge to use a linear scale', () => {
        const linear10 = yScaleLinear(10);
        const linear20 = yScaleLinear(20);
        const linear30 = yScaleLinear(30);

        const singleLinear10 = singleYScaleLinear(10);
        const singleLinear20 = singleYScaleLinear(20);
        const singleLinear30 = singleYScaleLinear(30);

        expect(linear10 - linear20).toBeCloseTo(linear20 - linear30);
        expect(singleLinear10 - singleLinear20).toBeCloseTo(singleLinear20 - singleLinear30);
    });

    describe('yScaleSelector', () => {

        it('Creates a scale when there is no initial data', () => {
            expect(yScaleSelector({
                series: {},
                showSeries: false,
                currentVariableID: null,
                width: 200,
                windowWidth: 600
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
                showSeries: false,
                currentVariableID: '00060ID',
                width: 200,
                windowWidth: 600
            }).name).toBe('scale');
        });
    });
});
