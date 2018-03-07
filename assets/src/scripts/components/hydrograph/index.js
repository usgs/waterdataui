/**
 * Hydrograph charting module.
 */
const { select } = require('d3-selection');
const { extent } = require('d3-array');
const { line } = require('d3-shape');
const { createStructuredSelector } = require('reselect');

const { addSVGAccessibility, addSROnlyTable } = require('../../accessibility');
const { dispatch, link, provide } = require('../../lib/redux');

const { appendAxes, axesSelector } = require('./axes');
const { MARGIN, CIRCLE_RADIUS, SPARK_LINE_DIM, layoutSelector } = require('./layout');
const { drawSimpleLegend, legendMarkerRowsSelector } = require('./legend');
const { plotSeriesSelectTable, availableTimeseriesSelector } = require('./parameters');
const { xScaleSelector, yScaleSelector, timeSeriesScalesByParmCdSelector } = require('./scales');
const { Actions, configureStore } = require('./store');
const { currentVariableLineSegmentsSelector, currentVariableSelector, currentVariableTimeseries, oldPointsSelector,
    methodsSelector, pointsTableDataSelector, isVisibleSelector, titleSelector,
    descriptionSelector, lineSegmentsByParmCdSelector, timeSeriesSelector, MASK_DESC, HASH_ID } = require('./timeseries');
const { createTooltipFocus, createTooltipText } = require('./tooltip');


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


const plotDataLine = function (elem, {visible, lines, tsKey, xScale, yScale}) {
    if (!visible) {
        return;
    }

    const tsLine = line()
        .x(d => xScale(d.dateTime))
        .y(d => yScale(d.value));

    for (let line of lines) {
        if (line.classes.dataMask === null) {
            elem.append('path')
                .datum(line.points)
                .classed('line', true)
                .classed('approved', line.classes.approved)
                .classed('estimated', line.classes.estimated)
                .classed(`ts-${tsKey}`, true)
                .attr('d', tsLine);
        } else {
            const maskCode = line.classes.dataMask.toLowerCase();
            const maskDisplayName = MASK_DESC[maskCode].replace(' ', '-').toLowerCase();
            const [xDomainStart, xDomainEnd] = extent(line.points, d => d.dateTime);
            const [yRangeStart, yRangeEnd] = yScale.domain();
            let maskGroup = elem.append('g')
                .attr('class', `${tsKey}-mask-group`);
            const xSpan = xScale(xDomainEnd) - xScale(xDomainStart);
            const rectWidth = xSpan > 0 ? xSpan : 1;

            maskGroup.append('rect')
                .attr('x', xScale(xDomainStart))
                .attr('y', yScale(yRangeEnd))
                .attr('width', rectWidth)
                .attr('height', Math.abs(yScale(yRangeEnd)- yScale(yRangeStart)))
                .attr('class', `mask ${maskDisplayName}-mask`);

            const patternId = HASH_ID[tsKey] ? `url(#${HASH_ID[tsKey]})` : '';

            maskGroup.append('rect')
                .attr('x', xScale(xDomainStart))
                .attr('y', yScale(yRangeEnd))
                .attr('width', rectWidth)
                .attr('height', Math.abs(yScale(yRangeEnd) - yScale(yRangeStart)))
                .attr('fill', patternId);
        }
    }
};


const plotDataLines = function (elem, {visible, tsLinesMap, tsKey, xScale, yScale}) {
    const elemId = `ts-${tsKey}-group`;

    elem.selectAll(`#${elemId}`).remove();
    const tsLineGroup = elem
        .append('g')
        .attr('id', elemId)
        .classed('tsKey', true);

    for (const lines of Object.values(tsLinesMap)) {
        plotDataLine(tsLineGroup, {visible, lines, tsKey, xScale, yScale});
    }
};


