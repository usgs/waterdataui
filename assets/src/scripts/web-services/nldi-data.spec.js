import {MOCK_NLDI_UPSTREAM_FLOW_FEATURE, MOCK_NLDI_DOWNSTREAM_FLOW_FEATURE,
    MOCK_NLDI_UPSTREAM_SITES_FEATURE,
    MOCK_NLDI_DOWNSTREAM_SITES_FEATURE,
    MOCK_NLDI_UPSTREAM_BASIN_FEATURE} from 'ui/mock-service-data';

import {fetchNldiUpstreamFlow, fetchNldiDownstreamFlow, fetchNldiUpstreamBasin} from './nldi-data';

describe('nldi-data module', () => {
    beforeEach(() => {
        jasmine.Ajax.install();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
    });

    describe('fetchNldiUpstreamFlow', () => {
        const siteno = '12345678';

        describe('with valid response', () => {

            let upstreamFlowPromise;

            beforeEach(() => {
                /* eslint no-use-before-define: 0 */

                upstreamFlowPromise = fetchNldiUpstreamFlow(siteno);
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200,
                    responseText: MOCK_NLDI_UPSTREAM_FLOW_FEATURE,
                    contentType: 'application/json'
                });
            });

            it('expected response is json object with the upstream flow', () => {
                upstreamFlowPromise.then((resp) => {
                    expect(resp.length).toBe(2);
                    expect(resp[0].properties.nhdplus_comid).toBe('10286212');
                    expect(resp[1].properties.nhdplus_comid).toBe('10286442');
                });
            });
        });

        describe('with error response', () => {
            it('On failed response return an empty feature list', () => {
                fetchNldiUpstreamFlow(siteno).then((resp) => {
                   expect(resp.length).toBe(0);
                });
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 500
                });
            });
        });
    });

    describe('fetchNldiDownstreamFlow', () => {
        const siteno = '12345678';

        describe('with valid response', () => {

            let downstreamFlowPromise;

            beforeEach(() => {
                /* eslint no-use-before-define: 0 */

                downstreamFlowPromise = fetchNldiDownstreamFlow(siteno);
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200,
                    responseText: MOCK_NLDI_DOWNSTREAM_FLOW_FEATURE,
                    contentType: 'application/json'
                });
            });

            it('expected response is json object with the downstream flow', () => {
                downstreamFlowPromise.then((resp) => {
                    expect(resp.length).toBe(2);
                    expect(resp[0].properties.nhdplus_comid).toBe('10286213');
                    expect(resp[1].properties.nhdplus_comid).toBe('10286443');
                });
            });
        });

        describe('with error response', () => {
            it('On failed response return an empty feature list', () => {
                fetchNldiDownstreamFlow(siteno).then((resp) => {
                   expect(resp.length).toBe(0);
                });
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 500
                });
            });
        });
    });

    describe('fetchNldiUpstreamBasin', () => {
        const siteno = '12345678';

        describe('with valid response', () => {

            let upstreamBasinPromise;

            beforeEach(() => {
                /* eslint no-use-before-define: 0 */

                upstreamBasinPromise = fetchNldiUpstreamBasin(siteno);
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200,
                    responseText: MOCK_NLDI_UPSTREAM_BASIN_FEATURE,
                    contentType: 'application/json'
                });
            });

            it('expected response is json object with the upstream basin', () => {
                upstreamBasinPromise.then((resp) => {
                    expect(resp.length).toBe(1);
                });
            });
        });

        describe('with error response', () => {
            it('On failed response return an empty feature list', () => {
                fetchNldiUpstreamBasin(siteno).then((resp) => {
                   expect(resp.length).toBe(0);
                });
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 500
                });
            });
        });

    });

});