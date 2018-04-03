const { extendDomain } = require('./domain');


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
});
