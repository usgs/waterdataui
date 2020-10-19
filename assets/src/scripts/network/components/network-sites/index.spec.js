import {select} from 'd3-selection';

import {configureStore, Actions} from 'network/store';

import {attachToNode} from 'network/components/network-sites/index';

describe('network map module', () => {
    let componentNode;
    let store;
    let container;
    beforeEach(() => {
        jasmine.Ajax.install();
        container = select('body')
            .append('div')
            .attr('id', 'network-component');
        container.append('div').attr('id', 'network-map');
        componentNode = document.getElementById('network-component');
        let tableDiv = container
            .append('div')
                .attr('id', 'link-list');
        tableDiv.append('ul')
            .attr('class', 'pagination');
        tableDiv
            .append('table')
            .append('tbody')
            .attr('class', 'list');
    });

    afterEach(() => {
        container.remove();
        jasmine.Ajax.uninstall();
    });


    describe('Map creation without Network maps', () => {
        beforeEach(() => {
            store = configureStore();
            spyOn(Actions, 'retrieveNetworkData').and.returnValue(function () {
                return Promise.resolve({});
            });
            attachToNode(store, componentNode, {
                networkcd: 'AHS',
                extent: '[-93.078075, 34.513375, -92.986325, 34.588425]'
            });


        });

        it('Should create a leaflet map within the mapNode with', () => {
            expect(select(componentNode).selectAll('.leaflet-container').size()).toBe(1);
        });

        it('Should create a legend control', () => {
            expect(select(componentNode).selectAll('.legend').size()).toBe(1);
        });

        it('Should not create an overlay layer', (done) => {
            window.requestAnimationFrame(() => {
                expect(select(componentNode).selectAll('.leaflet-overlay-pane img').size()).toBe(0);
                done();
            });
        });

        it('Should not create Network Legend', (done) => {
            window.requestAnimationFrame(() => {
                expect(select(componentNode).select('#network-legend-list').size()).toBe(0);
                done();
            });
        });

        it('should not create any rows in the table', (done) => {
            window.requestAnimationFrame(() => {
                expect(select(componentNode).selectAll('tbody tr').size()).toBe(0);
                done();
            });
        });
    });

    describe('Map network information', () => {
        beforeEach(() => {
            store = configureStore({
                networkData: {
                    networkSites: [{
                        type: 'Feature',
                        id: 'USGS-343048093030401',
                        geometry: {
                            type: 'Point',
                            coordinates: [
                                -93.0511417,
                                34.513375
                            ]
                        },
                        properties: {
                            agency: 'U.S. Geological Survey',
                            monitoringLocationNumber: '343048093030401',
                            monitoringLocationName: '02S19W33CBD1 Hot Springs',
                            monitoringLocationType: 'Well',
                            district: 'Arkansas',
                            state: 'Arkansas',
                            county: 'Garland County',
                            country: 'US',
                            monitoringLocationAltitudeLandSurface: '749',
                            altitudeMethod: 'Interpolated from Digital Elevation Model',
                            altitudeAccuracy: '4.3',
                            altitudeDatum: 'North American Vertical Datum of 1988',
                            nationalAquifer: 'Other aquifers',
                            localAquifer: 'Hot Springs Sandstone',
                            localAquiferType: 'Unconfined single aquifer',
                            wellDepth: '336.5',
                            holeDepth: '336.5',
                            holeDepthSource: 'L',
                            agencyCode: 'USGS',
                            districtCode: '05',
                            stateFIPS: 'US:05',
                            countyFIPS: 'US:05:051',
                            countryFIPS: 'US',
                            hydrologicUnit: '080401010804',
                            monitoringLocationUrl: 'https://waterdata.usgs.gov/monitoring-location/343048093030401'
                        },
                        links: [
                            {
                                rel: 'self',
                                type: 'application/geo+json',
                                title: 'This document as GeoJSON',
                                href: 'https://labs.waterdata.usgs.gov/api/observations/collections/AHS/items/USGS-343048093030401?f=json'
                            },
                            {
                                rel: 'collection',
                                type: 'application/json',
                                title: 'Arkansas Hot Springs National Park Network',
                                href: 'https://labs.waterdata.usgs.gov/api/observations/collections/AHS?f=json'
                            }
                        ]
                    }
                    ]
                }
            });
            spyOn(Actions, 'retrieveNetworkData').and.returnValue(function () {
                return Promise.resolve({});
            });
            attachToNode(store, componentNode, {
                networkcd: 'AHS',
                extent: '[-93.078075, 34.513375, -92.986325, 34.588425]'
            });
        });

        it('Should create Network layers', (done) => {
            window.requestAnimationFrame(() => {
                expect(select(componentNode).selectAll('.leaflet-overlay-pane svg g').size()).toBe(1);
                done();
            });
        });

        it('Should create a Network Legend', (done) => {
            window.requestAnimationFrame(() => {
                expect(select(componentNode).select('#network-legend-list').size()).toBe(1);
                done();
            });
        });

        it('Should create rows in the data table', (done) => {
            window.requestAnimationFrame(() => {
                expect(select(componentNode).selectAll('tbody tr').size()).toBe(1);
                done();
            });
        });
    });
});
