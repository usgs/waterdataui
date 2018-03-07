const { createXScale, createYScale, singleSeriesYScale } = require('./scales');


describe('Charting scales', () => {
    let points = Array(23).fill(0).map((_, hour) => {
        return {
            dateTime: new Date(2017, 10, 10, hour, 0, 0, 0),
            value: hour
        };
    });
    let xScale = createXScale(points, 200);
    let yScale = createYScale([points], 100);
    let singleYScale = singleSeriesYScale(points, 100);

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
});
