import {select} from 'd3-selection';

import {drawMonitoringLocationMarkerLegend, drawCircleMarkerLegend, drawFIMLegend} from './legend';


describe('monitoring-location/components/map/legend module', () => {
    let listContainer;

    beforeEach(() => {
        jasmine.Ajax.install();
        listContainer = select('body').append('div');
    });

    afterEach(() => {
        listContainer.remove();
        jasmine.Ajax.uninstall();
    });

    describe('drawMonitoringLocationMarkerLegend', () => {
        it('Draws an marker image', () => {
            drawMonitoringLocationMarkerLegend(listContainer);

            expect(listContainer.select('#site-legend-list').size()).toBe(1);
            expect(listContainer.select('img').size()).toBe(1);
        });
    });

    describe('drawCircleMarkerLegend', () => {
        it('Draws a circle marker legend', () => {
            drawCircleMarkerLegend(listContainer, 'red', 0.5, 'My circle marker');

            let circleSpan = listContainer.select('.fa-circle');
            expect(circleSpan.size()).toBe(1);
            expect(circleSpan.style('color')).toEqual('red');
            expect(circleSpan.style('opacity')).toEqual('0.5');
            expect(listContainer.select('span:nth-child(2)').text()).toEqual('My circle marker');
        });
    });

    describe('drawFIMLegend', () => {
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
            drawFIMLegend(listContainer, true);

            // Return the same response on all requests
            jasmine.Ajax.stubRequest(/(.*?)/).andReturn({
                status: 200,
                responseText: MOCK_RESP,
                contentType: 'application/json'
            });
        });

        it('drawFIMLegend with FIM available true fetches the three sets of legend info', () => {
            expect(jasmine.Ajax.requests.count()).toBe(3);
        });

        it('drawFIMLegend with FIM available add the FIM legend list to the control', () => {
            expect(listContainer.select('#fim-legend-list').size()).toBe(1);
        });

        it('Calling drawFIMLegend a second time with available set to false cause the fim legend list to be removed', () => {
            drawFIMLegend(listContainer, false);

            expect(listContainer.select('#fim-legend-list').size()).toBe(0);
        });
    });
});
