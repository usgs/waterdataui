import {select} from 'd3-selection';

import {createLegendControl, createNetworkSitesLegend} from './legend';


describe('component/map/legend module', () => {
    let legendControl;
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



    describe('createNetworkSitesLegend', () => {
        beforeEach(() => {
            legendControl = createLegendControl({});
            legendControl.addTo(map);

            createNetworkSitesLegend(legendControl, true);
        });

        it('createNetworkLegend with Network available true makes the expand button visible', () =>  {
            expect(select(legendControl.getContainer()).select('.legend-expand-container').attr('hidden')).toBeNull();
        });

        it('createNetworkLegend with Network available add the Network legend list to the control', () => {
            expect(select(legendControl.getContainer()).select('#network-legend-list').size()).toBe(1);
        });

        it('Calling createNetworkLegend a second time with available set to false cause the Network legend list to be removed', () => {
            createNetworkSitesLegend(legendControl, false);
            expect(select(legendControl.getContainer()).select('#network-legend-list').size()).toBe(0);
        });
    });
});
