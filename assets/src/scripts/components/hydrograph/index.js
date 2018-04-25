/**
 * Hydrograph charting module.
 */
const { extent } = require('d3-array');
const { line: d3Line } = require('d3-shape');
const { select } = require('d3-selection');

const { createStructuredSelector } = require('reselect');

const { addSVGAccessibility, addSROnlyTable } = require('../../accessibility');
const { USWDS_MEDIUM_SCREEN, USWDS_SMALL_SCREEN, STATIC_URL } = require('../../config');
const { dispatch, link, provide } = require('../../lib/redux');
const { Actions } = require('../../store');
const { mediaQuery } = require('../../utils');

const { audibleUI } = require('./audible');
const { appendAxes, axesSelector } = require('./axes');
const { cursorSlider } = require('./cursor');
const { pointsTableDataSelector, lineSegmentsByParmCdSelector, currentVariableLineSegmentsSelector,
    MASK_DESC, HASH_ID } = require('./drawingData');
const { CIRCLE_RADIUS, CIRCLE_RADIUS_SINGLE_PT, SPARK_LINE_DIM, layoutSelector } = require('./layout');
const { drawSimpleLegend, legendMarkerRowsSelector } = require('./legend');
const { plotSeriesSelectTable, availableTimeseriesSelector } = require('./parameters');
const { xScaleSelector, yScaleSelector, timeSeriesScalesByParmCdSelector } = require('./scales');
const { allTimeSeriesSelector, currentVariableSelector, methodsSelector, isVisibleSelector, titleSelector,
    descriptionSelector,  currentVariableTimeSeriesSelector, timeSeriesSelector } = require('./timeseries');
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

    for (let line of lines) {
        if (line.classes.dataMask === null) {
            // If this is a single point line, then represent it as a circle.
            // Otherwise, render as a line.
            if (line.points.length === 1) {
                elem.append('circle')
                    .data(line.points)
                    .classed('line-segment', true)
                    .classed('approved', line.classes.approved)
                    .classed('estimated', line.classes.estimated)
                    .attr('r', CIRCLE_RADIUS_SINGLE_PT)
                    .attr('cx', d => xScale(d.dateTime))
                    .attr('cy', d => yScale(d.value));
            } else {
                const tsLine = d3Line()
                    .x(d => xScale(d.dateTime))
                    .y(d => yScale(d.value));
                elem.append('path')
                    .datum(line.points)
                    .classed('line-segment', true)
                    .classed('approved', line.classes.approved)
                    .classed('estimated', line.classes.estimated)
                    .classed(`ts-${tsKey}`, true)
                    .attr('d', tsLine);
            }
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


const plotDataLines = function (elem, {visible, tsLinesMap, tsKey, xScale, yScale}, container) {
    container = container || elem.append('g');

    const elemId = `ts-${tsKey}-group`;
    container.selectAll(`#${elemId}`).remove();
    const tsLineGroup = container
        .append('g')
        .attr('id', elemId)
        .classed('tsKey', true);

    for (const lines of Object.values(tsLinesMap)) {
        plotDataLine(tsLineGroup, {visible, lines, tsKey, xScale, yScale});
    }

    return container;
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
        .classed('hydrograph-container', true)
        .call(link(drawSimpleLegend, createStructuredSelector({
            legendMarkerRows: legendMarkerRowsSelector,
            layout: layoutSelector
        })));
};


/**
 * Plots the median points for a single median time series.
 * @param  {Object} elem
 * @param  {Function} xscale
 * @param  {Function} yscale
 * @param  {Number} modulo
 * @param  {Array} points
 * @param  {Boolean} showLabel
 * @param  {Object} variable
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
 * @param  {Boolean} visible
 * @param  {Function} xscale
 * @param  {Function} yscale
 * @param  {Array} pointsList
 * @param  {Boolean} showLabel
 * @param  {Object} variable
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
    elem.selectAll(`#sr-only-${tsKey}`).remove();

    if (!visible) {
        return;
    }

    const container = elem.append('div')
        .attr('id', `sr-only-${tsKey}`)
        .classed('usa-sr-only', true);


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


const createTitle = function(elem) {
    elem.append('div')
        .classed('timeseries-graph-title', true)
        .call(link((elem, title) => {
            elem.html(title);
        }, titleSelector));
};

const watermark = function (elem) {
    elem.append('img')
        .classed('watermark', true)
        .attr('src', STATIC_URL + '/img/USGS_green_logo.svg')
        .call(link(function(elem, layout) {
            const transformStringSmallScreen = `matrix(0.5, 0, 0, 0.5, ${(layout.width - layout.margin.left) * .025
                    + layout.margin.left - 50}, ${layout.height * .60})`;
            const transformStringForAllOtherScreens = `matrix(1, 0, 0, 1, ${(layout.width - layout.margin.left) * .025
                    + layout.margin.left}, ${(layout.height * .75 - (-1 * layout.height + 503) * .12)})`;
            if (!mediaQuery(USWDS_SMALL_SCREEN)) {
                // calculates the watermark position based on current layout dimensions
                // and a conversion factor minus the area for blank space due to scaling
                elem.style('transform', transformStringSmallScreen);
                // adapts code for Safari browser
                elem.style('-webkit-transform', transformStringSmallScreen);
            } else {
                // calculates the watermark position based on current layout dimensions and a conversion factor
                elem.style('transform', transformStringForAllOtherScreens);
                // adapts code for Safari browser
                elem.style('-webkit-transform', transformStringForAllOtherScreens);
            }
        }, layoutSelector));
};

const createDaterangeControls = function(elem, siteno) {
    const DATE_RANGE = [{
        label: 'seven-day',
        name: '7 days',
        period: 'P7D'
    }, {
        label: 'one-month',
        name: '1 month',
        period: 'P1M'
    }, {
        label: 'one-year',
        name: '1 year',
        period: 'P1Y'
    }];
    const container = elem.append('ul')
        .attr('id', 'ts-daterange-select-container')
        .attr('class', 'usa-fieldset-inputs usa-unstyled-list');
    const li = container.selectAll('li')
        .data(DATE_RANGE)
        .enter().append('li');
    li.append('input')
        .attr('type', 'radio')
        .attr('name', 'ts-daterange-input')
        .attr('id', (d) => d.label)
        .attr('value', (d) => d.period)
        .on('change', dispatch(function() {
            return Actions.retrieveExtendedTimeseries(
                siteno,
                li.select('input:checked').attr('value')
            );
        }));
    li.append('label')
        .attr('for', (d) => d.label)
        .text((d) => d.name);
    li.select(`#${DATE_RANGE[0].label}`).attr('checked', true);
};

const timeSeriesGraph = function (elem, siteno) {
    elem.call(watermark)
            .call(createDaterangeControls, siteno);

    elem.append('div')
        .attr('class', 'hydrograph-container')
        .call(createTitle)
        .call(createTooltipText)
        .append('svg')
            .classed('hydrograph-svg', true)
            .call(link((elem, layout) => elem.attr('viewBox', `0 0 ${layout.width + layout.margin.left + layout.margin.right} ${layout.height + layout.margin.top + layout.margin.bottom}`), layoutSelector))
            .call(link(addSVGAccessibility, createStructuredSelector({
                title: titleSelector,
                description: descriptionSelector,
                isInteractive: () => true
            })))
            .call(plotSvgDefs)
            .call(svg => {
                svg.append('g')
                    .call(link((elem, layout) => elem.attr('transform', `translate(${layout.margin.left},${layout.margin.top})`), layoutSelector))
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
                    .call(createTooltipFocus)
                    .call(link(plotAllMedianPoints, createStructuredSelector({
                        visible: isVisibleSelector('median'),
                        xscale: xScaleSelector('current'),
                        yscale: yScaleSelector,
                        seriesMap: currentVariableTimeSeriesSelector('median'),
                        variable: currentVariableSelector,
                        showLabel: (state) => state.timeseriesState.showMedianStatsLabel
                    })));
            });
/*
    elem.append('div')
        .call(link(plotSROnlyTable, createStructuredSelector({
            tsKey: () => 'current',
            variable: currentVariableSelector,
            methods: methodsSelector,
            visible: isVisibleSelector('current'),
            dataByTsID: pointsTableDataSelector('current'),
            timeSeries: currentVariableTimeSeriesSelector('current')
    })));
    elem.append('div')
        .call(link(plotSROnlyTable, createStructuredSelector({
            tsKey: () => 'compare',
            variable: currentVariableSelector,
            methods: methodsSelector,
            visible: isVisibleSelector('compare'),
            dataByTsID: pointsTableDataSelector('compare'),
            timeSeries: currentVariableTimeSeriesSelector('compare')
    })));
    elem.append('div')
        .call(link(plotSROnlyTable, createStructuredSelector({
            tsKey: () => 'median',
            variable: currentVariableSelector,
            methods: methodsSelector,
            visible: isVisibleSelector('median'),
            dataByTsID: pointsTableDataSelector('median'),
            timeSeries: currentVariableTimeSeriesSelector('median')
    })));
    */
};

/*
 * Create the show last year toggle and the audible toggle for the timeseries graph.
 * @param {Object} elem - D3 selection
 */
const graphControls = function(elem) {
    const graphControlDiv = elem.append('ul')
            .classed('usa-fieldset-inputs', true)
            .classed('usa-unstyled-list', true)
            .classed('graph-controls-container', true);

    graphControlDiv.call(link(function(elem, layout) {
        if (!mediaQuery(USWDS_MEDIUM_SCREEN)) {
            elem.style('padding-left', `${layout.margin.left}px`);
        } else {
            elem.style('padding-left', null);
        }
    }, layoutSelector));

    graphControlDiv.append('li')
        .call(audibleUI);

    const compareControlDiv = graphControlDiv.append('li');
    compareControlDiv.append('input')
        .attr('type', 'checkbox')
        .attr('id', 'last-year-checkbox')
        .attr('aria-labelledby', 'last-year-label')
        .attr('ga-on', 'click')
        .attr('ga-event-category', 'TimeseriesGraph')
        .attr('ga-event-action', 'toggleCompare')
        .on('click', dispatch(function() {
            return Actions.toggleTimeseries('compare', this.checked);
        }))
        // Disables the checkbox if no compare time series for the current variable
        .call(link(function(elem, compareTimeseries) {
            const exists = Object.keys(compareTimeseries) ?
                Object.values(compareTimeseries).filter(tsValues => tsValues.points.length).length > 0 : false;
            elem.property('disabled', !exists);
            if (!exists) {
                elem.property('checked', false);
                elem.dispatch('click');
            }
        }, currentVariableTimeSeriesSelector('compare')))
        // Sets the state of the toggle
        .call(link(function(elem, checked) {
            elem.property('checked', checked);
        }, isVisibleSelector('compare')));
    compareControlDiv.append('label')
        .attr('id', 'last-year-label')
        .attr('for', 'last-year-checkbox')
        .text('Show last year');
};

/**
 * Modify styling to hide or display the plot area.
 *
 * @param elem
 * @param currentTimeseries
 */
const controlGraphDisplay = function (elem, currentTimeseries) {
    const seriesWithPoints = Object.values(currentTimeseries).filter(x => x.points.length > 0);
    elem.attr('hidden', seriesWithPoints.length === 0 ? true : null);
};

const attachToNode = function (store, node, {siteno} = {}) {
    if (!siteno) {
        select(node).call(drawMessage, 'No data is available.');
        return;
    }

    store.dispatch(Actions.resizeUI(window.innerWidth, node.offsetWidth));
    select(node)
        .call(provide(store));
    select(node).select('.graph-container')
        .call(link(controlGraphDisplay, timeSeriesSelector('current')()))
        .call(timeSeriesGraph, siteno)
        .call(cursorSlider)
        .append('div')
            .classed('ts-legend-controls-container', true)
            .call(timeSeriesLegend)
            .call(graphControls);
    select(node).select('.select-timeseries-container')
        .call(link(plotSeriesSelectTable, createStructuredSelector({
            siteno: state => siteno,
            availableTimeseries: availableTimeseriesSelector,
            lineSegmentsByParmCd: lineSegmentsByParmCdSelector('current')('P7D'),
            timeSeriesScalesByParmCd: timeSeriesScalesByParmCdSelector('current')('P7D')(SPARK_LINE_DIM),
            layout: layoutSelector
        })));
    select(node).select('.provisional-data-alert')
        .call(link(function(elem, allTimeSeries) {
            elem.attr('hidden', Object.keys(allTimeSeries).length ? null : true);
        }, allTimeSeriesSelector));


    window.onresize = function() {
        store.dispatch(Actions.resizeUI(window.innerWidth, node.offsetWidth));
    };
    store.dispatch(Actions.retrieveTimeseries(siteno));
};


module.exports = {attachToNode, timeSeriesLegend, timeSeriesGraph};
