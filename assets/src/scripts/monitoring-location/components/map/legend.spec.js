import {select} from 'd3-selection';

import {legendControl} from 'ui/leaflet-rendering/legend-control';
import {createFIMLegend, createNldiLegend} from 'map/legend';


describe('monitoring-location/components/map/legend module', () => {
    let mlLegendControl;
    let map;

    beforeEach(() => {
        jasmine.Ajax.install();
        select('body').append('div')
            .attr('id', 'map');
        map = L.map('map', {
            center: [43.0, -100.0],
            zoom: 5
        });
    });

    afterEach(() => {
        select('#map').remove();
        jasmine.Ajax.uninstall();
    });

    describe('createFIMLegend', () => {
        const MOCK_RESP =
            `{"layers": [{
                "layerId":0,
                "layerName":".",
                "layerType":"Feature Layer",
                "minScale":0,
                "maxScale":0,
                "legend":[{
                    "label":"",
                    "url":"a1a90aac95d70de618d5bba56c4e03e9",
                    "imageData":"fakeData",
                    "contentType":"image/png",
                    "height":20,
                    "width":20}]
                 }, {
                "layerId":1,
                "layerName":"Real name",
                "layerType":"Feature Layer",
                "minScale":0,
                "maxScale":0,
                "legend":[{
                    "label":"",
                    "url":"a1a90aac95d70de618d5bba56c4e03e9",
                    "imageData":"fakeData2",
                    "contentType":"image/png",
                    "height":20,
                    "width":20}]}
                    ]}`;

        beforeEach(() => {
            mlLegendControl = legendControl();
            mlLegendControl.addTo(map);

            createFIMLegend(mlLegendControl, true);

            // Return the same response on all requests
            jasmine.Ajax.stubRequest(/(.*?)/).andReturn({
                status: 200,
                responseText: MOCK_RESP,
                contentType: 'application/json'
            });
        });

        it('createFIMLegend with FIM available true fetches the three sets of legend info', () => {
            expect(jasmine.Ajax.requests.count()).toBe(3);
        });

        it('createFIMLegend with FIM available true makes the expand button visible', () =>  {
            expect(select(mlLegendControl.getContainer()).select('.legend-expand-container').attr('hidden')).toBeNull();
        });

        it('createFIMLegend with FIM available add the FIM legend list to the control', () => {
            expect(select(mlLegendControl.getContainer()).select('#fim-legend-list').size()).toBe(1);
        });

        it('Calling createFIMLegend a second time with available set to false cause the fim legend list to be removed', () => {
            createFIMLegend(mlLegendControl, false);

            expect(select(mlLegendControl.getContainer()).select('#fim-legend-list').size()).toBe(0);
        });
    });

    describe('createNldiLegend', () => {
        beforeEach(() => {
            mlLegendControl = legendControl();
            mlLegendControl.addTo(map);

            createNldiLegend(mlLegendControl, true);
        });

        it('createNldiLegend with NLDI available true makes the expand button visible', () =>  {
            expect(select(mlLegendControl.getContainer()).select('.legend-expand-container').attr('hidden')).toBeNull();
        });

        it('createNldiLegend with NLDI available add the NLDI legend list to the control', () => {
            expect(select(mlLegendControl.getContainer()).select('#nldi-legend-list').size()).toBe(1);
        });

        it('Calling createNldiLegend a second time with available set to false cause the NLDI legend list to be removed', () => {
            createNldiLegend(mlLegendControl, false);
            expect(select(mlLegendControl.getContainer()).select('#nldi-legend-list').size()).toBe(0);
        });
    });
});
