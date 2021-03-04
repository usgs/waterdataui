import {select} from 'd3-selection';

import * as utils from 'ui/utils';

import {showDataLoadingIndicator} from './data-loading-indicator';

describe('monitoring-location/components/hydrograph/data-loading-indicator', () => {
    utils.mediaQuery = jest.fn().mockReturnValue(true);

    let div;
    beforeEach(() => {
        div = select('body').append('div')
            .attr('id', 'hydrograph-loading-indicator-container');
    });

    afterEach(() => {
        div.remove();
    });

    it('Renders a visible loading indicator with transform appropriately set', () => {
        showDataLoadingIndicator(true, '100');
        expect(div.select('.loading-indicator').size()).toBe(1);
        expect(div.style('transform')).toEqual('translateY(50px)');
    });

    it('Removes a visible loading indicator when isVisible is false', () => {
        showDataLoadingIndicator(true, '100');
        showDataLoadingIndicator(false);
        expect(div.select('.loading-indicator').size()).toBe(0);
    });
});