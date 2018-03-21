const { select } = require('d3-selection');
const proxyquire = require('proxyquireify')(require);

const { attachToNode } = require('./map');
const { configureStore } = require('../store');

describe('map module', () => {
    let mapNode;
    let store;
    let floodDataMock;
    let map;

    beforeEach(() => {
        jasmine.Ajax.install();
        select('body')
            .append('div')
                .attr('id', 'map');
        mapNode = document.getElementById('map');

        floodDataMock = {
            FLOOD_EXTENTS_ENDPOINT: 'http://fake.service.com',
            FLOOD_BREACH_ENDPOINT: 'http://fake.service.com',
            FLOOD_LEVEE_ENDPOINT: 'http://fake.service.com'
        };

        map = proxyquire('./map', {'../floodData': floodDataMock});
    });

    afterEach(() => {
        select('#map').remove();
        jasmine.Ajax.uninstall();
    });

    describe('Map creation without no FIM maps', () => {
        beforeEach(() => {
            store = configureStore();
            map.attachToNode(store, mapNode, {
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

    });

    describe('Map creation with FIM information', () => {
        beforeEach(() => {
            store = configureStore({
               floodStages: [9, 10, 11, 12],
               floodExtent:  {
                   xmin: -87.4667,
                   ymin: 39.43439,
                   xmax: -87.408,
                   ymax: 39.51445
               },
                gageHeight: 10
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

    });

    describe('link back to FIM', () => {

        let testFloodData = {
            floodStages: [13, 14, 15],
            floodExtent: {
                xmin: -87.4667,
                ymin: 39.43439,
                xmax: -87.408,
                ymax: 39.51445
            },
            gageHeight: 10
        };
        const testMapData = {
                siteno: '1234567',
                latitude: 39.46,
                longitude: -87.42,
                zoom: 5
        };

        it('should happen if there are flood stages for a site', () => {
            store = configureStore(testFloodData);
            attachToNode(store, mapNode, testMapData);
            expect(select(mapNode).select('a#fim-link').text()).toEqual('Provisional Flood Information');
        });

        it('should not happen if there are no flood stages for a site', () => {
            testFloodData['floodStages'] = [];
            store = configureStore(testFloodData);
            attachToNode(store, mapNode, testMapData);
            expect(select(mapNode).select('a#fim-link').node()).toBeNull();
        });
    });
});