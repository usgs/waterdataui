import {select} from 'd3-selection';
import sinon from 'sinon';

import {configureStore} from 'network/store';

import {createMapLegend} from './legend';


describe('component/map/legend module', () => {
    let control;
    let map;
    let store;
    let fakeServer;

    beforeEach(() => {
        fakeServer = sinon.createFakeServer();
        select('body').append('div')
            .attr('id', 'map');
        map = L.map('map', {
            center: [43.0, -100.0],
            zoom: 5
        });

        store = configureStore({
            networkData: {
                networkMonitoringLocations: []
            }
        });
        control = createMapLegend(map, store);
    });

    afterEach(() => {
        select('#map').remove();
        fakeServer.restore();
    });

    describe('createMapLegend', () => {
        it('expect to create a legend with no markers if there is no data', () => {
            store = configureStore({
                networkData: {
                    networkMonitoringLocations: []
                }
            });
            control = createMapLegend(map, store);
            expect(control.getLegendListContainer().hasChildNodes()).toBe(false);
        });

        it('expect to create a legend with a marker is there is data', () => {
            store = configureStore({
                networkData: {
                    networkMonitoringLocations: [{
                        type: 'Feature',
                        id: 'USGS-343048093030401'
                    }, {
                        type: 'Feature',
                        id: 'USGS-343048093030402'
                    }]
                }
            });
            control = createMapLegend(map, store);
            expect(control.getLegendListContainer().childNodes.length).toBe(1);
        });
    });
});
