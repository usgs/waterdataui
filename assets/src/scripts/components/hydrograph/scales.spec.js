const { createScales } = require('./scales');


describe('Charting scales', () => {
    let data = Array(23).fill(0).map((_, hour) => {
        return {
            time: new Date(2017, 10, 10, hour, 0, 0, 0),
            label: 'label',
            value: hour
        };
    });
    let stats = [{
        'label': '18 ft3/s',
        'time': '2017-01-03T00:00:00.000Z',
        'value': 18
    }];
    let tsData = {current: {data: data}};
    let {xScale, yScale} = createScales(tsData, 200, 100);

    it('scales created', () => {
        let {xScale, yScale} = createScales(tsData, 200, 100);
        expect(xScale).toEqual(jasmine.any(Function));
        expect(yScale).toEqual(jasmine.any(Function));
    });

    it('xScale domain is correct', () => {
        let domain = xScale.domain();
        expect(domain[0]).toEqual(data[0].time);
        expect(domain[1]).toEqual(data[22].time);
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
    });
});
