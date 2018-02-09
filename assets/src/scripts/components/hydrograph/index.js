/**
 * Hydrograph charting module.
 */
const { bisector, max } = require('d3-array');
const { mouse, select } = require('d3-selection');
const { line } = require('d3-shape');
const { createSelector, createStructuredSelector } = require('reselect');

const { addSVGAccessibility, addSROnlyTable } = require('../../accessibility');
const { dispatch, link, provide } = require('../../lib/redux');

const { appendAxes, axesSelector } = require('./axes');
const { ASPECT_RATIO_PERCENT, MARGIN, CIRCLE_RADIUS, layoutSelector } = require('./layout');
const { pointsSelector, lineSegmentsSelector, isVisibleSelector } = require('./points');
const { xScaleSelector, yScaleSelector } = require('./scales');
const { Actions, configureStore } = require('./store');
const { drawSimpleLegend, legendDisplaySelector, createLegendMarkers } = require('./legend');


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


const plotDataLine = function (elem, {visible, lines, tsDataKey, xScale, yScale}) {
    const elemId = 'ts-' + tsDataKey;
    elem.selectAll(`#${elemId}`).remove();

    if (!visible) {
        return;
    }

    const tsLine = line()
        .x(d => xScale(new Date(d.time)))
        .y(d => yScale(d.value));

    for (let line of lines) {
        elem.append('path')
            .datum(line.points)
            .classed('line', true)
            .classed('approved', line.classes.approved)
            .classed('estimated', line.classes.estimated)
            .attr('data-title', tsDataKey)
            .attr('id', `ts-${tsDataKey}`)
            .attr('d', tsLine);
    }
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


const plotTooltips = function (elem, {xScale, yScale, data, isCompareVisible, compareXScale, compareData}) {
    // Create a node to highlight the currently selected date/time.
    elem.selectAll('.focus').remove();
    elem.select('.overlay').remove();
    elem.select('.tooltip-group').remove();
    let focus = elem.append('g')
        .attr('class', 'focus')
        .style('display', 'none');
    let tooltipLine = focus.append('line')
        .attr('class', 'tooltip-focus-line');

    let currentFocus = elem.append('g')
        .attr('class', 'focus')
        .style('display', 'none');
    currentFocus.append('circle')
        .attr('r', 5.5);

    let compareFocus = elem.append('g')
        .attr('class', 'focus')
        .style('display', 'none');
    compareFocus.append('circle')
        .attr('r', 5.5);

    let tooltipText = elem.append('g')
        .attr('class', 'tooltip-group')
        .style('display', 'none');
    tooltipText.append('text')
        .attr('class', 'current-tooltip-text');
    tooltipText.append('text')
        .attr('class', 'compare-tooltip-text');

    let compareMax = isCompareVisible ? max(compareData.map((datum) => datum.value)) : 0
    let yMax = max([max(data.map((datum) =>  datum.value)), compareMax]);

    elem.append('rect')
        .attr('class', 'overlay')
        .attr('width', '100%')
        .attr('height', '100%')
        .on('mouseover', () => {
            focus.style('display', null);
            tooltipText.style('display', null);
            currentFocus.style('display', null);
            if (isCompareVisible) {
                compareFocus.style('display',  null);
            }
        })
        .on('mouseout', () => {
            focus.style('display', 'none');
            tooltipText.style('display', 'none');
            currentFocus.style('display', 'none');
            compareFocus.style('display', 'none');
        })
        .on('mousemove', function () {
            // Get the nearest data point for the current mouse position.
            const time = xScale.invert(mouse(this)[0]);
            const {datum, index} = getNearestTime(data, time);
            if (!datum) {
                return;
            }
            let compareTime;
            let compare;
            if (isCompareVisible) {
                compareTime = compareXScale.invert(mouse(this)[0]);
                compare = getNearestTime(compareData, compareTime);
            }

            tooltipLine
                .attr('stroke', 'black')
                .attr('x1', xScale(datum.time))
                .attr('x2', xScale(datum.time))
                .attr('y1', yScale.range()[0])
                .attr('y2', yScale(yMax));

            // Move the focus node to this date/time.
            currentFocus.attr('transform', `translate(${xScale(datum.time)}, ${yScale(datum.value)})`);
            if (isCompareVisible) {
                compareFocus.attr('transform',
                    `translate(${compareXScale(compare.datum.time)}, ${yScale(compare.datum.value)})`);
            }

            tooltipText.select('.current-tooltip-text')
                .attr('x', 15)
                .classed('approved', datum.approved)
                .classed('estimated', datum.estimated)
                .text(() => datum.label);
            tooltipText.select('.compare-tooltip-text')
                .text(() => isCompareVisible ? compare.datum.label : '')
                .classed('approved', compare ? compare.datum.approved : false)
                .classed('estimated', compare ? compare.datum.estimated : false)
                .attr('x', 15)
                .attr('y', '1em');
        });
};


const plotLegend = function(elem, {displayItems}) {
    elem.select('.legend').remove();
    let markers = createLegendMarkers(displayItems);
    drawSimpleLegend(elem, markers);
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
            .attr('class', 'median-data-series')
            .attr('r', CIRCLE_RADIUS)
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
            .call(link((elem, layout) => elem.attr('viewBox', `0 0 ${layout.width} ${layout.height}`), layoutSelector))
            .call(link(addSVGAccessibility, createStructuredSelector({
                title: state => state.title,
                description: state => state.desc,
                isInteractive: () => true
            })))
            .call(link(plotLegend, createStructuredSelector({
                displayItems: legendDisplaySelector
            })))
            .append('g')
                .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)
                .call(link(appendAxes, axesSelector))
                .call(link(plotDataLine, createStructuredSelector({
                    visible: isVisibleSelector('current'),
                    lines: lineSegmentsSelector('current'),
                    xScale: xScaleSelector('current'),
                    yScale: yScaleSelector,
                    tsDataKey: () => 'current'
                })))
                .call(link(plotDataLine, createStructuredSelector({
                    visible: isVisibleSelector('compare'),
                    lines: lineSegmentsSelector('compare'),
                    xScale: xScaleSelector('compare'),
                    yScale: yScaleSelector,
                    tsDataKey: () => 'compare'
                })))
                .call(link(plotTooltips, createStructuredSelector({
                    xScale: xScaleSelector('current'),
                    yScale: yScaleSelector,
                    data: pointsSelector('current'),
                    isCompareVisible: isVisibleSelector('compare'),
                    compareXScale: xScaleSelector('compare'),
                    compareData: pointsSelector('compare')
                })))
                .call(link(plotMedianPoints, createStructuredSelector({
                    visible: isVisibleSelector('medianStatistics'),
                    xscale: xScaleSelector('current'),
                    yscale: yScaleSelector,
                    medianStatsData: pointsSelector('medianStatistics')
                })));

    elem.append('div')
        .call(link(addSROnlyTable, createStructuredSelector({
            columnNames: createSelector(
                (state) => state.title,
                (title) => [title, 'Time']
            ),
            data: createSelector(
                pointsSelector('current'),
                points => points.map((value) => {
                    return [value.value, value.time];
                })
            ),
            describeById: () => {return 'time-series-sr-desc'},
            describeByText: () => {return 'current time series data in tabular format'}
    })));

    elem.append('div')
        .call(link(addSROnlyTable, createStructuredSelector({
            columnNames: createSelector(
                (state) => state.title,
                (title) => [`Median ${title}`, 'Time']
            ),
            data: createSelector(
                pointsSelector('medianStatistics'),
                points => points.map((value) => {
                    return [value.value, value.time];
                })
            ),
            describeById: () => {return 'median-statistics-sr-desc'},
            describeByText: () => {return 'median statistical data in tabular format'}
    })));
};


const attachToNode = function (node, {siteno} = {}) {
    if (!siteno) {
        select(node).call(drawMessage, 'No data is available.');
        return;
    }

    let store = configureStore({
        width: node.offsetWidth
    });

    select(node)
        .call(provide(store))
        .call(timeSeriesGraph)
        .select('.hydrograph-last-year-input')
            .on('change', dispatch(function () {
                return Actions.toggleTimeseries('compare', this.checked);
            }));

    window.onresize = function() {
        store.dispatch(Actions.resizeTimeseriesPlot(node.offsetWidth));
    };
    store.dispatch(Actions.retrieveTimeseries(siteno));
};


module.exports = {attachToNode, getNearestTime, timeSeriesGraph};
