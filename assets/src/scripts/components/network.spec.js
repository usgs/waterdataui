import {select} from 'd3-selection';
import {attachToNode} from './index';
import {configureStore} from '../../store';

const TEST_STATE = {
    newtorkData: {
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
    }
};

const TEST_NO_STATE = {
    newtorkData: {
        networkList: []
    }
};

describe('network component', () => {
    let networkNode;

    beforeEach(() => {
      let body = select('body');
      body.append('div')
            .attr('id', 'observation-network-list');

      networkNode = document.getElementById('observation-network-list');
      jasmine.Ajax.install();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
        select('#observation-network-list').remove();
    });

    it('expect alert if no siteno defined', () => {
        attachToNode({}, networkNode, {});
        expect(graphNode.innerHTML).toContain('No network data is available');
    });

    describe('Tests for no network data', () => {
        let store;

        beforeEach(() => {
            store = configureStore(TEST_NO_STATE)
        });

        it('loading-indicator is shown until initial data has been retrieved', () => {
            attachToNode(store, graphNode, {
                siteno: '12345678'
            });

            expect(select(graphNode).select('tbody tr').size()).toBe(0);
        });
    });

    describe('Tests for network data', () => {
        let store;

        beforeEach(() => {
            store = configureStore(TEST_STATE)
        });

        it('loading-indicator is shown until initial data has been retrieved', () => {
            attachToNode(store, graphNode, {
                siteno: '12345678'
            });

            expect(select(graphNode).select('tbody tr').size()).toBe(5);
        });
    });
});
