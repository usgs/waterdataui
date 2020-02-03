import {wrap} from '../utils';

/*
 * Add X Axis to svg or group elem given the xAxis and layout
 * @param {Object} elem - svg or g D3 selection
 * @param {Object}
 *      @prop {Object} xAxis - D3 axis object
 *      @prop {Object} layout - contains properties for width, height, and margin for enclosing svg.
 */
export const appendXAxis = function(elem, {xAxis, layout}) {
    const xLoc = {
        x: 0,
        y: layout.height - (layout.margin.top + layout.margin.bottom)
    };
    elem.selectAll('.x-axis').remove();
    elem.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(${xLoc.x}, ${xLoc.y})`)
        .call(xAxis);
};

export const appendYAxis = function(elem, {yAxis, layout, yTitle}) {
    const yLoc = {x: 0, y: 0};
    const yLabelLoc = {
        x: layout.height / -2 + layout.margin.top,
        y: -1 * layout.margin.left + 12
    };

    // Remove existing axes before adding the new ones.
    elem.selectAll('.y-axis').remove();

    // Add y-axis and a text label
    elem.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${yLoc.x}, ${yLoc.y})`)
        .call(yAxis)
        .append('text')
            .attr('class', 'y-axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', yLabelLoc.x)
            .attr('y', yLabelLoc.y)
            .text(yTitle)
                .call(wrap, layout.height - (layout.margin.top + layout.margin.bottom));
};

export const appendSecondaryYAxis = function(elem, {yAxis, layout, yTitle}) {
//    const maxXScaleRange = xAxis.scale().range()[1];
    const secondaryYLabelLoc = {
        x: layout.height / -2 + layout.margin.top,
        y: (layout.width - layout.margin.right) * 1.5
//        y: (layout.width - maxXScaleRange) * 1.5
    };
    elem.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${layout.width - layout.margin.right}, 0)`)
        .call(yAxis)
        .append('text')
            .attr('class', 'y-axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', secondaryYLabelLoc.x )
            .attr('y', secondaryYLabelLoc.y )
            .text(yTitle)
                .call(wrap, layout.height - (layout.margin.top + layout.margin.bottom));
};

export const appendAxes = function(elem, {xAxis, yAxis, secondaryYaxis, layout, yTile, secondaryYtitle}) {
    elem.call(appendXAxis, xAxis, layout)
    app
};