const { select } = require('d3-selection');
const { availableTimeseriesSelector, addSparkLine } = require('./parameters');


describe('Parameters module', () => {

    describe('availableTimeseriesSelector', () => {

        it('returns ordered parameters', () => {
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

        it('sets attributes correctly', () => {
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

    describe('addSparkline', () => {
        let svg;
        const tsDataSingle = {
            parmData: [
                {time: new Date(2015, 1, 2), value: 16},
                {time: new Date(2015, 1, 3), value: 17}
            ],
            lines: [
                {
                    classes: {approved: false, estimated: false, dataMask: null},
                    points: [
                        {time: new Date(2015, 1, 2), value: 16},
                        {time: new Date(2015, 1, 3), value: 17}
                    ]
                }
            ]
        };
        const tsDataMasked = {
            parmData: [
                {time: new Date(2015, 1, 2), value: null},
                {time: new Date(2015, 1, 3), value: null}
            ],
            lines: [
                {
                    classes: {approved: false, estimated: false, dataMask: 'ice'},
                    points: [
                        {time: new Date(2015, 1, 2), value: null},
                        {time: new Date(2015, 1, 3), value: null}
                    ]
                }
            ]
        };
        const tsDataMixed = {
            parmData: [
                {time: new Date(2015, 1, 13), value: 84},
                {time: new Date(2015, 1, 14), value: 91},
                {time: new Date(2015, 1, 15), value: null},
                {time: new Date(2015, 1, 16), value: null},
                {time: new Date(2015, 1, 17), value: 77},
                {time: new Date(2015, 1, 18), value: 85}
            ],
            lines: [
                {
                    classes: {approved: false, estimated: false, dataMask: null},
                    points: [
                        {time: new Date(2015, 1, 13), value: 84},
                        {time: new Date(2015, 1, 14), value: 91}
                    ]
                },
                {
                    classes: {approved: false, estimated: false, dataMask: 'ice'},
                    points: [
                        {time: new Date(2015, 1, 15), value: null},
                        {time: new Date(2015, 1, 16), value: null}
                    ]
                },
                {
                    classes: {approved: false, estimated: false, dataMask: null},
                    points: [
                        {time: new Date(2015, 1, 17), value: 77},
                        {time: new Date(2015, 1, 18), value: 85}
                    ]
                }
            ]
        };

        beforeEach(() => {
            svg = select('body').append('svg');
        });

        it('adds a path for a line', () => {
            addSparkLine(svg, {tsData: tsDataSingle});
            expect(svg.selectAll('path').size()).toEqual(1);
        });

        it('does not add a path for masked data', () => {
            addSparkLine(svg, {tsData: tsDataMasked});
            expect(svg.selectAll('path').size()).toEqual(0);
        });

        it('adds multiple paths if there are breaks in the data', () => {
            addSparkLine(svg, {tsData: tsDataMixed});
            expect(svg.selectAll('path').size()).toEqual(2);
        });
    });
});
