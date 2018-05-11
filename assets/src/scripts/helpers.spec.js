const { select } = require('d3-selection');

const { registerTooltips, unregisterTooltips } = require('./helpers');


/**
 * Cross-browser helper for creating events
 * @param  {String}  eventType
 * @param  {Boolean} bubbles
 * @param  {Boolean} cancelable
 * @return {Event}
 */
const createEvent = function (eventType, bubbles = true, cancelable = false) {
    // Standard method
    if (typeof window.Event === 'function') {
        return new window.Event(eventType, {bubbles, cancelable});

    // For Internet Explorer
    } else {
        const event = document.createEvent('Event');
        event.initEvent(eventType, bubbles, cancelable);
        return event;
    }
};


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
        child.dispatchEvent(createEvent('touchstart'));
        expect(tooltipItem.classed('show-tooltip')).toBe(true);
    });

    it('unsets show-tooltip class on second tooltip click', () => {
        child.dispatchEvent(createEvent('touchstart'));
        child.dispatchEvent(createEvent('touchstart'));
        expect(tooltipItem.classed('show-tooltip')).toBe(false);
    });

    it('unsets show-tooltip class on click outside tooltip', () => {
        child.dispatchEvent(createEvent('touchstart'));
        notATooltip.dispatchEvent(createEvent('touchstart'));
        expect(tooltipItem.classed('show-tooltip')).toBe(false);
    });

    it('does not set show-tooltip class on non-tooltip node', () => {
        notATooltip.dispatchEvent(createEvent('touchstart'));
        expect(tooltipItem.classed('show-tooltip')).toBe(false);
    });
});
