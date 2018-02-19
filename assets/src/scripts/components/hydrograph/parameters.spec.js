const { availableTimeseriesSelector } = require('./parameters');


describe('Parameters module', () => {
    it('availableTimeseriesSelector returns ordered parameters', () => {
        const available = availableTimeseriesSelector({
            tsData: {
                current: {
                    '00060': {},
                    '00061': {},
                    '00062': {}
                }
            },
            currentParameterCode: '00060'
        });
        expect(available.length).toBe(3);
        expect(available[0][0]).toEqual('00060');
        expect(available[1][0]).toEqual('00061');
        expect(available[2][0]).toEqual('00062');
    });

    it('availableTimeseriesSelector sets attributes correctly', () => {
        const available = availableTimeseriesSelector({
            tsData: {
                current: {
                    '00060': {description: '00060', type: '00060type'},
                    '00061': {description: '00061', type: '00061type'},
                    '00062': {description: '00062', type: '00062type'}
                },
                compare: {
                    '00061': {description: '00061', type: '00061type'},
                    '00062': {description: '00062', type: '00062type'},
                    '00063': {description: '00063', type: '00063type'}
                }
            },
            currentParameterCode: '00060'
        });
        expect(available).toEqual([
            ['00060', {description: '00060', type: '00060type', selected: true, currentYear: true, previousYear: false, medianData: false}],
            ['00061', {description: '00061', type: '00061type', selected: false, currentYear: true, previousYear: true, medianData: false}],
            ['00062', {description: '00062', type: '00062type', selected: false, currentYear: true, previousYear: true, medianData: false}],
            ['00063', {description: '00063', type: '00063type', selected: false, currentYear: false, previousYear: true, medianData: false}]
        ]);
    });
});
