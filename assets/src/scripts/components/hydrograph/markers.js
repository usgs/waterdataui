
const TEXT_X_OFFSET = 6;
const Y_OFFSET = -4;
const RECTANGLE_Y_OFFSET = -10;

const markerText = function(group, y, text) {
    if (text) {
        let groupBBox = group.node().getBBox();
        group.append('text')
            .attr('x', groupBBox.x + groupBBox.width + TEXT_X_OFFSET)
            .attr('y', y)
            .text(text);
    }
};

export const circleMarker = function(elem, {r, x, y, text=null, domId=null, domClass=null, fill=null}) {
    let group = elem.append('g');
    let circle = group.append('circle')
        .attr('r', r)
        .attr('cx', x)
        .attr('cy', y + Y_OFFSET);
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
    markerText(group, y, text);

    return group;
};


export const rectangleMarker = function(elem, {x, y, width, height, text=null, domId=null, domClass=null, fill=null}) {
    let group = elem.append('g');
    const rectangleY = y + RECTANGLE_Y_OFFSET;
    let rectangle = group.append('rect')
        .attr('x', x)
        .attr('y', rectangleY)
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
            .attr('y', rectangleY)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', fill);
    }
    markerText(group, y, text);

    return group;
};


export const lineMarker = function(elem, {x, y, length, text=null, domId=null, domClass=null}) {
    const group = elem.append('g');
    const lineY = y + Y_OFFSET;
    let line = group.append('line')
        .attr('x1', x)
        .attr('x2', x + length)
        .attr('y1', lineY)
        .attr('y2', lineY);
    if (domId) {
        line.attr('id', domId);
    }
    if (domClass) {
        line.attr('class', domClass);
    }

    markerText(group, y, text);
    return group;
};

export const textOnlyMarker = function(elem, {x, y, text, domId=null, domClass=null}) {
    const group = elem.append('g');
    let markerText = group.append('text')
        .text(text)
        .attr('x', x)
        .attr('y', y);
    if (domId) {
        markerText.attr('id', domId);
    }
    if (domClass) {
        markerText.attr('class', domClass);
    }
    return group;
};


export const defineLineMarker = function(domId=null, domClass=null, text=null) {
    return {
        type: lineMarker,
        domId: domId,
        domClass: domClass,
        text: text
    };
};

export const defineTextOnlyMarker = function(text, domId=null, domClass=null ) {
    return {
        type: textOnlyMarker,
        domId: domId,
        domClass: domClass,
        text: text
    };
};



export const defineRectangleMarker = function(domId=null, domClass=null, text=null, fill=null) {
    return {
        type: rectangleMarker,
        domId: domId,
        domClass: domClass,
        text: text,
        fill: fill
    };
};

export const defineCircleMarker = function(radius, domId=null, domClass=null, text=null, fill=null) {
    return {
        type: circleMarker,
        r: radius,
        domId: domId,
        domClass: domClass,
        text: text,
        fill: fill
    };
};