const plotSvgDefs = function(elem) {

    let defs = elem.append('defs');

    defs.append('mask')
        .attr('id', 'display-mask')
        .attr('maskUnits', 'userSpaceOnUse')
        .append('rect')
            .attr('x', '0')
            .attr('y', '0')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', '#0000ff');

    defs.append('pattern')
        .attr('id', HASH_ID.current)
        .attr('width', '8')
        .attr('height', '8')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('patternTransform', 'rotate(45)')
        .append('rect')
            .attr('width', '4')
            .attr('height', '8')
            .attr('transform', 'translate(0, 0)')
            .attr('mask', 'url(#display-mask)');

    defs.append('pattern')
        .attr('id', HASH_ID.compare)
        .attr('width', '8')
        .attr('height', '8')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('patternTransform', 'rotate(135)')
        .append('rect')
            .attr('width', '4')
            .attr('height', '8')
            .attr('transform', 'translate(0, 0)')
            .attr('mask', 'url(#display-mask)');
};


const timeSeriesLegend = function(elem) {
    elem.append('div')
        .attr('class', 'hydrograph-container')
        .append('svg')
            .call(link(drawSimpleLegend, createStructuredSelector({
                legendMarkerRows: legendMarkerRowsSelector,
                layout: layoutSelector
            })));
};


/**
 * Plots the median points for a single median time series.
 * @param  {Object} elem
 * @param  {Function} options.xscale
 * @param  {Function} options.yscale
 * @param  {Number} options.modulo
 * @param  {Array} options.points
 * @param  {Boolean} options.showLabel
 * @param  {Object} options.variable
 */
const plotMedianPoints = function (elem, {xscale, yscale, modulo, points, showLabel, variable}) {
    elem.selectAll('medianPoint')
        .data(points)
        .enter()
        .append('circle')
            .classed('median-data-series', true)
            .classed(`median-modulo-${modulo}`, true)
            .attr('r', CIRCLE_RADIUS)
            .attr('cx', function(d) {
                return xscale(d.dateTime);
            })
            .attr('cy', function(d) {
                return yscale(d.value);
            })
            .on('click', dispatch(function() {
                return Actions.showMedianStatsLabel(!showLabel);
            }));

    if (showLabel) {
        elem.selectAll('medianPointText')
            .data(points)
            .enter()
            .append('text')
                .text(function(d) {
                    return `${d.value} ${variable.unit.unitCode}`;
                })
                .attr('x', function(d) {
                    return xscale(d.dateTime) + 5;
                })
                .attr('y', function(d) {
                    return yscale(d.value);
                });
    }
};

/**
 * Plots the median points for all median time series for the current variable.
 * @param  {Object} elem
 * @param  {Boolean} options.visible
 * @param  {Function} options.xscale
 * @param  {Function} options.yscale
 * @param  {Array} options.pointsList
 * @param  {Boolean} options.showLabel
 * @param  {Object} options.variable
 */
const plotAllMedianPoints = function (elem, {visible, xscale, yscale, seriesMap, showLabel, variable}) {
    elem.select('#median-points').remove();

    if (!visible) {
        return;
    }
    const container = elem
        .append('g')
            .attr('id', 'median-points');

    for (const [index, seriesID] of Object.keys(seriesMap).entries()) {
        const points = seriesMap[seriesID].points;
        plotMedianPoints(container, {xscale, yscale, modulo: index % 6, points, showLabel, variable});
    }
};

const plotSROnlyTable = function (elem, {tsKey, variable, methods, visible, dataByTsID, timeSeries}) {
    elem.selectAll(`sr-only-${tsKey}`).remove();

    if (!visible) {
        return;
    }

    const container = elem.append('div')
        .attr('id', `sr-only-${tsKey}`);

    for (const seriesID of Object.keys(timeSeries)) {
        const series = timeSeries[seriesID];
        const method = methods[series.method].methodDescription;
        let title = variable.variableName;
        if (method) {
            title += ` (${method})`;
        }
        if (tsKey === 'median') {
            title = `Median ${title}`;
        }
        addSROnlyTable(container, {
            columnNames: [title, 'Time', 'Qualifiers'],
            data: dataByTsID[seriesID],
            describeById: `${seriesID}-time-series-sr-desc`,
            describeByText: `${seriesID} time series data in tabular format`
        });
    }
};

