import {fetchNetworkSites} from './network-data';

describe('network-data module', () => {
    beforeEach(() => {
        jasmine.Ajax.install();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
    });

    describe('fetchNetworkSites', () => {
        const networkCd = 'AHS';

        describe('with valid response', () => {

            let upstreamSitePromise;

            beforeEach(() => {
                /* eslint no-use-before-define: 0 */

                upstreamSitePromise = fetchNetworkSites(networkCd );
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200,
                    responseText: MOCK_NETWORK_FEATURE,
                    contentType: 'application/json'
                });
            });

            it('expected response is json object with the network sites', () => {
                upstreamSitePromise.then((resp) => {
                    expect(resp.length).toBe(1);
                });
            });
        });

        describe('with error response', () => {
            it('On failed response return an empty feature list', () => {
                fetchNetworkSites(networkCd).then((resp) => {
                   expect(resp.length).toBe(0);
                });
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 500
                });
            });
        });
    });
});

const MOCK_NETWORK_FEATURE = `
{
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "id": "USGS-343048093030401",
        "geometry": {
            "type": "Point",
            "coordinates": [
            -93.0511417,
            34.513375]
            },
        "properties": {
            "agency": "U.S. Geological Survey",
            "monitoringLocationNumber": "343048093030401",
            "monitoringLocationName": "02S19W33CBD1 Hot Springs",
            "monitoringLocationType": "Well",
            "district": "Arkansas",
            "state": "Arkansas",
            "county": "Garland County",
            "country": "US",
            "monitoringLocationAltitudeLandSurface": "749",
            "altitudeMethod": "Interpolated from Digital Elevation Model",
            "altitudeAccuracy": "4.3",
            "altitudeDatum": "North American Vertical Datum of 1988",
            "nationalAquifer": "Other aquifers",
            "localAquifer": "Hot Springs Sandstone",
            "localAquiferType": "Unconfined single aquifer",
            "wellDepth": "336.5",
            "holeDepth": "336.5",
            "holeDepthSource": "L",
            "agencyCode": "USGS",
            "districtCode": "05",
            "stateFIPS": "US:05",
            "countyFIPS": "US:05:051",
            "countryFIPS": "US",
            "hydrologicUnit": "080401010804",
            "monitoringLocationUrl": "https://waterdata.usgs.gov/monitoring-location/343048093030401"
        },
        "links": [
            {
                "rel": "self",
                "type": "application/geo+json",
                "title": "This document as GeoJSON",
                "href": "https://labs.waterdata.usgs.gov/api/observations/collections/AHS/items/USGS-343048093030401?f=json"
            },
            {
            "rel": "collection",
            "type": "application/json",
            "title": "Arkansas Hot Springs National Park Network",
            "href": "https://labs.waterdata.usgs.gov/api/observations/collections/AHS?f=json"
        }]
    }]
}
`
;