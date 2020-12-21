import {
    getNldiUpstreamSites,
    getNldiUpstreamFlows,
    getNldiDownstreamSites,
    getNldiDownstreamFlows,
    getNldiUpstreamBasin,
    hasNldiData
} from './nldi-data-selector';

describe('monitoring-location/selectors/nldi-data-selector', () => {

    describe('getNldiUpstreamFlows', () => {
        it('if upstream flows is empty, empty array is returned', () => {
            expect(getNldiUpstreamFlows({
                nldiData: {
                    upstreamFlows: []
                }
            })).toEqual([]);
        });

        it('if upstream flows has data, the data is returned', () => {
            expect(getNldiUpstreamFlows({
                nldiData: {
                    upstreamFlows: [1,2,3]
                }
            })).toEqual([1,2,3]);
        });
    });

    describe('getNldiDownstreamFlows', () => {
        it('if downstream flows is empty, empty array is returned', () => {
            expect(getNldiDownstreamFlows({
                nldiData: {
                    downstreamFlows: []
                }
            })).toEqual([]);
        });

        it('if downstream flows has data, the data is returned', () => {
            expect(getNldiDownstreamFlows({
                nldiData: {
                    downstreamFlows: [1,2,3]
                }
            })).toEqual([1,2,3]);
        });
    });

    describe('getNldiUpstreamSites', () => {
        it('if upstream sites is empty, empty array is returned', () => {
            expect(getNldiUpstreamSites({
                nldiData: {
                    upstreamSites: []
                }
            })).toEqual([]);
        });

        it('if upstream sites has data, the data is returned', () => {
            expect(getNldiUpstreamSites({
                nldiData: {
                    upstreamSites: [1,2,3]
                }
            })).toEqual([1,2,3]);
        });
    });

    describe('getNldiDownstreamSites', () => {
        it('if downstream sites is empty, empty array is returned', () => {
            expect(getNldiDownstreamSites({
                nldiData: {
                    downstreamSites: []
                }
            })).toEqual([]);
        });

        it('if downstream sites has data, the data is returned', () => {
            expect(getNldiDownstreamSites({
                nldiData: {
                    downstreamSites: [1,2,3]
                }
            })).toEqual([1,2,3]);
        });
    });

    describe('getNldiUpstreamBasin', () => {
        it('if upstream basins is empty, empty array is returned', () => {
            expect(getNldiUpstreamBasin({
                nldiData: {
                    upstreamBasin: []
                }
            })).toEqual([]);
        });

        it('if upstream basins has data, the data is returned', () => {
            expect(getNldiUpstreamBasin({
                nldiData: {
                    upstreamBasin: [1,2,3]
                }
            })).toEqual([1,2,3]);
        });
    });

    describe('hasNldiData', () => {
        it('if all nldi data is empty, return false', () => {
            expect(hasNldiData({
                nldiData: {
                    upstreamFlows: [],
                    downstreamFlows: [],
                    upstreamSites: [],
                    downstreamSites: [],
                    upstreamBasin: []
                }
            })).toEqual(false);
        });

        it('if even one nldi data has data, return true', () => {
            expect(hasNldiData({
                nldiData: {
                    upstreamFlows: [1],
                    downstreamFlows: [],
                    upstreamSites: [],
                    downstreamSites: [],
                    upstreamBasin: []
                }
            })).toEqual(true);
        });
    });

});