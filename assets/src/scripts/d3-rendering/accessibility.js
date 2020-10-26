/**
 * Adds accessibility a ttributes to the svg.
 * This was based on the recommendations in this article: https://www.w3.org/WAI/PF/HTML/wiki/Canvas
 * @param {Object} svg - Can be a selector string or d3 selection for an svg element
 * @param {String} title
 * @param {String} description
 * @param {Boolean} isInteractive
 * @param {String} idPrefix
 */
export const addSVGAccessibility = function(svg, {title, description, isInteractive, idPrefix}) {
    svg.selectAll('title, desc').remove();
    let descElement = svg.insert('desc', ':first-child')
        .html(description);
    descElement.attr('id', `${idPrefix}-desc`);
    let titleElement = svg.insert('title', ':first-child')
        .html(title);
    titleElement.attr('id', `${idPrefix}-title`);
    svg.attr('aria-labelledby', `${idPrefix}-title`);
    svg.attr('aria-describedby', `${idPrefix}-desc`);
    if (isInteractive) {
        svg.attr('tabindex', 0);
    }
};

/**
 * Appends a table for screen readers only containing the data. The number
 * of elements in columnNames should match the number of elements in each element
 * of the data array.
 * @param {String} container - Can be a selector string or d3 selection
 * @param {Array} columnNames - array of strings
 * @param {Array} data - array of array of strings representing the table rows
 * @param {String} describeById - Optional id string of the element that describes this table
 * @param {String} describeByText - Optional text that describes this table
 */
export const addSROnlyTable = function(container, {columnNames, data, describeById=null, describeByText=null}) {
    if (data.length > 0) {
        const table = container
            .append('table')
                .attr('class', 'usa-sr-only');

        if (describeById && describeByText) {
            table.attr('aria-describedby', describeById);
            container.append('div')
                .attr('id', describeById)
                .attr('class', 'usa-sr-only')
                .text(describeByText);
        }

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
};
