import {
    getNetworkList,
    hasNetworkData
} from './network-selector';

describe('monitoring-location/selectors/network-selector', () => {

    describe('getNetworkList', () => {
        it('if network list is empty, empty array is returned', () => {
            expect(getNetworkList({
                networkData: {
                    networkList: []
                }
            })).toEqual([]);
        });

        it('if network list has data, the data is returned', () => {
            expect(getNetworkList({
                networkData: {
                    networkList: [1,2,3]
                }
            })).toEqual([1,2,3]);
        });
    });

    describe('hasNetworkData', () => {
        it('if netowrk data is empty, return false', () => {
            expect(hasNetworkData({
                networkData: {
                    networkList: []
                }
            })).toEqual(false);
        });

        it('if even one nldi data has data, return true', () => {
            expect(hasNetworkData({
                networkData: {
                    networkList: [1]
                }
            })).toEqual(true);
        });
    });
});