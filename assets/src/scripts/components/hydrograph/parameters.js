const { createSelector } = require('reselect');
const { line } = require('d3-shape');
const { select } = require('d3-selection');

const { allTimeSeriesSelector } = require('./timeseries');
const { Actions } = require('../../store');
const { sortedParameters } = require('../../models');
const { SPARK_LINE_DIM, CIRCLE_RADIUS_SINGLE_PT } = require('./layout');
const { dispatch } = require('../../lib/redux');
const { MASK_DESC } = require('./drawingData');

const { getVariables, getCurrentVariableID } = require('../../selectors/timeseriesSelector');


/**
 * Returns metadata for each available timeseries.
 * @param  {Object} state Redux state
 * @return {Array}        Sorted array of [code, metadata] pairs.
 */
export const availableTimeseriesSelector = createSelector(
    getVariables,
    allTimeSeriesSelector,
    getCurrentVariableID,
    (variables, timeSeries, currentVariableID) => {
        if (!variables) {
            return [];
        }

        let sorted = [];
        const seriesList = Object.values(timeSeries);
        const timeSeriesVariables = seriesList.map(x => x.variable);
        const sortedVariables = sortedParameters(variables).map(x => x.oid);
        for (const variableID of sortedVariables) {
            // start the next iteration if a variable is not a
            // series returned by the allTimeSeriesSelector
            if (!timeSeriesVariables.includes(variableID)) {
                continue;
            }
            const variable = variables[variableID];
            const currentTimeseriesCount = seriesList.filter(ts => ts.tsKey === 'current' && ts.variable === variableID).length;
            if (currentTimeseriesCount > 0) {
                let varCodes = {
                    variableID: variable.oid,
                    description: variable.variableDescription,
                    selected: currentVariableID === variableID,
                    currentTimeseriesCount: currentTimeseriesCount
                };
                sorted.push([variable.variableCode.value, varCodes]);
            }
        }
        return sorted;
    }
);

/**
 * Draw a sparkline in a selected SVG element
 *
 * @param {Object} svgSelection
 * @param {Array} of line segment Objects - seriesLineSegments
 * @param {Object} scales - has x property for x scale and y property for y scale
 */
export const addSparkLine = function(svgSelection, {seriesLineSegments, scales}) {
    let spark = line()
        .x(function(d) {
            return scales.x(d.dateTime);
        })
        .y(function(d) {
            return scales.y(d.value);
        });
    const seriesDataMasks = seriesLineSegments.map(x => x.classes.dataMask);
    if (seriesDataMasks.includes(null)) {
        for (const lineSegment of seriesLineSegments) {
            if (lineSegment.classes.dataMask === null) {
                if (lineSegment.points.length === 1) {
                    svgSelection.append('circle')
                        .data(lineSegment.points)
                        .classed('spark-point', true)
                        .attr('r', CIRCLE_RADIUS_SINGLE_PT/2)
                        .attr('cx', d => scales.x(d.dateTime))
                        .attr('cy', d => scales.y(d.value));
                } else {
                     svgSelection.append('path')
                        .attr('d', spark(lineSegment.points))
                        .classed('spark-line', true);
                }
            }
        }
    } else {
        const centerElement = function (svgElement) {
            const elementWidth = svgElement.node().getBoundingClientRect().width;
            const xLocation = (SPARK_LINE_DIM.width - elementWidth) / 2;
            svgElement.attr('x', xLocation);
        };
        let svgText = svgSelection.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .classed('sparkline-text', true);
        const maskDescs = seriesDataMasks.map(x => MASK_DESC[x.toLowerCase()]);
        const maskDesc = maskDescs.length === 1 ? maskDescs[0] : 'Masked';
        const maskDescWords = maskDesc.split(' ');

        if (maskDescWords.length > 1) {
            Array.from(maskDescWords.entries()).forEach(x => {
                const yPosition = 15 + x[0]*12;
                const maskText = x[1];
                let tspan = svgText.append('tspan')
                    .attr('x', 0)
                    .attr('y', yPosition)
                    .text(maskText);
                centerElement(svgText);
                centerElement(tspan);
            });
        } else {
            svgText.text(maskDesc)
                .attr('y', '20');
            centerElement(svgText);
        }
    }
};


/**
 * Draws a table with clickable rows of timeseries parameter codes. Selecting
 * a row changes the active parameter code.
 * @param  {Object} elem                        d3 selection
 * @param  {Object} availableTimeseries         Timeseries metadata to display
 * @param  {Object} lineSegmentsByParmCd        line segments for each parameter code
 * @param  {Object} timeSeriesScalesByParmCd    scales for each parameter code
 */
export const plotSeriesSelectTable = function (elem, {siteno, availableTimeseries, lineSegmentsByParmCd, timeSeriesScalesByParmCd}) {
    // Get the position of the scrolled window before removing it so it can be set to the same value.
    const lastTable = elem.select('#select-timeseries table');
    const scrollTop = lastTable.size() ? lastTable.property('scrollTop') : null;
    elem.select('#select-timeseries').remove();

    if (!availableTimeseries.length) {
        return;
    }

    const columnHeaders = ['Parameter', 'Preview', '#'];
    const tableContainer = elem.append('div')
        .attr('id', 'select-timeseries');
    tableContainer.append('label')
        .attr('id', 'select-timeseries-label')
        .text('Select a timeseries');
    const table = tableContainer.append('table')
        .classed('usa-table-borderless', true)
        .attr('aria-labelledby', 'select-timeseries-label')
        .attr('tabindex', 0)
        .attr('role', 'listbox');

    table.append('thead')
        .append('tr')
            .selectAll('th')
            .data(columnHeaders)
            .enter().append('th')
                .attr('scope', 'col')
                .text(d => d);

    table.append('tbody')
        .selectAll('tr')
        .data(availableTimeseries)
        .enter().append('tr')
            .attr('ga-on', 'click')
            .attr('ga-event-category', 'selectTimeSeries')
            .attr('ga-event-action', (parm) => `timeseries-parmcd-${parm[0]}`)
            .attr('role', 'option')
            .classed('selected', parm => parm[1].selected)
            .attr('aria-selected', parm => parm[1].selected)
            .on('click', dispatch(function (parm) {
                if (!parm[1].selected) {
                    return Actions.updateCurrentVariable(siteno, parm[1].variableID);
                }
            }))
            .call(tr => {
                let parmCdCol = tr.append('th')
                    .attr('scope', 'row');
                parmCdCol.append('span')
                    .text(parm => parm[1].description);
                let tooltip = parmCdCol.append('div')
                    .attr('class', 'tooltip-item');
                tooltip.append('span')
                    .append('i')
                        .attr('class', 'fa fa-info-circle');

                tooltip.append('div')
                    .attr('class', 'tooltip parameter-tooltip')
                    .append('p')
                        .text(parm => `Parameter code: ${parm[0]}`);

                tr.append('td')
                    .append('svg')
                    .attr('width', SPARK_LINE_DIM.width.toString())
                    .attr('height', SPARK_LINE_DIM.height.toString());
                tr.append('td')
                    .text(parm => parm[1].currentTimeseriesCount);
            });

    table.property('scrollTop', scrollTop);

    table.selectAll('tbody svg').each(function(d) {
        let selection = select(this);
        const parmCd = d[0];
        const lineSegments = lineSegmentsByParmCd[parmCd] ? lineSegmentsByParmCd[parmCd] : [];
        for (const seriesLineSegments of lineSegments) {
            selection.call(addSparkLine, {
                seriesLineSegments: seriesLineSegments,
                scales: timeSeriesScalesByParmCd[parmCd]
            });
        }
    });
};
