const { select } = require('d3-selection');

/**
 * Adds accessibility attributes to the svg.
 * This was based on the recommendations in this article: https://www.w3.org/WAI/PF/HTML/wiki/Canvas
 * @param {Object} svg - Can be a selector string or d3 selection for an svg element
 * @param {String} title
 * @param {String} description
 * @param {Boolean} isInteractive
 */
function addSVGAccessibility({svg, title, description, isInteractive}) {
    svg.attr('title', title)
        .attr('desc', description)
        .attr('aria-labelledby', 'title desc');
    if (isInteractive) {
        svg.attr('tabindex', 0);
    }
}

/**
 * Appends a table for screen readers only containing the data. The number
 * of elements in columnNames should match the number of elements in each element
 * of the data array.
 * @param {String} container - Can be a selector string or d3 selection
 * @param {Array} columnNames - array of strings
 * @param {Array} data - array of array of strings
 */
function addSROnlyTable({container, columnNames, data}) {
    const table = select(container)
        .append('table')
        .attr('class', 'usa-sr-only');

    table.append('thead')
        .append('tr')
        .selectAll('th')
        .data(columnNames)
        .enter().append('th')
            .attr('scope', 'col')
            .text(function(d) {
                return d;
            });

    const data_rows = table.append('tbody')
        .selectAll('tr')
        .data(data)
        .enter().append('tr');

    data_rows.selectAll('td')
        .data(function(d) {
            return d;
        })
        .enter().append('td')
            .text(function(d) {
                return d;
            });

}

module.exports = {addSVGAccessibility, addSROnlyTable};

