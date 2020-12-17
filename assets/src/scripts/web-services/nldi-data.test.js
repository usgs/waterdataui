import sinon from 'sinon';

import {MOCK_NLDI_UPSTREAM_FLOW_FEATURE, MOCK_NLDI_DOWNSTREAM_FLOW_FEATURE,
    MOCK_NLDI_UPSTREAM_BASIN_FEATURE} from 'ui/mock-service-data';

import {fetchNldiUpstreamFlow, fetchNldiDownstreamFlow, fetchNldiUpstreamBasin} from './nldi-data';

describe('nldi-data module', () => {
    let fakeServer;

    beforeEach(() => {
        fakeServer = sinon.createFakeServer();
    });

    afterEach(() => {
        fakeServer.restore();
    });

    describe('fetchNldiUpstreamFlow', () => {
        const siteno = '12345678';

        describe('with valid response', () => {

            let upstreamFlowPromise;

            beforeEach(() => {
                /* eslint no-use-before-define: 0 */

                upstreamFlowPromise = fetchNldiUpstreamFlow(siteno);
                fakeServer.requests[0].respond(
                    200,
                    {'Content-Type': 'application/json'},
                    MOCK_NLDI_UPSTREAM_FLOW_FEATURE
                );
            });

            it('expected response is json object with the upstream flow', (done) => {
                upstreamFlowPromise.then((resp) => {
                    expect(resp.length).toBe(2);
                    expect(resp[0].properties.nhdplus_comid).toBe('10286212');
                    expect(resp[1].properties.nhdplus_comid).toBe('10286442');
                    done();
                });
            });
        });

        describe('with error response', () => {
            it('On failed response return an empty feature list', (done) => {
                fetchNldiUpstreamFlow(siteno).then((resp) => {
                   expect(resp.length).toBe(0);
                   done();
                });
                fakeServer.requests[0].respond(500);
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
                fakeServer.requests[0].respond(
                    200,
                    {'Content-Type': 'application/json'},
                    MOCK_NLDI_DOWNSTREAM_FLOW_FEATURE
                );
            });

            it('expected response is json object with the downstream flow', (done) => {
                downstreamFlowPromise.then((resp) => {
                    expect(resp.length).toBe(2);
                    expect(resp[0].properties.nhdplus_comid).toBe('10286213');
                    expect(resp[1].properties.nhdplus_comid).toBe('10286443');

                    done();
                });
            });
        });

        describe('with error response', () => {
            it('On failed response return an empty feature list', (done) => {
                fetchNldiDownstreamFlow(siteno).then((resp) => {
                   expect(resp.length).toBe(0);
                   done();
                });
                fakeServer.requests[0].respond(500);
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
                fakeServer.requests[0].respond(
                    200,
                    {'Content-Type': 'application/json'},
                    MOCK_NLDI_UPSTREAM_BASIN_FEATURE
                );
            });

            it('expected response is json object with the upstream basin', (done) => {
                upstreamBasinPromise.then((resp) => {
                    expect(resp.length).toBe(1);
                    done();
                });
            });
        });

        describe('with error response', () => {
            it('On failed response return an empty feature list', (done) => {
                fetchNldiUpstreamBasin(siteno).then((resp) => {
                   expect(resp.length).toBe(0);
                   done();
                });
                fakeServer.requests[0].respond(500);
            });
        });
    });
});
