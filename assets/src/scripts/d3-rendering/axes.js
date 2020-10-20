import {wrap} from 'ui/utils';

/*
 * The functions assume that the enclosing elem as been translated so that the {0, 0} is
 * the upper left of the hydrograph itself.
 */

/*
 * Add X Axis to svg or group elem given the xAxis and layout
 * @param {Object} elem - svg or g D3 selection
 * @param {Object}
 *      @prop {Object} xAxis - D3 axis object - assumed to be bottom oriented
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

/*
 * Add Y Axis to svg or group elem given the xAxis and layout
 * @param {Object} elem - svg or g D3 selection
 * @param {Object}
 *      @prop {Object} yAxis - D3 axis object - assumed to be left oriented
 *      @prop {Object} layout - contains properties for width, height, and margin for enclosing svg.
 *      @prop {String} yTitle - label for the y axis
 */
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

/*
 * Add secondary Y Axis to svg or group elem given the xAxis and layout
 * @param {Object} elem - svg or g D3 selection
 * @param {Object}
 *      @prop {Object} yAxis - D3 axis object - assumed to be right oriented
 *      @prop {Object} layout - contains properties for width, height, and margin for enclosing svg.
 *      @prop {String} yTitle - label for the y axis
 */
export const appendSecondaryYAxis = function(elem, {yAxis, layout, yTitle}) {
    const secondaryYLabelLoc = {
        x: layout.height / -2 + layout.margin.top,
        y: layout.margin.right + 12
    };
    elem.selectAll('.secondary-y-axis').remove();
    if (!yAxis) {
        return;
    }
    elem.append('g')
        .attr('class', 'secondary-y-axis')
        .attr('transform', `translate(${layout.width - layout.margin.right}, 0)`)
        .call(yAxis)
        .append('text')
            .attr('class', 'y-axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', secondaryYLabelLoc.x)
            .attr('y', secondaryYLabelLoc.y)
            .text(yTitle)
            .call(wrap, layout.height - (layout.margin.top + layout.margin.bottom));
};

/*
 * Convience function to append xaxis, yaxis, and secondaryYaxis (if define) to elem
 * @param {Object} elem - svg or g D3 selection
 * @param {Object}
 *      @prop {Object} xAxis - D3 axis object - assumed to be bottom oriented
 *      @prop {Object} yAxis - D3 axis object - assumed to be left oriented
 *      @prop {Object} secondaryYAxis - D3 axis object - assumed to be right oriented
 *      @prop {Object} layout - contains properties for width, height, and margin for enclosing svg.
 *      @prop {String} yTitle - label for the y axis
 *      @prop {String} secondaryYtitle - label for the secondary y axis.
 */
export const appendAxes = function(elem, {xAxis, yAxis, secondaryYAxis, layout, yTitle, secondaryYTitle}) {
    elem.call(appendXAxis, {xAxis, layout})
        .call(appendYAxis, {yAxis, layout, yTitle})
        .call(appendSecondaryYAxis, {
            yAxis: secondaryYAxis,
            layout: layout,
            yTitle: secondaryYTitle
        });
};