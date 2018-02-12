
const createFocusLine = function(elem, id) {
    let focus = elem.append('g')
        .attr('id', id)
        .attr('class', 'focus')
        .style('display', 'none');
    focus.append('line')
        .attr('class', 'focus-line');
    return focus;
};

const createFocusCircle = function(elem, id) {
    let focus = elem.append('g')
        .attr('id', id)
        .attr('class', 'focus')
        .style('display', 'none')
    focus.append('circle')
        .attr('r', 5.5);
    return focus;
};

const createTooltipText = function(elem, id, tskeys) {
    let tooltipTextGroup = elem.append('g')
        .attr('id', id)
        .style('display', 'none');
    for (let tskey of tskeys) {
        tooltipTextGroup.append('text')
            .attr('class', `${tskey}-tooltip-text`);
    }
    return tooltipTextGroup;

};