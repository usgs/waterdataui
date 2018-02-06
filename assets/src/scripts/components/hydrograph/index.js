/**
 * Hydrograph charting module.
 */
const { bisector } = require('d3-array');
const { mouse, select } = require('d3-selection');
const { line } = require('d3-shape');
const { createSelector, createStructuredSelector } = require('reselect');

const { addSVGAccessibility, addSROnlyTable } = require('../../accessibility');
const { dispatch, link, provide } = require('../../lib/redux');

const { appendAxes, axesSelector } = require('./axes');
const { MARGIN, updateLayoutVariables } = require('./layout');
const { pointsSelector, validPointsSelector, isVisibleSelector } = require('./points');
const { xScaleSelector, yScaleSelector } = require('./scales');
const { Actions, configureStore } = require('./store');

let WIDTH;
let HEIGHT;
let ASPECT_RATIO_PERCENT;

// Function that returns the left bounding point for a given chart point.
const bisectDate = bisector(d => d.time).left;



const drawMessage = function (elem, message) {
    // Set up parent element and SVG
    elem.innerHTML = '';
    const alertBox = elem
        .append('div')
            .attr('class', 'usa-alert usa-alert-warning')
            .append('div')
                .attr('class', 'usa-alert-body');
    alertBox
        .append('h3')
            .attr('class', 'usa-alert-heading')
            .html('Hydrograph Alert');
    alertBox
        .append('p')
            .html(message);
};


const plotDataLine = function (elem, {visible, points, tsDataKey, xScale, yScale}) {
    const elemId = 'ts-' + tsDataKey;
    elem.selectAll(`#${elemId}`).remove();

    if (!visible) {
        return;
    }

    elem.datum(points)
        .append('path')
            .classed('line', true)
            .attr('id', elemId)
            .attr('d', line().x(d => xScale(d.time))
                             .y(d => yScale(d.value)));
};


const getNearestTime = function (data, time) {
    let index = bisectDate(data, time, 1);
    let datum;
    let d0 = data[index - 1];
    let d1 = data[index];

    if (d0 && d1) {
        datum = time - d0.time > d1.time - time ? d1 : d0;
    } else {
        datum = d0 || d1;
    }

    // Return the nearest data point and its index.
    return {
        datum,
        index: datum === d0 ? index - 1 : index
    };
};


const plotTooltips = function (elem, {xScale, yScale, data}) {
    // Create a node to hightlight the currently selected date/time.
    let focus = elem.append('g')
        .attr('class', 'focus')
        .style('display', 'none');
    focus.append('circle')
        .attr('r', 7.5);
    focus.append('text');

    elem.append('rect')
        .attr('class', 'overlay')
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .on('mouseover', () => focus.style('display', null))
        .on('mouseout', () => focus.style('display', 'none'))
        .on('mousemove', function () {
            // Get the nearest data point for the current mouse position.
            const time = xScale.invert(mouse(this)[0]);
            const {datum, index} = getNearestTime(data, time);
            if (!datum) {
                return;
            }

            // Move the focus node to this date/time.
            focus.attr('transform', `translate(${xScale(datum.time)}, ${yScale(datum.value)})`);

            // Draw text, anchored to the left or right, depending on
            // which side of the graph the point is on.
            const isFirstHalf = index < data.length / 2;
            focus.select('text')
                .text(() => datum.label)
                .attr('text-anchor', isFirstHalf ? 'start' : 'end')
                .attr('x', isFirstHalf ? 15 : -15)
                .attr('dy', isFirstHalf ? '.31em' : '-.31em');
        });
};


const plotMedianPoints = function (elem, {visible, xscale, yscale, medianStatsData}) {
    elem.select('#median-points').remove();

    if (!visible) {
        return;
    }

    const container = elem
        .append('g')
            .attr('id', 'median-points');

    container.selectAll('medianPoint')
        .data(medianStatsData)
        .enter()
        .append('circle')
            .attr('id', 'median-point')
            .attr('x', function(d) {
                return xscale(d.time);
            })
            .attr('y', function(d) {
                return yscale(d.value);
            })
            .attr('cx', function(d) {
                return xscale(d.time);
            })
            .attr('cy', function(d) {
                return yscale(d.value);
            });

    container.selectAll('medianPointText')
        .data(medianStatsData)
        .enter()
        .append('text')
            .text(function(d) {
                return d.label;
            })
            .attr('id', 'median-text')
            .attr('x', function(d) {
                return xscale(d.time) + 5;
            })
            .attr('y', function(d) {
                return yscale(d.value);
            });
};


const timeSeriesGraph = function (elem) {
    elem.append('div')
        .attr('class', 'hydrograph-container')
        .style('padding-bottom', ASPECT_RATIO_PERCENT)
        .append('svg')
            //.attr('preserveAspectRatio', 'xMinYMin meet')
            .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)
            .call(link(addSVGAccessibility, createStructuredSelector({
                title: state => state.title,
                description: state => state.desc,
                isInteractive: () => true
            })))
            .append('g')
                .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)
                .call(link(appendAxes, axesSelector))
                .call(link(plotDataLine, createStructuredSelector({
                    visible: isVisibleSelector('current'),
                    points: validPointsSelector('current'),
                    xScale: xScaleSelector('current'),
                    yScale: yScaleSelector,
                    tsDataKey: () => 'current'
                })))
                .call(link(plotDataLine, createStructuredSelector({
                    visible: isVisibleSelector('compare'),
                    points: validPointsSelector('compare'),
                    xScale: xScaleSelector('compare'),
                    yScale: yScaleSelector,
                    tsDataKey: () => 'compare'
                })))
                .call(link(plotTooltips, createStructuredSelector({
                    xScale: xScaleSelector('current'),
                    yScale: yScaleSelector,
                    data: pointsSelector('current')
                })))
                .call(link(plotMedianPoints, createStructuredSelector({
                    visible: isVisibleSelector('medianStatistics'),
                    xscale: xScaleSelector('current'),
                    yscale: yScaleSelector,
                    medianStatsData: pointsSelector('medianStatistics')
                })));
    elem.call(link(addSROnlyTable, createStructuredSelector({
        columnNames: createSelector(
            (state) => state.title,
            (title) => [title, 'Time']
        ),
        data: createSelector(
            pointsSelector('current'),
            points => points.map((value) => {
                return [value.value, value.time];
            })
        )
    })));
};


const attachToNode = function (node, {siteno} = {}) {
    if (!siteno) {
        select(node).call(drawMessage, 'No data is available.');
        return;
    }

    let store = configureStore();

    // Set layout variables
    let newLayout = updateLayoutVariables(node.offsetWidth);
    WIDTH = newLayout.width;
    HEIGHT = newLayout.height;
    ASPECT_RATIO_PERCENT = newLayout.aspect_ratio_percent;


    select(node)
        .call(provide(store))
        .call(timeSeriesGraph)
        .select('.hydrograph-last-year-input')
            .on('change', dispatch(function () {
                return Actions.toggleTimeseries('compare', this.checked);
            }));
    store.dispatch(Actions.retrieveTimeseries(siteno));
};


module.exports = {attachToNode, getNearestTime, timeSeriesGraph};
