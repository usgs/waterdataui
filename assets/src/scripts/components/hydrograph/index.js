/**
 * Hydrograph charting module.
 */
const { bisector } = require('d3-array');
const { reduxConnect: connect, reduxDispatch: dispatch,
        reduxFromState: fromState, reduxProvide: provide } = require('d3-redux');
const { mouse, select } = require('d3-selection');
const { line } = require('d3-shape');

const { addSVGAccessibility, addSROnlyTable } = require('../../accessibility');

const { plotAxes } = require('./axes');
const { WIDTH, HEIGHT, ASPECT_RATIO_PERCENT, MARGIN } = require('./layout');
const { pointsSelector, validPointsSelector, isVisibleSelector } = require('./points');
const { xScaleSelector, yScaleSelector } = require('./scales');
const { Actions, configureStore } = require('./store');


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


const plotDataLine = function (elem, store, tsDataKey) {
    const elemId = 'ts-' + tsDataKey;
    elem.selectAll(`#${elemId}`).remove();

    const state = store.getState();
    if (!isVisibleSelector(state, tsDataKey)) {
        return;
    }

    elem.datum(fromState(state => validPointsSelector(state, tsDataKey)))
        .append('path')
            .classed('line', true)
            .attr('id', elemId)
            .attr('d', line().x(d => d.x)
                             .y(d => d.y));
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


const plotTooltips = function (elem, store, tsDataKey) {
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
            const state = store.getState();
            const xScale = xScaleSelector(state, tsDataKey);
            const yScale = yScaleSelector(state, tsDataKey);
            const data = pointsSelector(state, tsDataKey);

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


const plotMedianPoints = function (elem, store) {
    const state = store.getState();
    const xscale = xScaleSelector(state);
    const yscale = yScaleSelector(state);
    const medianStatsData = pointsSelector(state, 'medianStatistics');

    elem.select('#median-points').remove();

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


const timeSeriesGraph = function (elem, store) {
    elem.append('div')
        .attr('class', 'hydrograph-container')
        .style('padding-bottom', ASPECT_RATIO_PERCENT)
        .append('svg')
            .attr('preserveAspectRatio', 'xMinYMin meet')
            .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)
            .call(connect(function (elem) {
                let state = store.getState();
                elem.call(addSVGAccessibility, {
                    title: state.title,
                    description: state.desc,
                    isInteractive: true
                });
            }))
            .append('g')
                .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)
                .call(connect(plotAxes), store)
                .call(connect(plotDataLine), store, 'current')
                .call(connect(plotDataLine), store, 'compare')
                //.call(plotTooltips, store, 'compare')
                .call(plotTooltips, store, 'current')
                .call(connect(plotMedianPoints), store);
    elem.call(connect(function (elem) {
        const state = store.getState();
        elem.call(addSROnlyTable, {
            columnNames: [state.title, 'Time'],
            data: pointsSelector(state, 'current').map((value) => {
                return [value.value, value.time];
            })
        });
    }));
};


const attachToNode = function (node, {siteno} = {}) {
    if (!siteno) {
        select(node).call(drawMessage, 'No data is available.');
        return;
    }

    let store = configureStore();

    select(node)
        .call(provide(store))
        .call(timeSeriesGraph, store)
        .select('.hydrograph-last-year-input')
            .on('change', dispatch(function () {
                return Actions.toggleTimeseries('compare', this.checked);
            }));
    store.dispatch(Actions.retrieveTimeseries(siteno));
};


module.exports = {attachToNode, getNearestTime, timeSeriesGraph};
