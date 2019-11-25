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
                        //some data ,
                        //some more data
                    ],
                    downstreamSites: [
                        //some data ,
                        //some more data
                    ]
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
                        //some data ,
                        //some more data
                    ],
                    downstreamSites: [
                        //some data ,
                        //some more data
                    ]
            });
        });
    });
});
