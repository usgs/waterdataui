const { createSelector } = require('reselect');
const { line } = require('d3-shape');
const { select } = require('d3-selection');

const { allTimeSeriesSelector } = require('./timeseries');
const { Actions } = require('../../store');
const { sortedParameters } = require('../../models');
const { SPARK_LINE_DIM } = require('./layout');
const { dispatch } = require('../../lib/redux');



/**
 * Returns metadata for each available timeseries.
 * @param  {Object} state Redux state
 * @return {Array}        Sorted array of [code, metadata] pairs.
 */
export const availableTimeseriesSelector = createSelector(
    state => state.series.variables,
    allTimeSeriesSelector,
    state => state.currentVariableID,
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
            let varCodes = {
                variableID: variable.oid,
                description: variable.variableDescription,
                selected: currentVariableID === variableID,
                currentTimeseriesCount: seriesList.filter(ts => ts.tsKey === 'current' && ts.variable === variableID).length
            };
            sorted.push([variable.variableCode.value, varCodes]);
        }
        return sorted;
    }
);

/**
 * Draw a sparkline in a selected SVG element
 *
 * @param svgSelection
 * @param tsData
 */
export const addSparkLine = function(svgSelection, {seriesLineSegments, scales}) {
    let spark = line()
        .x(function(d) {
            return scales.x(d.dateTime);
        })
        .y(function(d) {
            return scales.y(d.value);
        });

    for (const lineSegment of seriesLineSegments) {
        if (lineSegment.classes.dataMask === null) {
            svgSelection.append('path')
                .attr('d', spark(lineSegment.points))
                .attr('class', 'spark-line');
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
export const plotSeriesSelectTable = function (elem, {availableTimeseries, lineSegmentsByParmCd, timeSeriesScalesByParmCd}) {
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
                    return Actions.setCurrentParameterCode(parm[0], parm[1].variableID);
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
