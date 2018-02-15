const { select, namespaces } = require('d3-selection');


const circleMarker = function({r, x, y, domId=null, domClass=null, fill=null}) {
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
    if (fill !== null) {
        // Overlay another circle on top of the one above.
        // This approach is particularly salient if the fill
        // is an SVG pattern because there is not a way to
        // specify an SVG pattern with a background color.
        // The desired background color then comes from the
        // overlayed circle.
        group.append('circle')
            .attr('r', r)
            .attr('cx', x)
            .attr('cy', y)
            .attr('fill', fill);
    }

    return group;
};


const rectangleMarker = function({x, y, width, height, domId=null, domClass=null, fill=null}) {
    let group = select(document.createElementNS(namespaces.svg, 'g'));
    let rectangle = group.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', width)
        .attr('height', height);
    if (domId !== null) {
        rectangle.attr('id', domId);
    }
    if (domClass !== null) {
        rectangle.attr('class', domClass);
    }
    if (fill !== null) {
        // Overlay another rectangle on top of the one above.
        // This approach is particularly salient if the fill
        // is an SVG pattern because there is not a way to
        // specify an SVG pattern with a background color.
        // The desired background color then comes from the
        // overlayed rectangle.
        group.append('rect')
            .attr('x', x)
            .attr('y', y)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', fill);
    }
    return group;
};


const lineMarker = function({x, y, length, domId=null, domClass=null}) {
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
    return group;
};


const defineLineMarker = function(domId=null, domClass=null, text=null, groupId=null) {
    return {
        type: lineMarker,
        domId: domId,
        domClass: domClass,
        text: text,
        groupId: groupId
    };
};


const defineRectangleMarker = function(domId=null, domClass=null, text=null, groupId=null, fill=null) {
    return {
        type: rectangleMarker,
        domId: domId,
        domClass: domClass,
        text: text,
        groupId: groupId,
        fill: fill
    };
};

const defineCircleMarker = function(radius, domId=null, domClass=null, text=null, groupId=null, fill=null) {
    return {
        type: circleMarker,
        r: radius,
        domId: domId,
        domClass: domClass,
        groupId: groupId,
        text: text,
        fill: fill
    };
};


module.exports = {circleMarker, rectangleMarker, lineMarker,defineLineMarker, defineCircleMarker,
    defineRectangleMarker};
