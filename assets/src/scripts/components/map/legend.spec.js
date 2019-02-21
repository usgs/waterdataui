import { select } from 'd3-selection';
import { map as createMap } from 'leaflet';

import { createLegendControl, createFIMLegend } from './legend';


describe('component/map/legend module', () => {
    let legendControl;
    let map;

    beforeEach(() => {
        jasmine.Ajax.install();
        select('body').append('div')
            .attr('id', 'map');
        map = createMap('map', {
            center: [43.0, -100.0],
            zoom: 5
        });
    });

    afterEach(() => {
        select('#map').remove();
        jasmine.Ajax.uninstall();
    });

    describe('createLegendControl', () => {
        let legendContainer, containerSelect;
        beforeEach(() => {
            legendControl = createLegendControl({});
            legendControl.addTo(map);

            legendContainer = legendControl.getContainer();
            containerSelect = select(legendContainer);
        });

        it('Creates the expected DOM elements', () => {
            expect(legendContainer).toBeDefined();
            expect(containerSelect.selectAll('.legend-expand').size()).toBe(1);
            expect(containerSelect.selectAll('.legend-list-container').size()).toBe(1);
            expect(containerSelect.select('#site-legend-list').size()).toBe(1);
        });

        it('The legend expand button is not visible and that the legend list is visible', () => {
            expect(containerSelect.selectAll('.legend-expand-container').attr('hidden')).toBeTruthy();
            expect(containerSelect.selectAll('.legend-list-container').attr('hidden')).toBeNull();
        });

        it('Clicking the expand button once hides the legend list', () => {
            let expandButton = containerSelect.select('.legend-expand');
            expandButton.dispatch('click');

            expect(containerSelect.selectAll('.legend-list-container').attr('hidden')).toBeTruthy();
            expect(expandButton.attr('title')).toContain('Show');
        });

        it('Clicking the expand button a second time shows the legend list', () => {
            let expandButton = containerSelect.select('.legend-expand');
            expandButton.dispatch('click');
            expandButton.dispatch('click');

            expect(containerSelect.selectAll('.legend-list-container').attr('hidden')).toBeNull();
            expect(expandButton.attr('title')).toContain('Hide');
        });
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
            legendControl = createLegendControl({});
            legendControl.addTo(map);

            createFIMLegend(legendControl, true);

            // Return the same responce on all requests
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
            expect(select(legendControl.getContainer()).select('.legend-expand-container').attr('hidden')).toBeNull();
        });

        it('createFIMLegend with FIM available add the FIM legend list to the control', () => {
            expect(select(legendControl.getContainer()).select('#fim-legend-list').size()).toBe(1);
        });

        it('Calling createFIMLegend a second time with available set to false cause the fim legend list to be removed', () => {
            createFIMLegend(legendControl, false);

            expect(select(legendControl.getContainer()).select('#fim-legend-list').size()).toBe(0);
        });
    });
});
