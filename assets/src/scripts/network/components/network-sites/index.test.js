import {select} from 'd3-selection';
import sinon from 'sinon';

import config from 'ui/config';
import {configureStore, Actions} from 'network/store';

import {attachToNode} from './index';

describe('network map module', () => {
    config.TNM_USGS_TOPO_ENDPOINT = 'https://fakeusgstopo.com';
    config.TNM_USGS_IMAGERY_ONLY_ENDPOINT = 'https://fakeimageryonly.com';
    config.TNM_USGS_IMAGERY_TOPO_ENDPOINT = 'https://fakeimagerytopo.com';
    config.TNM_HYDRO_ENDPOINT = 'https://faketnmhydro.com';
    config.OBSERVATIONS_ENDPOINT = 'https://fakeogcservice.com/observations/';

    let componentNode;
    let store;
    let container;
    let fakeServer;

    beforeEach(() => {
        fakeServer = sinon.createFakeServer();
        container = select('body')
            .append('div')
                .attr('id', 'network-component');
        container.append('div').attr('id', 'network-map');
        componentNode = document.getElementById('network-component');
        let tableDiv = container
            .append('div')
                .attr('id', 'link-list');
        tableDiv.append('ul')
            .attr('class', 'pagination');
        tableDiv
            .append('table')
            .append('tbody')
            .attr('class', 'list');
    });

    afterEach(() => {
        container.remove();
        fakeServer.restore();
    });


    describe('Map creation without Network maps', () => {
        beforeEach(() => {
            store = configureStore();
            jest.spyOn(Actions, 'retrieveNetworkMonitoringLocations').mockReturnValue(function() {
                return Promise.resolve({});
            });
            attachToNode(store, componentNode, {
                networkcd: 'AHS',
                extent: '[-93.078075, 34.513375, -92.986325, 34.588425]'
            });


        });

        it('Should create a leaflet map within the mapNode with', () => {
            expect(select(componentNode).selectAll('.leaflet-container').size()).toBe(1);
        });

        it('Should create a legend control', () => {
            expect(select(componentNode).selectAll('.legend').size()).toBe(1);
        });

        it('Should not create an overlay layer', () => {
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    expect(select(componentNode).selectAll('.leaflet-overlay-pane img').size()).toBe(0);
                    resolve();
                });
            });
        });

        it('Should not create Network Legend', () => {
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    expect(select(componentNode).select('#network-legend-list').size()).toBe(0);
                    resolve();
                });
            });
        });

        it('should not create any rows in the table', () => {
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    expect(select(componentNode).selectAll('tbody tr').size()).toBe(0);
                    resolve();
                });
            });
        });
    });
});
