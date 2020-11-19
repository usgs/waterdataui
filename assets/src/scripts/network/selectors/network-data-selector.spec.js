import {
    getNetworkMonitoringLocations,
    hasNetworkMonitoringLocations
} from './network-data-selector';

describe('network-data-selector', () => {

    describe('getNetworkMonitoringLocations', () => {
        it('if network is empty, empty array is returned', () => {
            expect(getNetworkMonitoringLocations({
                networkData: {
                    networkMonitoringLocations: []
                }
            })).toEqual([]);
        });

        it('if network MonitoringLocations, the data is returned', () => {
            expect(getNetworkMonitoringLocations({
                networkData: {
                    networkMonitoringLocations: [1,2,3]
                }
            })).toEqual([1,2,3]);
        });
    });


    describe('hasNetworkMonitoringLocations', () => {
        it('if no monitoring locations, return false', () => {
            expect(hasNetworkMonitoringLocations({
                networkData: {
                    networkMonitoringLocations: []
                }
            })).toEqual(false);
        });

        it('if even one network data has data, return true', () => {
            expect(hasNetworkMonitoringLocations({
                 networkData: {
                    networkMonitoringLocations: [1]
                }
            })).toEqual(true);
        });
    });

});