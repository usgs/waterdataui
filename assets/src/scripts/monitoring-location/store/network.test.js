import mockConsole from 'jest-mock-console';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import {default as thunk} from 'redux-thunk';
import sinon from 'sinon';

import {MOCK_OBSERVATION_ITEM} from 'ui/mock-service-data';

import {Actions, networkDataReducer} from './network';

describe('monitoring-location/store/network module', () => {
    /* eslint no-use-before-define: 0 */
    let store;
    let fakeServer;
    let restoreConsole;

    beforeEach(() => {
        store = createStore(
            combineReducers({
                networkData: networkDataReducer
            }),
            {
                networkData: []
            },
            applyMiddleware(thunk)
        );
        fakeServer = sinon.createFakeServer();
        restoreConsole = mockConsole();
    });

    afterEach(() => {
        fakeServer.restore();
        restoreConsole();
    });

    describe('networkDataReducer and Actions', () => {
        describe('setNetworkList', () => {
            const NETWORK_LIST = [
                {
                    rel: 'collection',
                    href: 'https://labs-dev.wma.chs.usgs.gov/api/observations/collections/monitoring-locations?f=json',
                    type: 'application/json',
                    title: 'NWIS Monitoring Locations'
                },
                {
                    rel: 'collection',
                    href: 'https://labs-dev.wma.chs.usgs.gov/api/observations/collections/AHS?f=json',
                    type: 'application/json',
                    title: 'Arkansas Hot Springs National Park Network'
                },
                {
                    rel: 'collection',
                    href: 'https://labs-dev.wma.chs.usgs.gov/api/observations/collections/RTN?f=json',
                    type: 'application/json',
                    title: 'Real-Time Groundwater Level Network'
                },
                {
                    rel: 'collection',
                    href: 'https://labs-dev.wma.chs.usgs.gov/api/observations/collections/CRN?f=json',
                    type: 'application/json',
                    title: 'Climate Response Network'
                },
                {
                    rel: 'collection',
                    href: 'https://labs-dev.wma.chs.usgs.gov/api/observations/collections/AGL?f=json',
                    type: 'application/json',
                    title: 'Active Groundwater Level Network'
                }
        ];

            it('expect network data to be updated', () => {
                store.dispatch(
                    Actions.setNetworkList(NETWORK_LIST));
                const networkData = store.getState().networkData;

                expect(networkData.networkList).toEqual(NETWORK_LIST);
            });
        });

        describe('retrieveNetworkData', () => {
            it('Expects that fetching urls have the siteno', () => {
                store.dispatch(Actions.retrieveNetworkListData('12345678'));

                expect(fakeServer.requests).toHaveLength(1);
                expect(fakeServer.requests[0].url).toContain('USGS-12345678');
            });

            it('Expects the store to be updated on successful fetches', () => {
                const promise = store.dispatch(Actions.retrieveNetworkListData('12345678'));
                fakeServer.requests[0].respond(200, {}, MOCK_OBSERVATION_ITEM);

                return promise.then(() => {
                    const networkData = store.getState().networkData;

                    expect(networkData.networkList).toEqual(
                        JSON.parse(MOCK_OBSERVATION_ITEM).links.filter(function(link) {
                            return link['rel'] === 'collection';
                        }));
                });
            });

            it('Expects the store to contain empty array if calls are unsuccessful', () => {
                const promise = store.dispatch(Actions.retrieveNetworkListData('12345678'));
                fakeServer.requests[0].respond(500, {}, 'Internal server error');

                return promise.then(() => {
                    const networkData = store.getState().networkData;

                    expect(networkData.networkList).toEqual([]);
                });
            });
        });
    });
});