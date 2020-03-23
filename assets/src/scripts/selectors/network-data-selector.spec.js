import {
    getNetworkSites,
    hasNetworkData
} from './network-data-selector';

describe('network-data-selector', () => {

    describe('getNldiUpstreamFlows', () => {
        it('if upstream flows is empty, empty array is returned', () => {
            expect(getNetworkSites({
                networkData: {
                    networkSites: []
                }
            })).toEqual([]);
        });

        it('if upstream flows has data, the data is returned', () => {
            expect(getNetworkSites({
                networkData: {
                    networkSites: [1,2,3]
                }
            })).toEqual([1,2,3]);
        });
    });


    describe('hasNetworkData', () => {
        it('if all nldi data is empty, return false', () => {
            expect(hasNetworkData({
                networkData: {
                    networkSites: []
                }
            })).toEqual(false);
        });

        it('if even one nldi data has data, return true', () => {
            expect(hasNetworkData({
                 networkData: {
                    networkSites: [1]
                }
            })).toEqual(true);
        });
    });

});