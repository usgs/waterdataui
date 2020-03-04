import { nldiDataReducer } from './nldi-data-reducer';

describe('nldi-data-reducer', () => {

    describe('SET_NLDI_FEATURES', () => {
        it('should handle setting the nldiData', () => {
            expect(nldiDataReducer({}, {
                type: 'SET_NLDI_FEATURES',
                    upstreamFlows: [
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: [
                                    [-87.4336489066482, 39.4954827949405],
                                    [-87.4337763041258, 39.4952046945691]
                                ]
                            },
                            properties: {
                                'nhdplus_comid': '10286212'
                            }
                        },
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: [
                                    [-87.4476554021239, 39.4393114000559],
                                    [-87.4480373039842, 39.4390688985586]
                                ]
                            },
                            properties: {
                                'nhdplus_comid': '10286442'
                            }
                        }
                    ],
                    downstreamFlows: [
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: [
                                    [-87.4336489066483, 39.4954827949406],
                                    [-87.4337763041259, 39.4952046945692]
                                ]
                            },
                            properties: {
                                'nhdplus_comid': '10286213'
                            }
                        },
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: [
                                    [-87.4476554021240, 39.4393114000560],
                                    [-87.4480373039843, 39.4390688985587]
                                ]
                            },
                            properties: {
                                'nhdplus_comid': '10286443'
                            }
                        }
                    ],
                    upstreamSites: [
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [-87.4195, 39.465722]
                            },
                            properties: {
                                source: 'nwissite',
                                sourceName: 'NWIS Sites',
                                identifier: 'USGS-03341500',
                                name: 'WABASH RIVER AT TERRE HAUTE, IN',
                                uri: 'https://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=03341500',
                                comid: '10286212',
                                navigation: 'https://labs.waterdata.usgs.gov/api/nldi/linked-data/nwissite/USGS-03341500/navigate'
                            }
                        },
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [-87.568634, 39.02032]
                            },
                            properties: {
                                source: 'nwissite',
                                sourceName: 'NWIS Sites',
                                identifier: 'USGS-03342000',
                                name: 'WABASH RIVER AT RIVERTON, IN',
                                uri: 'https://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=03342000',
                                comid: '10288896',
                                navigation: 'https://labs.waterdata.usgs.gov/api/nldi/linked-data/nwissite/USGS-03342000/navigate'
                            }
                        }
                    ],
                    downstreamSites: [
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [-85.489778, 40.85325]
                            },
                            properties: {
                                source: 'nwissite',
                                sourceName: 'NWIS Sites',
                                identifier: 'USGS-03323500',
                                name: 'WABASH RIVER AT HUNTINGTON, IN',
                                uri: 'https://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=03323500',
                                comid: '18508614',
                                navigation: 'https://labs.waterdata.usgs.gov/api/nldi/linked-data/nwissite/USGS-03323500/navigate'
                            }
                        },
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [-85.820263, 40.790877]
                            },
                            properties: {
                                source: 'nwissite',
                                sourceName: 'NWIS Sites',
                                identifier: 'USGS-03325000',
                                name: 'WABASH RIVER AT WABASH, IN',
                                uri: 'https://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=03325000',
                                comid: '18508640',
                                navigation: 'https://labs.waterdata.usgs.gov/api/nldi/linked-data/nwissite/USGS-03325000/navigate'
                            }
                        }
                    ],
                upstreamBasin: {
                            type: 'FeatureCollection',
                            features: [
                                {
                                    type: 'Feature',
                                    geometry: {
                                        type: 'Polygon',
                                        coordinates: [[-105.996400477, 36.1905362630001], [-105.994985767, 36.20007602], [-105.997781253, 36.2060425510001], [-105.995979878, 36.2080856000001]]
                                    },
                                    properties: {}
                                }
                                ]
                }
            })).toEqual({
                    upstreamFlows: [
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: [
                                    [-87.4336489066482, 39.4954827949405],
                                    [-87.4337763041258, 39.4952046945691]
                                ]
                            },
                            properties: {
                                'nhdplus_comid': '10286212'
                            }
                        },
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: [
                                    [-87.4476554021239, 39.4393114000559],
                                    [-87.4480373039842, 39.4390688985586]
                                ]
                            },
                            properties: {
                                'nhdplus_comid': '10286442'
                            }
                        }
                    ],
                    downstreamFlows: [
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: [
                                    [-87.4336489066483, 39.4954827949406],
                                    [-87.4337763041259, 39.4952046945692]
                                ]
                            },
                            properties: {
                                'nhdplus_comid': '10286213'
                            }
                        },
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: [
                                    [-87.4476554021240, 39.4393114000560],
                                    [-87.4480373039843, 39.4390688985587]
                                ]
                            },
                            properties: {
                                'nhdplus_comid': '10286443'
                            }
                        }
                    ],
                    upstreamSites: [
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [-87.4195, 39.465722]
                            },
                            properties: {
                                source: 'nwissite',
                                sourceName: 'NWIS Sites',
                                identifier: 'USGS-03341500',
                                name: 'WABASH RIVER AT TERRE HAUTE, IN',
                                uri: 'https://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=03341500',
                                comid: '10286212',
                                navigation: 'https://labs.waterdata.usgs.gov/api/nldi/linked-data/nwissite/USGS-03341500/navigate'
                            }
                        },
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [-87.568634, 39.02032]
                            },
                            properties: {
                                source: 'nwissite',
                                sourceName: 'NWIS Sites',
                                identifier: 'USGS-03342000',
                                name: 'WABASH RIVER AT RIVERTON, IN',
                                uri: 'https://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=03342000',
                                comid: '10288896',
                                navigation: 'https://labs.waterdata.usgs.gov/api/nldi/linked-data/nwissite/USGS-03342000/navigate'
                            }
                        }
                    ],
                    downstreamSites: [
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [-85.489778, 40.85325]
                            },
                            properties: {
                                source: 'nwissite',
                                sourceName: 'NWIS Sites',
                                identifier: 'USGS-03323500',
                                name: 'WABASH RIVER AT HUNTINGTON, IN',
                                uri: 'https://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=03323500',
                                comid: '18508614',
                                navigation: 'https://labs.waterdata.usgs.gov/api/nldi/linked-data/nwissite/USGS-03323500/navigate'
                            }
                        },
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [-85.820263, 40.790877]
                            },
                            properties: {
                                source: 'nwissite',
                                sourceName: 'NWIS Sites',
                                identifier: 'USGS-03325000',
                                name: 'WABASH RIVER AT WABASH, IN',
                                uri: 'https://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=03325000',
                                comid: '18508640',
                                navigation: 'https://labs.waterdata.usgs.gov/api/nldi/linked-data/nwissite/USGS-03325000/navigate'
                            }
                        }
                    ],
                upstreamBasin: {
                            type: 'FeatureCollection',
                            features: [
                                {
                                    type: 'Feature',
                                    geometry: {
                                        type: 'Polygon',
                                        coordinates: [[-105.996400477, 36.1905362630001], [-105.994985767, 36.20007602], [-105.997781253, 36.2060425510001], [-105.995979878, 36.2080856000001]]
                                    },
                                    properties: {}
                                }
                                ]
                }
            });
        });
    });
});
