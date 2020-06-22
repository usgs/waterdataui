import {select, selectAll} from 'd3-selection';
import {attachToNode} from './network';
import {configureStore} from '../store';

const TEST_STATE = {
    networkData: {
        networkList: [
                {
                    rel: "collection",
                    href: "https://labs-dev.wma.chs.usgs.gov/api/observations/collections/monitoring-locations?f=json",
                    type: "application/json",
                    title: "NWIS Monitoring Locations"
                },
                {
                    rel: "collection",
                    href: "https://labs-dev.wma.chs.usgs.gov/api/observations/collections/AHS?f=json",
                    type: "application/json",
                    title: "Arkansas Hot Springs National Park Network"
                },
                {
                    rel: "collection",
                    href: "https://labs-dev.wma.chs.usgs.gov/api/observations/collections/RTN?f=json",
                    type: "application/json",
                    title: "Real-Time Groundwater Level Network"
                },
                {
                    rel: "collection",
                    href: "https://labs-dev.wma.chs.usgs.gov/api/observations/collections/CRN?f=json",
                    type: "application/json",
                    title: "Climate Response Network"
                },
                {
                    rel: "collection",
                    href: "https://labs-dev.wma.chs.usgs.gov/api/observations/collections/AGL?f=json",
                    type: "application/json",
                    title: "Active Groundwater Level Network"
                }
        ]
    },
    ui: {
        width: 400
    }
};

const TEST_NO_STATE = {
    networkData: {
        networkList: []
    },
    ui: {
        width: 400
    }
};

describe('network component', () => {
    let networkNode;

    beforeEach(() => {
      let body = select('body');
      body.append('div')
            .attr('id', 'observation-network-list')
          .append('table')
          .attr('id', 'network-list-table');

      networkNode = document.getElementById('observation-network-list');
      jasmine.Ajax.install();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
        select('#observation-network-list').remove();
    });


    describe('Tests for no network data', () => {
        let store;

        beforeEach(() => {
            store = configureStore(TEST_NO_STATE)
        });

        it('No rows if no data', () => {
            attachToNode(store, networkNode, {
                siteno: '12345678'
            });

            expect(select(networkNode).select('tbody tr').size()).toBe(0);
        });
    });

    describe('Tests for network data', () => {
        let store;

        beforeEach(() => {
            store = configureStore(TEST_STATE)
        });

        it('Create network table if data', () => {
            attachToNode(store, networkNode, {
                siteno: '12345678'
            });

            expect(select(networkNode).selectAll('tbody tr').size()).toBe(5);
        });
    });
});
