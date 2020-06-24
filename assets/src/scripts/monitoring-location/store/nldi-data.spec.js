import {applyMiddleware, combineReducers, createStore} from 'redux';
import {default as thunk} from 'redux-thunk';

import {
    MOCK_NLDI_UPSTREAM_FLOW_FEATURE,
    MOCK_NLDI_DOWNSTREAM_FLOW_FEATURE,
    MOCK_NLDI_UPSTREAM_SITES_FEATURE,
    MOCK_NLDI_DOWNSTREAM_SITES_FEATURE,
    MOCK_NLDI_UPSTREAM_BASIN_FEATURE
} from '../../mock-service-data';

import {Actions, nldiDataReducer} from './nldi-data';

describe('monitoring-location/store/nldi-data module', () => {
    /* eslint no-use-before-define: 0 */
    let store;

    beforeEach(() => {
        store = createStore(
            combineReducers({
                nldiData: nldiDataReducer
            }),
            {
                nldiData: {}
            },
            applyMiddleware(thunk)
        );
        jasmine.Ajax.install();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
    });

    describe('nldiDataReducer and Actions', () => {
        describe('setNldiFeatures', () => {
            const UPSTREAM_FLOWS = [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [-87.4336489066482, 39.4954827949405],
                            [-87.4337763041258, 39.4952046945691]
                        ]
                    },
                    properties: {
                        'nhdplus_comid': '10286212'
                    }
                }];
            const DOWNSTREAM_FLOWS = [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [-87.4336489066483, 39.4954827949406],
                            [-87.4337763041259, 39.4952046945692]
                        ]
                    },
                    properties: {
                        'nhdplus_comid': '10286213'
                    }
                }];

            const UPSTREAM_SITES = [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [-87.4195, 39.465722]
                    },
                    properties: {
                        source: 'nwissite',
                        sourceName: 'NWIS Sites',
                        identifier: 'USGS-03341500',
                        name: 'WABASH RIVER AT TERRE HAUTE, IN',
                        uri: 'https://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=03341500',
                        comid: '10286212',
                        navigation: 'https://labs.waterdata.usgs.gov/api/nldi/linked-data/nwissite/USGS-03341500/navigate'
                    }
                }];
            const DOWNSTREAM_SITES = [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [-85.489778, 40.85325]
                    },
                    properties: {
                        source: 'nwissite',
                        sourceName: 'NWIS Sites',
                        identifier: 'USGS-03323500',
                        name: 'WABASH RIVER AT HUNTINGTON, IN',
                        uri: 'https://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=03323500',
                        comid: '18508614',
                        navigation: 'https://labs.waterdata.usgs.gov/api/nldi/linked-data/nwissite/USGS-03323500/navigate'
                    }
                }];
            const UPSTREAM_BASIN = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[-105.996400477, 36.1905362630001], [-105.994985767, 36.20007602], [-105.997781253, 36.2060425510001], [-105.995979878, 36.2080856000001]]
                        },
                        properties: {}
                    }]
            };

            it('expect nldi data to be updated', () => {
                store.dispatch(
                    Actions.setNldiFeatures(UPSTREAM_FLOWS, DOWNSTREAM_FLOWS, UPSTREAM_SITES, DOWNSTREAM_SITES, UPSTREAM_BASIN));
                const nldiData = store.getState().nldiData;

                expect(nldiData.upstreamFlows).toEqual(UPSTREAM_FLOWS);
                expect(nldiData.downstreamFlows).toEqual(DOWNSTREAM_FLOWS);
                expect(nldiData.upstreamSites).toEqual(UPSTREAM_SITES);
                expect(nldiData.downstreamSites).toEqual(DOWNSTREAM_SITES);
                expect(nldiData.upstreamBasin).toEqual(UPSTREAM_BASIN);
            });
        });

        describe('retrieveNldiData', () => {
            it('Expects that fetching urls have the siteno', () => {
                store.dispatch(Actions.retrieveNldiData('12345678'));

                expect(jasmine.Ajax.requests.count()).toBe(5);
                expect(jasmine.Ajax.requests.at(0).url).toContain('USGS-12345678');
                expect(jasmine.Ajax.requests.at(1).url).toContain('USGS-12345678');
                expect(jasmine.Ajax.requests.at(2).url).toContain('USGS-12345678');
                expect(jasmine.Ajax.requests.at(3).url).toContain('USGS-12345678');
                expect(jasmine.Ajax.requests.at(4).url).toContain('USGS-12345678');
            });

            it('Expects the store to be updated on successful fetches', (done) => {
                const promise = store.dispatch(Actions.retrieveNldiData('12345678'));
                jasmine.Ajax.requests.at(0).respondWith({
                    status: 200,
                    responseText: MOCK_NLDI_UPSTREAM_FLOW_FEATURE
                });
                jasmine.Ajax.requests.at(1).respondWith({
                    status: 200,
                    responseText: MOCK_NLDI_DOWNSTREAM_FLOW_FEATURE
                });
                jasmine.Ajax.requests.at(2).respondWith({
                    status: 200,
                    responseText: MOCK_NLDI_UPSTREAM_SITES_FEATURE
                });
                jasmine.Ajax.requests.at(3).respondWith({
                    status: 200,
                    responseText: MOCK_NLDI_DOWNSTREAM_SITES_FEATURE
                });
                jasmine.Ajax.requests.at(4).respondWith({
                    status: 200,
                    responseText: MOCK_NLDI_UPSTREAM_BASIN_FEATURE
                });

                promise.then(() => {
                    const nldiData = store.getState().nldiData;

                    expect(nldiData.upstreamFlows).toEqual(JSON.parse(MOCK_NLDI_UPSTREAM_FLOW_FEATURE).features);
                    expect(nldiData.downstreamFlows).toEqual(JSON.parse(MOCK_NLDI_DOWNSTREAM_FLOW_FEATURE).features);
                    expect(nldiData.upstreamSites).toEqual(JSON.parse(MOCK_NLDI_UPSTREAM_SITES_FEATURE).features);
                    expect(nldiData.downstreamSites).toEqual(JSON.parse(MOCK_NLDI_DOWNSTREAM_SITES_FEATURE).features);
                    expect(nldiData.upstreamBasin).toEqual(JSON.parse(MOCK_NLDI_UPSTREAM_BASIN_FEATURE).features);
                    done();
                });
            });

            it('Expects the store to not contain empty features if calls are unsuccessful', (done) => {
                const promise = store.dispatch(Actions.retrieveNldiData('12345678'));
                jasmine.Ajax.requests.at(0).respondWith({
                    status: 500,
                    responseText: 'Internal server error'
                });
                jasmine.Ajax.requests.at(1).respondWith({
                    status: 500,
                    responseText: 'Internal server error'
                });
                jasmine.Ajax.requests.at(2).respondWith({
                    status: 500,
                    responseText: 'Internal server error'
                });
                jasmine.Ajax.requests.at(3).respondWith({
                    status: 500,
                    responseText: 'Internal server error'
                });
                jasmine.Ajax.requests.at(4).respondWith({
                    status: 500,
                    responseText: 'Internal server error'
                });

                promise.then(() => {
                    const nldiData = store.getState().nldiData;

                    expect(nldiData.upstreamFlows).toEqual([]);
                    expect(nldiData.downstreamFlows).toEqual([]);
                    expect(nldiData.upstreamSites).toEqual([]);
                    expect(nldiData.downstreamSites).toEqual([]);
                    expect(nldiData.upstreamBasin).toEqual([]);
                    done();
                });
            });
        });
    });
});