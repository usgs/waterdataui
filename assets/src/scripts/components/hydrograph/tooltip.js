
const createFocusLine = function(elem, id) {
    let focus = elem.append('g')
        .attr('id', id)
        .attr('class', 'focus')
        .style('display', 'none')
    focus.append('line')
        .attr('class', 'focus-line');
    return focus;
};