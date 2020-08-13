/*
 * Function that appends a tooltip widget to elem with the supplied text. The
 * function creates a USWDS tooltip with an info-circle icon, then initializes
 * it with the USWDS components.tooltip.init().
 * @param {Object} elem - D3 selection to append the tooltip
 * @param {Function or String} text - will be used as the parameter for the d3 .text() function.
 */

// Required to initialize USWDS components after page load
import components from '../../node_modules/uswds/src/js/components';

export const appendTooltip = function(elem, text) {
	let tooltip = elem.append('div')
        .attr('class', 'usa-tooltip')
        .attr('data-position', 'right')
        .attr('title', text);
    tooltip.append('i')
        .attr('class', 'fas fa-info-circle');

    // Initialize USWDS tooltip after page load
    components.tooltip.init();
};
