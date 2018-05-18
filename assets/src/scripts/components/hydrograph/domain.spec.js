import { extendDomain, getYDomain, getYTickDetails } from './domain';


describe('domain module', () => {
    describe('extendDomain', () => {
        it('lower bounds on nearest power of 10 with symlog parameter, upper bound 20%', () => {
            expect(extendDomain([50, 1000], true)).toEqual([10, 1000 + (1000 - 50) * .2]);
            expect(extendDomain([175, 1000], true)).toEqual([100, 1000 + (1000 - 175) * .2]);
            expect(extendDomain([9000, 10000], true)).toEqual([1000, 10000 + (10000 - 9000) * .2]);
        });

        it('20% padding on linear scales, zero lower bound', () => {
            let domain = [50, 1000];
            let padding = (domain[1] - domain[0]) * .2;
            expect(extendDomain(domain, false)).toEqual([0, domain[1] + padding]);

            domain = [175, 1000];
            padding = (domain[1] - domain[0]) * .2;
            expect(extendDomain(domain, false)).toEqual([domain[0] - padding, domain[1] + padding]);

            domain = [9000, 10000];
            padding = (domain[1] - domain[0]) * .2;
            expect(extendDomain(domain, false)).toEqual([domain[0] - padding, domain[1] + padding]);
        });

        it('20% padding on linear scales with negative lower bound', () => {
            let domain = [-50, 1000];
            let padding = (domain[1] - domain[0]) * .2;
            expect(extendDomain(domain, false)).toEqual([domain[0] - padding, domain[1] + padding]);

            domain = [-175, 1000];
            padding = (domain[1] - domain[0]) * .2;
            expect(extendDomain(domain, false)).toEqual([domain[0] - padding, domain[1] + padding]);

            domain = [-9000, 10000];
            padding = (domain[1] - domain[0]) * .2;
            expect(extendDomain(domain, false)).toEqual([domain[0] - padding, domain[1] + padding]);
        });
    });

    describe('getYDomain', () => {
        function pts(arr) {
            return arr.map(val => {
                return {
                    value: val
                };
            });
        }

        it('is inclusive to all points with symlog', () => {
            const domain = getYDomain(
                [pts([1, 2, 3]), pts([5, 6, 7]), pts([-10, 2])],
                {variableCode: {value: '00060'}}
            );
            expect(domain[0]).toBeLessThanOrEqual(-10);
            expect(domain[1]).toBeGreaterThanOrEqual(7);
        });

        it('is inclusive to all points with linear', () => {
            const domain = getYDomain(
                [pts([1, 2, 3]), pts([5, 6, 7]), pts([-10, 2])],
                {variableCode: {value: '00065'}}
            );
            expect(domain[0]).toBeLessThanOrEqual(-10);
            expect(domain[1]).toBeGreaterThanOrEqual(7);
        });

        it('ignores non-finite values', () => {
            const domain = getYDomain(
                [pts([-Infinity, NaN, 1, 2, 3, Infinity])],
                {variableCode: {value: '00065'}}
            );
            const padding = (3 - 1) * .2;
            expect(domain).toEqual([1 - padding, 3 + padding]);
        });

        it('handles single point values', () => {
            const domain = getYDomain(
                [pts([100])]
            );
            expect(domain[0]).toBeLessThanOrEqual(50);
            expect(domain[1]).toBeGreaterThanOrEqual(150);
        });
    });

    describe('getYTickDetails', () => {
        it('returns ticks and a formatting function', () => {
            const tickDetails = getYTickDetails([0, 1]);
            expect(tickDetails.tickValues).toEqual(jasmine.any(Array));
            expect(tickDetails.tickFormat).toEqual(jasmine.any(Function));
            expect(tickDetails.tickFormat(1)).toEqual(jasmine.any(String));
        });
    });
});
