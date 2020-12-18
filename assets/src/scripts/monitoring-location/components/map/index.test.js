import {select} from 'd3-selection';
import sinon from 'sinon';

import config from 'ui/config';
import * as utils from 'ui/utils';

import {configureStore} from 'ml/store';

import {attachToNode} from './index';

describe('monitoring-location/components/map module', () => {
    utils.mediaQuery = jest.fn().mockReturnValue(true);

    config.TNM_USGS_TOPO_ENDPOINT = 'https://fakeusgstopo.com';
    config.TNM_USGS_IMAGERY_ONLY_ENDPOINT = 'https://fakeimageryonly.com';
    config.TNM_USGS_IMAGERY_TOPO_ENDPOINT = 'https://fakeimagerytopo.com';
    config.TNM_HYDRO_ENDPOINT = 'https://faketnmhydro.com';
    config.OBSERVATIONS_ENDPOINT = 'https://fakeogcservice.com/observations/';
    config.FIM_GIS_ENDPOINT = 'https://fakelegendservice.com/';
    config.NLDI_SERVICES_ENDPOINT = 'https://fakenldiservice.com/';

    let mapNode;
    let store;
    let fakeServer;

    beforeEach(() => {
        fakeServer = sinon.createFakeServer();
        let mapContainer = select('body')
            .append('div')
                .attr('id', 'map');
        mapContainer.append('div').attr('id', 'flood-layer-control-container');
        mapContainer.append('div').attr('id', 'site-map');
        mapNode = document.getElementById('map');
    });

    afterEach(() => {
        select('#map').remove();
        fakeServer.restore();
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
});