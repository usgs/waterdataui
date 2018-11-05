import {
    extendDomain,
    getYDomain,
    getYTickDetails,
    getArrayOfAdditionalTickMarks,
    getLowestAbsoluteValueOfTickValues,
    getRoundedTickValues,
    removeTickValuesBelowXaxis, generateNegativeTicks
} from './domain';


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

    describe('getArrayOfAdditionalTickMarks', () => {
        it('return the complete array of tick values to compensate for gaps in log scale display', () => {
            const yDomain = [-75, 15000];
            const tickValues1 = [-1000, -100, -50, 50, 100, 1000];
            const tickValues2 = [100, 200, 500, 1000];
            const expectedReturnedArray1 = [-25,-15,-10,-5,25,15,10,5,-1000,-100,-50,50,100,1000];
            const expectedReturnedArray2 = [50,25,15,10,5,100,200,500,1000];
            // expect(getArrayOfAdditionalTickMarks(tickValues1, yDomain)).toEqual(expectedReturnedArray1);
            expect(getArrayOfAdditionalTickMarks(tickValues2, yDomain)).toEqual(expectedReturnedArray2);
        });
    });

    describe('getLowestAbsoluteValueOfTickValues', () => {
        it('returns the lowest number, or lowest absolute value of negative numbers found in the array', () => {
            const testTickValues1 = [-2123, -200, -50, 50, 200, 2123];
            const testTickValues2 = [200, 2000, 4000, 8000];
            expect(getLowestAbsoluteValueOfTickValues(testTickValues1)).toEqual(50);
            expect(getLowestAbsoluteValueOfTickValues(testTickValues2)).toEqual(200);
        });
    });

    describe('getRoundedTickValues', () => {
        it('returns a set of numbers rounded to the multiple of a desired  number', () => {
            const testTickValues_1 = [3, 35, 210, 490, 780];
            const testTickValues_2 = [54, 201, 2120, 99345, 234222];
            const expectedReturnedArray_1 = [5,35,300,500,800];
            const expectedReturnedArray_2 = [55,300,3000,100000,235000];
            expect(getRoundedTickValues(testTickValues_1)).toEqual(expectedReturnedArray_1);
            expect(getRoundedTickValues(testTickValues_2)).toEqual(expectedReturnedArray_2);
        });
    });

    describe('removeTickValuesBelowXaxis', () => {
        it('returns a set of numbers with values less than the lowest extent of the y-axis removed', () => {
            const yDomain_0 = [-75, 15000];
            const yDomain_1 = [75, 15000];
            const yDomain_2 = [3000, 15000];
            const testTickValues = [5, 20, 2000, 5000];
            const expectedReturnedArray_0 = [5, 20, 2000, 5000];
            const expectedReturnedArray_1 = [2000, 5000];
            const expectedReturnedArray_2 = [5000];
            expect(removeTickValuesBelowXaxis(testTickValues, yDomain_0)).toEqual(expectedReturnedArray_0);
            expect(removeTickValuesBelowXaxis(testTickValues, yDomain_1)).toEqual(expectedReturnedArray_1);
            expect(removeTickValuesBelowXaxis(testTickValues, yDomain_2)).toEqual(expectedReturnedArray_2);
        });
    });

    describe('generateNegativeTicks', () => {
        it('returns a set of numbers with additional negative values when needed', () => {
            const testTickValues_1 = [100, 500, 1000, 2000];
            const testTickValues_2 = [-500, 100, 500, 1000, 2000];
            const additionalTickValues = [15, 25, 50];
            const expectedReturnedArrayNoNegatives = [15, 25, 50];
            const expectedReturnedArrayWithNegatives = [-15, -25, -50, 15, 25, 50];
            expect(generateNegativeTicks(testTickValues_1, additionalTickValues)).toEqual(expectedReturnedArrayNoNegatives);
            expect(generateNegativeTicks(testTickValues_2, additionalTickValues)).toEqual(expectedReturnedArrayWithNegatives);
        });
    });
});
