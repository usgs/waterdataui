import {select} from 'd3-selection';


/*
 * Attaches a copy-to-clipboard function to a child input[type=text] node.
 * @param {Object} store - Redux store
 * @param {Object} node - DOM element
 */
export const attachToNode = function(store, node) {
    // Select all text in input when it gets focus
    const input = select(node).select('input');
    input.on('focus', function() {
        this.setSelectionRange(0, this.value.length);
    });
};
