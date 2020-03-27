import {
    getNetworkSites,
    hasNetworkData
} from './network-data-selector';

describe('network-data-selector', () => {

    describe('getNetworkSites', () => {
        it('if network is empty, empty array is returned', () => {
            expect(getNetworkSites({
                networkData: {
                    networkSites: []
                }
            })).toEqual([]);
        });

        it('if network sites, the data is returned', () => {
            expect(getNetworkSites({
                networkData: {
                    networkSites: [1,2,3]
                }
            })).toEqual([1,2,3]);
        });
    });


    describe('hasNetworkData', () => {
        it('if all network data is empty, return false', () => {
            expect(hasNetworkData({
                networkData: {
                    networkSites: []
                }
            })).toEqual(false);
        });

        it('if even one network data has data, return true', () => {
            expect(hasNetworkData({
                 networkData: {
                    networkSites: [1]
                }
            })).toEqual(true);
        });
    });

});