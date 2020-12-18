import sinon from 'sinon';

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

describe('network/store', () => {

    describe('asynchronous actions', () => {
        const NETWORK_CD = 'AHS';

        const TEST_STATE = {networkData: {
                networkMonitoringLocations: []
            }
        };

        describe('retrieveNetworkMonitoringLocations with good data', () => {
            let mockDispatch;
            let mockGetState;
            let fakeServer;

            beforeEach(() => {
                fakeServer = sinon.createFakeServer();

                mockDispatch = jest.fn();
                mockGetState = jest.fn(() => TEST_STATE);
                configureStore();
            });

            afterEach(() => {
                fakeServer.restore();
            });

            it('fetches the data and updates the redux store', () => {
                jest.spyOn(Actions, 'setNetworkMonitoringLocations').mockImplementation(() => {});
                let p = Actions.retrieveNetworkMonitoringLocations(NETWORK_CD)(mockDispatch, mockGetState);
                fakeServer.requests[0].respond(200, {'Content-Type': 'application/json'}, MOCK_NETWORK_FEATURE);

                return p.then(() => {
                    expect(mockDispatch.mock.calls).toHaveLength(1);
                    expect(Actions.setNetworkMonitoringLocations.mock.calls).toHaveLength(1);
                });
            });

            it('a failed fetch sets the save monitoring locations to the empty array', () => {
                jest.spyOn(Actions, 'setNetworkMonitoringLocations').mockImplementation(() => {});
                let p = Actions.retrieveNetworkMonitoringLocations(NETWORK_CD)(mockDispatch, mockGetState);
                fakeServer.requests[0].respond(500);
                return p.then(() => {
                    expect(mockDispatch.mock.calls).toHaveLength(1);
                    expect(Actions.setNetworkMonitoringLocations.mock.calls).toHaveLength(1);
                    expect(Actions.setNetworkMonitoringLocations).toHaveBeenCalledWith([]);
                });
            });
        });
    });
});
