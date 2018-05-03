
/*
 * Function that appends a tooltip widget to elem with the supplied text. The
 * function creates an info icon and a span containing the tooltip text. This
 * should be paired with the style sheet to show/hide the tooltip text.
 * @param {Object} elem - D3 selection to append the tooltip
 * @param {Function or String} text - will be used as the parameter for the d3 .text() function.
 */
export const appendTooltip = function(elem, text) {
    let tooltip = elem.append('div')
        .attr('class', 'tooltip-item');
    tooltip.append('span')
        .append('i')
            .attr('class', 'fas fa-info-circle');
    tooltip.append('div')
        .attr('class', 'tooltip')
        .append('p')
            .text(text);
};
