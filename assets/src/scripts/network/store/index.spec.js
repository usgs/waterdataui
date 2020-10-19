import config from 'ui/config';

import {Actions, configureStore} from './index';

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

describe('Network Redux store', () => {

    describe('asynchronous actions', () => {
        const NETWORK_CD = 'AHS';

        const TEST_STATE = {networkData: {
                networkSites: []
            }
        };

        describe('retrieveNetworkSites with good data', () => {
            let mockDispatch;
            let mockGetState;

            beforeEach(() => {
                jasmine.Ajax.install();

                jasmine.Ajax.stubRequest(`${config.NETWORK_ENDPOINT}/${NETWORK_CD}/items`).andReturn({
                    status: 200,
                    response: MOCK_NETWORK_FEATURE,
                    contentType: 'application/json'
                });

                mockDispatch = jasmine.createSpy('mockDispatch');
                mockGetState = jasmine.createSpy('mockGetState').and.returnValue(TEST_STATE);
                configureStore();
            });

            afterEach(() => {
                jasmine.Ajax.uninstall();
            });

            it('fetches data from NWIS reference networks', () => {
                Actions.retrieveNetworkData(NETWORK_CD)(mockDispatch,mockGetState);
                console.log('Request url is ' + jasmine.Ajax.requests.mostRecent().url);
                expect(jasmine.Ajax.requests.mostRecent().url).toContain('items');
            });

            it('gets the data and sets the network redux store', (done) => {
                spyOn(Actions, 'setNetworkFeatures');
                let p = Actions.retrieveNetworkData(NETWORK_CD)(mockDispatch,mockGetState);
                p.then(() => {
                    expect(mockDispatch.calls.count()).toBe(1);
                    expect(Actions.setNetworkFeatures.calls.count()).toBe(1);
                    done();
                });
            });
        });

        describe('retrieveNetworkSites with bad data', () => {
            let mockDispatch;
            let mockGetState;

            beforeEach(() => {
                jasmine.Ajax.install();

                jasmine.Ajax.stubRequest(`${config.NETWORK_ENDPOINT}/${NETWORK_CD}/items`).andReturn({
                    status: 500
                });

                mockDispatch = jasmine.createSpy('mockDispatch');
                mockGetState = jasmine.createSpy('mockGetState').and.returnValue(TEST_STATE);
                configureStore();
            });

            afterEach(() => {
                jasmine.Ajax.uninstall();
            });

            it('gets the data and sets the network redux store', (done) => {
                spyOn(Actions, 'setNetworkFeatures');
                let p = Actions.retrieveNetworkData(NETWORK_CD)(mockDispatch,mockGetState);
                p.then(() => {
                    expect(mockDispatch.calls.count()).toBe(1);
                    expect(Actions.setNetworkFeatures.calls.count()).toBe(1);
                    expect(Actions.setNetworkFeatures).toHaveBeenCalledWith([]);
                    done();
                });
            });
        });
    });
});