const timeSeriesGraph = function (elem) {
    elem.append('div')
        .attr('class', 'hydrograph-container')
        .append('svg')
            .call(link((elem, layout) => elem.attr('viewBox', `0 0 ${layout.width} ${layout.height}`), layoutSelector))
            .call(link(addSVGAccessibility, createStructuredSelector({
                titleSelector,
                descriptionSelector,
                isInteractive: () => true
            })))
            .call(createTooltipText)
            .call(plotSvgDefs)
            .append('g')
                .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)
                .call(link(appendAxes, axesSelector))
                .call(link(plotDataLines, createStructuredSelector({
                    visible: isVisibleSelector('current'),
                    tsLinesMap: currentVariableLineSegmentsSelector('current'),
                    xScale: xScaleSelector('current'),
                    yScale: yScaleSelector,
                    tsKey: () => 'current'
                })))
                .call(link(plotDataLines, createStructuredSelector({
                    visible: isVisibleSelector('compare'),
                    tsLinesMap: currentVariableLineSegmentsSelector('compare'),
                    xScale: xScaleSelector('compare'),
                    yScale: yScaleSelector,
                    tsKey: () => 'compare'
                })))
                .call(link(createTooltipFocus, createStructuredSelector({
                    xScale: xScaleSelector('current'),
                    yScale: yScaleSelector,
                    compareXScale: xScaleSelector('compare'),
                    currentTsData: oldPointsSelector('current'),
                    compareTsData: oldPointsSelector('compare'),
                    isCompareVisible: isVisibleSelector('compare')
                })))
                .call(link(plotAllMedianPoints, createStructuredSelector({
                    visible: isVisibleSelector('median'),
                    xscale: xScaleSelector('current'),
                    yscale: yScaleSelector,
                    seriesMap: currentVariableTimeseries('median'),
                    variable: currentVariableSelector,
                    showLabel: (state) => state.showMedianStatsLabel
                })));

    elem.call(link(plotSeriesSelectTable, createStructuredSelector({
        availableTimeseries: availableTimeseriesSelector,
        lineSegmentsByParmCd: lineSegmentsByParmCdSelector('current'),
        timeSeriesScalesByParmCd: timeSeriesScalesByParmCdSelector('current')(SPARK_LINE_DIM),
        layout: layoutSelector
    })));

    elem.append('div')
        .call(link(plotSROnlyTable, createStructuredSelector({
            tsKey: () => 'compare',
            variable: currentVariableSelector,
            methods: methodsSelector,
            visible: isVisibleSelector('compare'),
            dataByTsID: pointsTableDataSelector('compare'),
            timeSeries: timeSeriesSelector('compare')
    })));
    elem.append('div')
        .call(link(plotSROnlyTable, createStructuredSelector({
            tsKey: () => 'compare',
            variable: currentVariableSelector,
            methods: methodsSelector,
            visible: isVisibleSelector('compare'),
            dataByTsID: pointsTableDataSelector('compare'),
            timeSeries: timeSeriesSelector('compare')
    })));
    elem.append('div')
        .call(link(plotSROnlyTable, createStructuredSelector({
            tsKey: () => 'median',
            variable: currentVariableSelector,
            methods: methodsSelector,
            visible: isVisibleSelector('median'),
            dataByTsID: pointsTableDataSelector('median'),
            timeSeries: timeSeriesSelector('median')
    })));
};


const attachToNode = function (node, {siteno} = {}) {
    if (!siteno) {
        select(node).call(drawMessage, 'No data is available.');
        return;
    }

    let store = configureStore({
        windowWidth: window.innerWidth,
        width: node.offsetWidth
    });

    select(node)
        .call(provide(store))
        .call(timeSeriesGraph)
        .call(timeSeriesLegend)
        .select('.hydrograph-last-year-input')
            .on('change', dispatch(function () {
                return Actions.toggleTimeseries('compare', this.checked);
            }));

    window.onresize = function() {
        store.dispatch(Actions.resizeUI(window.innerWidth, node.offsetWidth));
    };
    store.dispatch(Actions.retrieveTimeseries(siteno));
};


module.exports = {attachToNode, timeSeriesLegend, timeSeriesGraph};
