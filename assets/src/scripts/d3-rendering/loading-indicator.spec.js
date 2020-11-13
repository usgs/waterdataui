import {select} from 'd3-selection';
import {drawLoadingIndicator} from 'd3render/loading-indicator';

describe('loading indicator', () => {
    let div;

    beforeEach(() => {
        let body = select('body');
        div = body.append('div');
    });

    afterEach(() => {
        div.remove();
    });

    it('loading indicator should be visible', () => {
        div.call(drawLoadingIndicator, {showLoadingIndicator: true, sizeClass: 'fa-3x'});
        // <i class="loading-indicator fas fa-3x fa-spin fa-spinner">
        expect(select('.loading-indicator').size()).toBe(1);
    });

    it('loading indicator should not be visible', () => {
        div.call(drawLoadingIndicator, {showLoadingIndicator: false, sizeClass: 'fa-3x'});
        expect(select('.loading-indicator').size()).toBe(0);
    });
});