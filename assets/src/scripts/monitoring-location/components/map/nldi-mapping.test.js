import {select} from 'd3-selection';
import sinon from 'sinon';

import {drawNldiLegend} from './nldi-mapping';

describe('monitoring-location/components/map/nldi-mapping', () => {
    let listContainer;
    let fakeServer;
    beforeEach(() => {
        fakeServer = sinon.createFakeServer();
        listContainer = select('body').append('div');
    });

    afterEach(() => {
        listContainer.remove();
        fakeServer.restore();
    });

    describe('drawNldiLegend', () => {
        beforeEach(() => {
            drawNldiLegend(listContainer, true);
        });
        it('drawNldiLegend with NLDI available add the NLDI legend list to the container', () => {
            expect(listContainer.select('#nldi-legend-list').size()).toBe(1);
        });

        it('Calling drawNldiLegend a second time with available set to false cause the NLDI legend list to be removed', () => {
            drawNldiLegend(listContainer, false);
            expect(listContainer.select('#nldi-legend-list').size()).toBe(0);
        });
    });
});