import {
    TEST_PRIMARY_IV_DATA,
    TEST_GW_LEVELS,
    TEST_MEDIAN_DATA,
    TEST_CURRENT_TIME_RANGE
} from '../mock-hydrograph-state';
import {
    extendDomain,
    getYTickDetails,
    getFullArrayOfAdditionalTickMarks,
    getLowestAbsoluteValueOfTickValues,
    getRoundedTickValues,
    generateNegativeTicks,
    getPrimaryValueRange
} from './domain';


describe('monitoring-location/components/hydrograph/selectors/domain module', () => {
    describe('extendDomain', () => {
        it('lower bounds are calculated based on order of magnitude with the parameter, upper bound 20%', () => {
            const lowValDomain = extendDomain([50, 1000], true);
            expect(lowValDomain[0]).toBeCloseTo(39.82, 2);
            expect(lowValDomain[1]).toEqual(1000 + (1000 - 50) * .2);

            const medValDomain = extendDomain([175, 1000], true);
            expect(medValDomain[0]).toBeCloseTo(146.61, 2);
            expect(medValDomain[1]).toEqual(1000 + (1000 - 175) * .2);

            const highValDomain = extendDomain([9000, 10000], true);
            expect(highValDomain[0]).toBeCloseTo(8109.35, 2);
            expect(highValDomain[1]).toEqual(10000 + (10000 - 9000) * .2);

            const decimalValDomain = extendDomain([0.2, 10], true);
            expect(decimalValDomain[0]).toBeCloseTo(0.12, 2);
            expect(decimalValDomain[1]).toEqual(10 + (10 - 0.2) * .2);
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

    describe('getYTickDetails', () => {
        it('Returns the default tick details if no parameter is defined', () => {
            const tickDetails = getYTickDetails.resultFunc([0, 1], null);
            expect(tickDetails.tickValues).toEqual(expect.any(Array));
            expect(tickDetails.tickFormat).toEqual(expect.any(Function));
            expect(tickDetails.tickFormat(1)).toEqual(expect.any(String));
        });

        it('returns ticks and a formatting function', () => {
            const tickDetails = getYTickDetails.resultFunc([0, 1], {parameterCode: '00065'});
            expect(tickDetails.tickValues).toEqual(expect.any(Array));
            expect(tickDetails.tickFormat).toEqual(expect.any(Function));
            expect(tickDetails.tickFormat(1)).toEqual(expect.any(String));
        });
    });

    describe('getFullArrayOfAdditionalTickMarks', () => {
        it('return the complete array of tick values to compensate for gaps in log scale display', () => {
            const yDomain = [-75, 15000];
            const tickValues1 = [-1000, -100, -50, 50, 100, 1000];
            const tickValues2 = [100, 200, 500, 1000];
            const expectedReturnedArray1 = [-30,-15,-10,-4,-2,30,15,10,4,2,-1000,-100,-50,50,100,1000];
            const expectedReturnedArray2 = [50,30,15,10,4,2,100,200,500,1000];
            expect(getFullArrayOfAdditionalTickMarks(tickValues1, yDomain)).toEqual(expectedReturnedArray1);
            expect(getFullArrayOfAdditionalTickMarks(tickValues2, yDomain)).toEqual(expectedReturnedArray2);
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
            const yDomain_0 = [-75, 15000];
            const yDomain_1 = [75, 15000];
            const yDomain_2 = [3000, 15000];
            const testTickValues_1 = [3, 35, 210, 490, 780];
            const testTickValues_2 = [54, 201, 2120, 99345, 234222];
            const expectedReturnedArray_1_1 = [3,40,300,500,800];
            const expectedReturnedArray_1_2 = [300,500,800];
            const expectedReturnedArray_1_3 = [];
            const expectedReturnedArray_2_1 = [60,300,3000,100000,240000];
            const expectedReturnedArray_2_2 = [300,3000,100000,240000];
            const expectedReturnedArray_2_3 = [100000,240000];
            expect(getRoundedTickValues(testTickValues_1, yDomain_0)).toEqual(expectedReturnedArray_1_1);
            expect(getRoundedTickValues(testTickValues_1, yDomain_1)).toEqual(expectedReturnedArray_1_2);
            expect(getRoundedTickValues(testTickValues_1, yDomain_2)).toEqual(expectedReturnedArray_1_3);
            expect(getRoundedTickValues(testTickValues_2, yDomain_0)).toEqual(expectedReturnedArray_2_1);
            expect(getRoundedTickValues(testTickValues_2, yDomain_1)).toEqual(expectedReturnedArray_2_2);
            expect(getRoundedTickValues(testTickValues_2, yDomain_2)).toEqual(expectedReturnedArray_2_3);
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

    describe('getPrimaryValueRange', () => {
        it('if no hydrograph data then return a range of [0, 1]', () => {
            expect(getPrimaryValueRange({
                hydrographData: {},
                hydrographState: {
                    showCompareIVData: true,
                    showMedianData: true
                }
            })).toEqual([0, 1]);
        });

        it('Show range if hydrograph data exists', () => {
            const result = getPrimaryValueRange({
                hydrographData: {
                    currentTimeRange: TEST_CURRENT_TIME_RANGE,
                    primaryIVData: TEST_PRIMARY_IV_DATA,
                    groundwaterLevels: TEST_GW_LEVELS,
                    medianStatisticsData: TEST_MEDIAN_DATA
                },
                hydrographState: {
                    showCompareIVData: true,
                    showMedianData: true
                }
            });
            expect(result[0]).toBeLessThan(15.9);
            expect(result[1]).toBeGreaterThan(27.2);
        });
    });
});
