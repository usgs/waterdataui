import { fetchNldiUpstreamSites, fetchNldiUpstreamFlow, fetchNldiDownstreamSites, fetchNldiDownstreamFlow,
         fetchNldiUpstreamBasin} from './nldi-data';

describe('nldi-data module', () => {
    beforeEach(() => {
        jasmine.Ajax.install();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
    });

    describe('fetchNldiUpstreamSites', () => {
        const siteno = '12345678';

        describe('with valid response', () => {

            let upstreamSitePromise;

            beforeEach(() => {
                /* eslint no-use-before-define: 0 */

                upstreamSitePromise = fetchNldiUpstreamSites(siteno);
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200,
                    responseText: MOCK_NLDI_UPSTREAM_SITES_FEATURE,
                    contentType: 'application/json'
                });
            });

            it('expected response is json object with the upstream sites', () => {
                upstreamSitePromise.then((resp) => {
                    expect(resp.length).toBe(2);
                    expect(resp[0].properties.comid).toBe('10286212');
                    expect(resp[1].properties.comid).toBe('10288896');
                });
            });
        });

        describe('with error response', () => {
            it('On failed response return an empty feature list', () => {
                fetchNldiUpstreamSites(siteno).then((resp) => {
                   expect(resp.length).toBe(0);
                });
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 500
                });
            });
        });
    });

    describe('fetchNldiDownstreamSites', () => {
        const siteno = '12345678';

        describe('with valid response', () => {

            let downstreamSitePromise;

            beforeEach(() => {
                /* eslint no-use-before-define: 0 */

                downstreamSitePromise = fetchNldiDownstreamSites(siteno);
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200,
                    responseText: MOCK_NLDI_DOWNSTREAM_SITES_FEATURE,
                    contentType: 'application/json'
                });
            });

            it('expected response is json object with the downstream sites', () => {
                downstreamSitePromise.then((resp) => {
                    expect(resp.length).toBe(2);
                    expect(resp[0].properties.comid).toBe('18508614');
                    expect(resp[1].properties.comid).toBe('18508640');
                });
            });
        });

        describe('with error response', () => {
            it('On failed response return an empty feature list', () => {
                fetchNldiDownstreamSites(siteno).then((resp) => {
                   expect(resp.length).toBe(0);
                });
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 500
                });
            });
        });
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

const MOCK_NLDI_UPSTREAM_FLOW_FEATURE = `
{
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [-87.4336489066482, 39.4954827949405],
                [-87.4337763041258, 39.4952046945691]
            ]
        },
        "properties": {
            "nhdplus_comid": "10286212"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [-87.4476554021239, 39.4393114000559],
                [-87.4480373039842, 39.4390688985586]
            ]
        },
        "properties": {
            "nhdplus_comid": "10286442"
        }
    }]
}
`;

const MOCK_NLDI_UPSTREAM_SITES_FEATURE = `
{
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
        "type": "Point",
        "coordinates": [-87.4195, 39.465722]
    },
    "properties": {
        "source": "nwissite",
        "sourceName": "NWIS Sites",
        "identifier": "USGS-03341500",
        "name": "WABASH RIVER AT TERRE HAUTE, IN",
        "uri": "https://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=03341500",
        "comid": "10286212",
        "navigation": "https://labs.waterdata.usgs.gov/api/nldi/linked-data/nwissite/USGS-03341500/navigate"
    }
}, {
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [-87.568634, 39.02032]
    },
    "properties": {
        "source": "nwissite",
        "sourceName": "NWIS Sites",
        "identifier": "USGS-03342000",
        "name": "WABASH RIVER AT RIVERTON, IN",
        "uri": "https://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=03342000",
        "comid": "10288896",
        "navigation": "https://labs.waterdata.usgs.gov/api/nldi/linked-data/nwissite/USGS-03342000/navigate"
    }
}]
}
`;

const MOCK_NLDI_DOWNSTREAM_FLOW_FEATURE = `
{
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [-87.4336489066483, 39.4954827949406],
                [-87.4337763041259, 39.4952046945692]
            ]
        },
        "properties": {
            "nhdplus_comid": "10286213"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [-87.4476554021240, 39.4393114000560],
                [-87.4480373039843, 39.4390688985587]
            ]
        },
        "properties": {
            "nhdplus_comid": "10286443"
        }
    }]
}
`;

const MOCK_NLDI_DOWNSTREAM_SITES_FEATURE = `
{
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
        "type": "Point",
        "coordinates": [-85.489778, 40.85325]
    },
    "properties": {
        "source": "nwissite",
        "sourceName": "NWIS Sites",
        "identifier": "USGS-03323500",
        "name": "WABASH RIVER AT HUNTINGTON, IN",
        "uri": "https://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=03323500",
        "comid": "18508614",
        "navigation": "https://labs.waterdata.usgs.gov/api/nldi/linked-data/nwissite/USGS-03323500/navigate"
    }
}, {
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [-85.820263, 40.790877]
    },
    "properties": {
        "source": "nwissite",
        "sourceName": "NWIS Sites",
        "identifier": "USGS-03325000",
        "name": "WABASH RIVER AT WABASH, IN",
        "uri": "https://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=03325000",
        "comid": "18508640",
        "navigation": "https://labs.waterdata.usgs.gov/api/nldi/linked-data/nwissite/USGS-03325000/navigate"
    }
}]
}
`;

const MOCK_NLDI_UPSTREAM_BASIN_FEATURE = `
{
    "type":"FeatureCollection",
    "features":[{
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[-105.996400477, 36.1905362630001],
                [-105.994985767, 36.20007602],
                [-105.997781253, 36.2060425510001],
                [-105.995979878, 36.2080856000001]]
        },
        "properties": {}
        }]
}
`;