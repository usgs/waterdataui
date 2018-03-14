const { select } = require('d3-selection');

const { attachToNode } = require('./embed');


describe('embed component', () => {
    beforeEach(() => {
        const elem = select('body')
            .append('div')
                .attr('id', 'component')
                .classed('wdfn-component', true)
                .attr('data-component', 'embed');
        attachToNode(null, elem.node());
    });

    afterEach(() => {
        select('#component').remove();
    });

    it('should prepend sharing icon', () => {
        expect(select('.fa-code').size()).toBe(1);
    });
});
