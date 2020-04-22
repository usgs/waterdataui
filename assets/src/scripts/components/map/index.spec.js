import {select} from 'd3-selection';

import {configureStore} from '../../store';

import {attachToNode} from './index';


describe('map module', () => {
    let mapNode;
    let store;

    beforeEach(() => {
        jasmine.Ajax.install();
        let mapContainer = select('body')
            .append('div')
                .attr('id', 'map');
        mapContainer.append('div').attr('id', 'flood-layer-control-container');
        mapContainer.append('div').attr('id', 'site-map');
        mapNode = document.getElementById('map');
    });

    afterEach(() => {
        select('#map').remove();
        jasmine.Ajax.uninstall();
    });

    describe('Map creation without FIM maps', () => {
        beforeEach(() => {
            store = configureStore();
            attachToNode(store, mapNode, {
                siteno: '12345677',
                latitude: 43.0,
                longitude: -100.0,
                zoom: 5
            });
        });

        it('Should create a leaflet map within the mapNode with', () => {
            expect(select(mapNode).selectAll('.leaflet-container').size()).toBe(1);
        });

        it('Should create a marker layer', () => {
            expect(select(mapNode).selectAll('.leaflet-marker-pane img').size()).toBe(1);
        });

        it('Should not create an FIM layers', () => {
            expect(select(mapNode).selectAll('.leaflet-overlay-pane img').size()).toBe(0);
        });

        it('Should create a legend control', () => {
            expect(select(mapNode).selectAll('.legend').size()).toBe(1);
        });

        it('Should create not create FIM Legend', () => {
            expect(select(mapNode).select('#fim-legend-list').size()).toBe(0);
        });

        it('Should not create a FIM slider', () => {
            expect(select(mapNode).select('input[type="range"]').size()).toBe(0);
        });

        it('Should create a leaf-control-layers class', () => {
            expect(select(mapNode).selectAll('.leaflet-control-layers').size()).toBe(1);
        });

    });


    describe('Map creation with FIM information', () => {
        beforeEach(() => {
            store = configureStore({
                floodData: {
                    stages: [9, 10, 11, 12],
                    extent: {
                        xmin: -87.4667,
                        ymin: 39.43439,
                        xmax: -87.408,
                        ymax: 39.51445
                    }
                },
                floodState: {
                    gageHeight: 10
                }
            });
            attachToNode(store, mapNode, {
                siteno: '1234567',
                latitude: 39.46,
                longitude: -87.42,
                zoom: 5
            });
        });

        it('Should create FIM layers', () => {
            expect(select(mapNode).selectAll('.leaflet-overlay-pane img').size()).toBe(3);
        });

        it('Should create a FIM Legend', () => {
            expect(select(mapNode).select('#fim-legend-list').size()).toBe(1);
        });

        it('Should create the FIM slider', () => {
            expect(select(mapNode).select('input[type="range"]').size()).toBe(1);
        });
    });

    describe('link back to FIM', () => {
        let testFloodData;
        const testMapData = {
            siteno: '1234567',
            latitude: 39.46,
            longitude: -87.42,
            zoom: 5
        };

        beforeEach(() => {
            testFloodData = {
                floodData: {
                    stages: [13, 14, 15],
                    extent: {
                        xmin: -87.4667,
                        ymin: 39.43439,
                        xmax: -87.408,
                        ymax: 39.51445
                    }
                },
                floodState: {
                    gageHeight: 10
                }
            };
        });

        it('should happen if there are flood stages for a site', () => {
            store = configureStore(testFloodData);
            attachToNode(store, mapNode, testMapData);
            expect(select(mapNode).select('a#fim-link').text()).toEqual('Provisional Flood Information');
        });

        it('should not happen if there are no flood stages for a site', () => {
            testFloodData.floodData.stages = [];
            store = configureStore(testFloodData);
            attachToNode(store, mapNode, testMapData);
            expect(select(mapNode).select('a#fim-link').node()).toBeNull();
        });
    });


    describe('Map creation without NLDI maps', () => {
        beforeEach(() => {
            store = configureStore();
            attachToNode(store, mapNode, {
                siteno: '12345677',
                latitude: 43.0,
                longitude: -100.0,
                zoom: 5
            });
        });

        it('Should create a leaflet map within the mapNode with', () => {
            expect(select(mapNode).selectAll('.leaflet-container').size()).toBe(1);
        });

        it('Should create a marker layer', () => {
            expect(select(mapNode).selectAll('.leaflet-marker-pane img').size()).toBe(1);
        });

        it('Should not create an overlay layer', () => {
            expect(select(mapNode).selectAll('.leaflet-overlay-pane img').size()).toBe(0);
        });

        it('Should create a legend control', () => {
            expect(select(mapNode).selectAll('.legend').size()).toBe(1);
        });

        it('Should create not create NLDI Legend', () => {
            expect(select(mapNode).select('#nldi-legend-list').size()).toBe(0);
        });

        it('Should create a leaf-control-layers class', () => {
            expect(select(mapNode).selectAll('.leaflet-control-layers').size()).toBe(1);
        });

    });


    describe('Map creation with NLDI information', () => {
        beforeEach(() => {
            store = configureStore({
                nldiData: {
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
                    upstreamBasin: []
                }
            });
            attachToNode(store, mapNode, {
                siteno: '1234567',
                latitude: 39.46,
                longitude: -87.42,
                zoom: 5
            });
        });

        it('Should create NLDI layers', () => {
            expect(select(mapNode).selectAll('.leaflet-overlay-pane svg g').size()).toBe(1);
            expect(select(mapNode).selectAll('.leaflet-overlay-pane svg g path').size()).toBe(8);
        });

        it('Should create a NLDI Legend', () => {
            expect(select(mapNode).select('#nldi-legend-list').size()).toBe(1);
        });

    });
});
