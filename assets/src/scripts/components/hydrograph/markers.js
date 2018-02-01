const { namespaces } = require('d3');
const { select } = require('d3-selection');


export function circleMarker({r, x, y, domId=null, domClass=null}) {
    let group = select(document.createElementNS(namespaces.svg, 'g'));
    let circle = group.append('circle')
        .attr('r', r)
        .attr('cx', x)
        .attr('cy', y);
    if (domId !== null) {
        circle.attr('id', domId);
    }
    if (domClass !== null) {
        circle.attr('class', domClass);
    }
    return circle;
}


export function lineMarker({x, y, length, domId=null, domClass=null}) {
    let group = select(document.createElementNS(namespaces.svg, 'g'));
    let line = group.append('line')
        .attr('x1', x)
        .attr('x2', x + length)
        .attr('y1', y)
        .attr('y2', y);
    if (domId !== null) {
        line.attr('id', domId);
    }
    if (domClass !== null) {
        line.attr('class', domClass);
    }
    return line;
}
