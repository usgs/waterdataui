/**
 *
 * @param {Node or String} svg - if string should select an svg
 * @param {String} title
 * @param {String} description
 * @param {Boolean} isInteractive
 */
function addAccessibility({svg, title, description, isInteractive}) {
    svg.attr('title', title)
        .attr('desc', description)
        .attr('aria-labelledby', 'title desc');
    if (isInteractive) {
        svg.attr('tabindex', 0);
    }
}

//function addSROnlyTable({selector, columnNames, data})


module.exports = {addAccessibility};

