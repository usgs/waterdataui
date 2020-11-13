import {networkDataReducer} from 'network/store/network-data-reducer';

describe('network-data-reducer', () => {

    describe('SET_NETWORK_FEATURES', () => {
        it('should handle setting the network data', () => {
            expect(networkDataReducer({}, {
                type: 'SET_NETWORK_FEATURES',
                    networkSites: [
                        {
                            type: 'Feature',
                            id: 'USGS-343048093030401',
                            geometry: {
                                type: 'Point',
                                coordinates: [
                                    -93.0511417,
                                    34.513375
                                ]
                            },
                            properties: {
                                agency: 'U.S. Geological Survey',
                                monitoringLocationNumber: '343048093030401',
                                monitoringLocationName: '02S19W33CBD1 Hot Springs',
                                monitoringLocationType: 'Well',
                                district: 'Arkansas',
                                state: 'Arkansas',
                                county: 'Garland County',
                                country: 'US',
                                monitoringLocationAltitudeLandSurface: '749',
                                altitudeMethod: 'Interpolated from Digital Elevation Model',
                                altitudeAccuracy: '4.3',
                                altitudeDatum: 'North American Vertical Datum of 1988',
                                nationalAquifer: 'Other aquifers',
                                localAquifer: 'Hot Springs Sandstone',
                                localAquiferType: 'Unconfined single aquifer',
                                wellDepth: '336.5',
                                holeDepth: '336.5',
                                holeDepthSource: 'L',
                                agencyCode: 'USGS',
                                districtCode: '05',
                                stateFIPS: 'US:05',
                                countyFIPS: 'US:05:051',
                                countryFIPS: 'US',
                                hydrologicUnit: '080401010804',
                                monitoringLocationUrl: 'https://waterdata.usgs.gov/monitoring-location/343048093030401'
                            },
                            links: [
                                {
                                    rel: 'self',
                                    type: 'application/geo+json',
                                    title: 'This document as GeoJSON',
                                    href: 'https://labs.waterdata.usgs.gov/api/observations/collections/AHS/items/USGS-343048093030401?f=json'
                                },
                                {
                                    rel: 'collection',
                                    type: 'application/json',
                                    title: 'Arkansas Hot Springs National Park Network',
                                    href: 'https://labs.waterdata.usgs.gov/api/observations/collections/AHS?f=json'
                                }
                            ]
                        }]
            })).toEqual({
                        networkSites: [
                        {
                            type: 'Feature',
                            id: 'USGS-343048093030401',
                            geometry: {
                                type: 'Point',
                                coordinates: [
                                    -93.0511417,
                                    34.513375
                                ]
                            },
                            properties: {
                                agency: 'U.S. Geological Survey',
                                monitoringLocationNumber: '343048093030401',
                                monitoringLocationName: '02S19W33CBD1 Hot Springs',
                                monitoringLocationType: 'Well',
                                district: 'Arkansas',
                                state: 'Arkansas',
                                county: 'Garland County',
                                country: 'US',
                                monitoringLocationAltitudeLandSurface: '749',
                                altitudeMethod: 'Interpolated from Digital Elevation Model',
                                altitudeAccuracy: '4.3',
                                altitudeDatum: 'North American Vertical Datum of 1988',
                                nationalAquifer: 'Other aquifers',
                                localAquifer: 'Hot Springs Sandstone',
                                localAquiferType: 'Unconfined single aquifer',
                                wellDepth: '336.5',
                                holeDepth: '336.5',
                                holeDepthSource: 'L',
                                agencyCode: 'USGS',
                                districtCode: '05',
                                stateFIPS: 'US:05',
                                countyFIPS: 'US:05:051',
                                countryFIPS: 'US',
                                hydrologicUnit: '080401010804',
                                monitoringLocationUrl: 'https://waterdata.usgs.gov/monitoring-location/343048093030401'
                            },
                            links: [
                                {
                                    rel: 'self',
                                    type: 'application/geo+json',
                                    title: 'This document as GeoJSON',
                                    href: 'https://labs.waterdata.usgs.gov/api/observations/collections/AHS/items/USGS-343048093030401?f=json'
                                },
                                {
                                    rel: 'collection',
                                    type: 'application/json',
                                    title: 'Arkansas Hot Springs National Park Network',
                                    href: 'https://labs.waterdata.usgs.gov/api/observations/collections/AHS?f=json'
                                }
                            ]
                        }]
            });
        });
    });
});
