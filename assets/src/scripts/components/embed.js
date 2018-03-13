const { select } = require('d3-selection');


/*
 * Attaches a copy-to-clipboard function to a child input[type=text] node.
 * @param {Object} store - Redux store
 * @param {Object} node - DOM element
 */
function attachToNode(store, node) {
    // Select all text in input when it gets focus
    const input = select(node).select('input');
    input.on('focus', function () {
        this.setSelectionRange(0, this.value.length);
    });

    // Prepend a font awesome icon to the beginning of the node
    select(node).insert('a', 'fieldset');
    select(node)
        .select('a')
        .append('i')
            .attr('class', 'fa fa-share');
}

module.exports = {attachToNode};
