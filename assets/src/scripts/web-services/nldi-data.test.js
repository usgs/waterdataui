import mockConsole from 'jest-mock-console';
import sinon from 'sinon';

import {MOCK_NLDI_UPSTREAM_FLOW_FEATURE, MOCK_NLDI_DOWNSTREAM_FLOW_FEATURE,
    MOCK_NLDI_UPSTREAM_BASIN_FEATURE} from 'ui/mock-service-data';

import {fetchNldiUpstreamFlow, fetchNldiDownstreamFlow, fetchNldiUpstreamBasin} from './nldi-data';

describe('nldi-data module', () => {
    let fakeServer;
    let restoreConsole;

    beforeEach(() => {
        fakeServer = sinon.createFakeServer();
        restoreConsole = mockConsole();
    });

    afterEach(() => {
        restoreConsole();
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

            it('expected response is json object with the upstream flow', () => {
                return upstreamFlowPromise.then((resp) => {
                    expect(resp).toHaveLength(2);
                    expect(resp[0].properties.nhdplus_comid).toBe('10286212');
                    expect(resp[1].properties.nhdplus_comid).toBe('10286442');
                });
            });
        });

        describe('with error response', () => {
            it('On failed response return an empty feature list', () => {
                const fetchPromise = fetchNldiUpstreamFlow(siteno);
                fakeServer.requests[0].respond(500);
                return fetchPromise.then((resp) => {
                   expect(resp).toHaveLength(0);
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
                fakeServer.requests[0].respond(
                    200,
                    {'Content-Type': 'application/json'},
                    MOCK_NLDI_DOWNSTREAM_FLOW_FEATURE
                );
            });

            it('expected response is json object with the downstream flow', () => {
                return downstreamFlowPromise.then((resp) => {
                    expect(resp).toHaveLength(2);
                    expect(resp[0].properties.nhdplus_comid).toBe('10286213');
                    expect(resp[1].properties.nhdplus_comid).toBe('10286443');
                });
            });
        });

        describe('with error response', () => {
            it('On failed response return an empty feature list', () => {
                const fetchPromise = fetchNldiDownstreamFlow(siteno);
                fakeServer.requests[0].respond(500);
                return fetchPromise.then((resp) => {
                   expect(resp).toHaveLength(0);
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
                fakeServer.requests[0].respond(
                    200,
                    {'Content-Type': 'application/json'},
                    MOCK_NLDI_UPSTREAM_BASIN_FEATURE
                );
            });

            it('expected response is json object with the upstream basin', () => {
                return upstreamBasinPromise.then((resp) => {
                    expect(resp).toHaveLength(1);
                });
            });
        });

        describe('with error response', () => {
            it('On failed response return an empty feature list', () => {
                const fetchPromise = fetchNldiUpstreamBasin(siteno);
                fakeServer.requests[0].respond(500);
                return fetchPromise.then((resp) => {
                   expect(resp).toHaveLength(0);
                });
            });
        });
    });
});
