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


class Circle {
    constructor({r, x, y, domId=null, domClass=null}) {
        this._r = r;
        this._cx = x;
        this._cy = y;
        this._domId = domId;
        this._domClass = domClass;
        this._group = select(document.createElementNS(namespaces.svg, 'g'));
    }

    detachedMarker() {
        let circle = this._group.append('circle')
            .attr('r', this._r)
            .attr('cx', this._cx)
            .attr('cy', this._cy);
        if (this._domId !== null) {
            circle.attr('id', this._domId);
        }
        if (this._domClass !== null) {
            circle.attr('class', this._domClass);
        }
        return circle;
    }
}

class Line {
    constructor({x, y, length, domId=null, domClass=null}) {
        this._x1Position = x;
        this._x2Position = x + length;
        this._y1Position = y;
        this._y2Position = y;
        this._domId = domId;
        this._domClass = domClass;
        this._group = select(document.createElementNS(namespaces.svg, 'g'));
    }

    detachedMarker() {
        let line = this._group.append('line')
            .attr(x1, this._x1Position)
            .attr(x2, this._x2Position)
            .attr(y1, this._y1Position)
            .attr(y2, this._y2Position);
        if (this._domId !== null) {
            line.attr('id', this._domId);
        }
        if (this._domClass !== null) {
            line.attr('class', this._domId);
        }
        return line;
    }
}