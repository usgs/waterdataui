import {applyMiddleware, combineReducers, createStore} from 'redux';
import {default as thunk} from 'redux-thunk';

import {MOCK_OBSERVATION_ITEM} from 'ui/mock-service-data';

import {Actions, networkDataReducer} from 'ml/store/network';

describe('monitoring-location/store/network module', () => {
    /* eslint no-use-before-define: 0 */
    let store;

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
        jasmine.Ajax.install();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
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

                expect(jasmine.Ajax.requests.count()).toBe(1);
                expect(jasmine.Ajax.requests.at(0).url).toContain('USGS-12345678');
            });

            it('Expects the store to be updated on successful fetches', (done) => {
                const promise = store.dispatch(Actions.retrieveNetworkListData('12345678'));
                jasmine.Ajax.requests.at(0).respondWith({
                    status: 200,
                    responseText: MOCK_OBSERVATION_ITEM
                });

                promise.then(() => {
                    const networkData = store.getState().networkData;

                    expect(networkData.networkList).toEqual(
                        JSON.parse(MOCK_OBSERVATION_ITEM).links.filter(function(link) {
                            return link['rel'] == 'collection';
                        }));
                    done();
                });
            });

            it('Expects the store to contain empty array if calls are unsuccessful', (done) => {
                const promise = store.dispatch(Actions.retrieveNetworkListData('12345678'));
                jasmine.Ajax.requests.at(0).respondWith({
                    status: 500,
                    responseText: 'Internal server error'
                });

                promise.then(() => {
                    const networkData = store.getState().networkData;

                    expect(networkData.networkList).toEqual([]);
                    done();
                });
            });
        });
    });
});