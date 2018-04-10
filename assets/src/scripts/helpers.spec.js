const { select } = require('d3-selection');

const { registerTooltips, unregisterTooltips } = require('./helpers');


describe('helpers module', () => {
    let tooltipItem, child, notATooltip, handler;

    beforeEach(() => {
        handler = registerTooltips();
        tooltipItem = select('body')
            .append('div')
            .classed('tooltip-item', true)
            .attr('id', 'tooltip');
        child = tooltipItem
            .append('div')
                .append('div').node();
        notATooltip = select('body')
            .append('div').node();
    });

    afterEach(() => {
        tooltipItem.remove();
        unregisterTooltips(handler);
    });

    it('sets show-tooltip class on child touchstart', () => {
        child.dispatchEvent(new window.Event('touchstart', {bubbles: true}));
        expect(tooltipItem.classed('show-tooltip')).toBe(true);
    });

    it('unsets show-tooltip class on second tooltip click', () => {
        child.dispatchEvent(new window.Event('touchstart', {bubbles: true}));
        child.dispatchEvent(new window.Event('touchstart', {bubbles: true}));
        expect(tooltipItem.classed('show-tooltip')).toBe(false);
    });

    it('unsets show-tooltip class on click outside tooltip', () => {
        child.dispatchEvent(new window.Event('touchstart', {bubbles: true}));
        notATooltip.dispatchEvent(new window.Event('touchstart', {bubbles: true}));
        expect(tooltipItem.classed('show-tooltip')).toBe(false);
    });

    it('does not set show-tooltip class on non-tooltip node', () => {
        notATooltip.dispatchEvent(new window.Event('touchstart', {bubbles: true}));
        expect(tooltipItem.classed('show-tooltip')).toBe(false);
    });
});
