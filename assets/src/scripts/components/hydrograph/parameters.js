import { createSelector } from 'reselect';
import { line } from 'd3-shape';
import { select } from 'd3-selection';
import { MASK_DESC } from './drawingData';
import { SPARK_LINE_DIM, CIRCLE_RADIUS_SINGLE_PT } from './layout';
import { allTimeSeriesSelector } from './timeSeries';
import { dispatch } from '../../lib/redux';
import { sortedParameters } from '../../models';
import { Actions } from '../../store';
import { appendTooltip } from '../../tooltips';
import { getVariables, getCurrentVariableID } from '../../selectors/timeSeriesSelector';


/**
 * Returns metadata for each available time series.
 * @param  {Object} state Redux state
 * @return {Array}        Sorted array of [code, metadata] pairs.
 */
export const availableTimeSeriesSelector = createSelector(
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
            const currentTimeSeriesCount = seriesList.filter(ts => ts.tsKey === 'current:P7D' && ts.variable === variableID).length;
            if (currentTimeSeriesCount > 0) {
                let varCodes = {
                    variableID: variable.oid,
                    description: variable.variableDescription,
                    selected: currentVariableID === variableID,
                    currentTimeSeriesCount: currentTimeSeriesCount
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
 * Draws a table with clickable rows of time series parameter codes. Selecting
 * a row changes the active parameter code.
 * @param  {Object} elem                        d3 selection
 * @param  {String} siteno
 * @param  {Object} availableTimeSeries         Time series metadata to display
 * @param  {Object} lineSegmentsByParmCd        line segments for each parameter code
 * @param  {Object} timeSeriesScalesByParmCd    scales for each parameter code
 */
export const plotSeriesSelectTable = function (elem, {siteno, availableTimeSeries, lineSegmentsByParmCd, timeSeriesScalesByParmCd}) {
    // Get the position of the scrolled window before removing it so it can be set to the same value.
    const lastTable = elem.select('#select-time-series table');
    const scrollTop = lastTable.size() ? lastTable.property('scrollTop') : null;
    elem.select('#select-time-series').remove();

    if (!availableTimeSeries.length) {
        return;
    }

    const columnHeaders = ['Parameter', 'Preview', '#'];
    const tableContainer = elem.append('div')
        .attr('id', 'select-time-series');
    tableContainer.append('label')
        .attr('id', 'select-time-series-label')
        .text('Select a time series');
    const table = tableContainer.append('table')
        .classed('usa-table-borderless', true)
        .attr('aria-labelledby', 'select-time-series-label')
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
        .data(availableTimeSeries)
        .enter().append('tr')
            .attr('ga-on', 'click')
            .attr('ga-event-category', 'selectTimeSeries')
            .attr('ga-event-action', (parm) => `time-series-parmcd-${parm[0]}`)
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
                    .text(parm => parm[1].description)
                    .call(appendTooltip, parm => `Parameter code: ${parm[0]}`);

                tr.append('td')
                    .append('svg')
                    .attr('width', SPARK_LINE_DIM.width.toString())
                    .attr('height', SPARK_LINE_DIM.height.toString());
                tr.append('td')
                    .text(parm => parm[1].currentTimeSeriesCount);
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
