import {select} from 'd3-selection';

import {attachToNode} from 'ml/components/embed';


describe('monitoring-location/components/embed module', () => {
    beforeEach(() => {
        const elem = select('body')
            .append('div')
                .attr('id', 'component')
                .classed('wdfn-component', true)
                .attr('data-component', 'embed');
        elem.append('input')
            .attr('type', 'text')
            .attr('value', 'my text');
        attachToNode(null, elem.node());
    });

    afterEach(() => {
        select('#component').remove();
    });

    it('should select all text on focus', () => {
        const node = select('input')
            .dispatch('focus')
            .node();
        const selection = node.value.substring(node.selectionStart, node.selectionEnd);
        expect(selection).toBe(node.value);
    });
});
