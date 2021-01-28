// Required to initialize USWDS components after page load (WaterAlert ToolTips)
import components from 'uswds/src/js/components';

import {line} from 'd3-shape';
import {select} from 'd3-selection';

import config from 'ui/config';

import {appendInfoTooltip} from 'd3render/info-tooltip';

import {Actions} from 'ml/store/instantaneous-value-time-series-data';

import {MASK_DESC} from './selectors/drawing-data';
import {SPARK_LINE_DIM, CIRCLE_RADIUS_SINGLE_PT} from './selectors/layout';

/**
 * Draw a sparkline in a selected SVG element
 *
 * @param {Object} svgSelection
 * @param {Array} of line segment Objects - seriesLineSegments
 * @param {Object} scales - has x property for x scale and y property for y scale
 */
export const addSparkLine = function(svgSelection, {seriesLineSegments, scales}) {
    if (seriesLineSegments.length === 0) {
        return;
    }
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
        const centerElement = function(svgElement) {
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
 * @param  {Object} availableParameterCodes        parameter metadata to display
 * @param  {Object} lineSegmentsByParmCd        line segments for each parameter code
 * @param  {Object} timeSeriesScalesByParmCd    scales for each parameter code
 */
export const plotSeriesSelectTable = function(elem,
    {
        siteno,
        availableParameterCodes,
        lineSegmentsByParmCd,
        timeSeriesScalesByParmCd
    }, store) {
    // Get the position of the scrolled window before removing it so it can be set to the same value.
    const lastTable = elem.select('#select-time-series table');
    const scrollTop = lastTable.size() ? lastTable.property('scrollTop') : null;

    elem.select('#select-time-series').remove();

    if (!availableParameterCodes.length) {
        return;
    }

    const columnHeaders = ['   ', 'Parameter', 'Preview', '#', 'Period of Record', 'WaterAlert'];
    const tableContainer = elem.append('div')
        .attr('id', 'select-time-series');

    tableContainer.append('label')
        .attr('id', 'select-time-series-label')
        .text('Select a time series');
    const table = tableContainer.append('table')
        .classed('usa-table', true)
        .classed('usa-table--borderless', true)
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
        .attr('class', 'usa-fieldset')
        .selectAll('tr')
        .data(availableParameterCodes)
        .enter().append('tr')
        .attr('id', d => `time-series-select-table-row-${d.parameterCode}`)
        .attr('ga-on', 'click')
        .attr('ga-event-category', 'selectTimeSeries')
        .attr('ga-event-action', (d) => `time-series-parmcd-${d.parameterCode}`)
        .attr('role', 'option')
        .classed('selected', d => d.selected)
        .attr('aria-selected', d => d.selected)
        .on('click', function(event, d) {
            if (!d.selected) {
                store.dispatch(Actions.updateIVCurrentVariableAndRetrieveTimeSeries(siteno, d.variableID));
            }
        })
        .call(tr => {
            const paramSelectCol = tr.append('td');
            paramSelectCol.append('input')
                .attr('id', d => `time-series-select-radio-button-${d.parameterCode}`)
                .attr('type', 'radio')
                .attr('name', 'param-select-radio-input')
                .attr('class', 'usa-radio__input')
                .attr('value', d => `${d.variableID}`)
                .property('checked', d => d.selected ? true : null);
            paramSelectCol.append('label')
               .attr('class', 'usa-radio__label');
            const paramCdCol = tr.append('th')
                .attr('scope', 'row');
            paramCdCol.append('span')
                .text(d => d.description)
                .each(function(d) {
                    appendInfoTooltip(select(this), `Parameter code: ${d.parameterCode}`);
                });
            tr.append('td')
                .append('svg')
                .attr('width', SPARK_LINE_DIM.width.toString())
                .attr('height', SPARK_LINE_DIM.height.toString());
            tr.append('td')
                .text(param => param.timeSeriesCount);
            tr.append('td')
                .style('white-space', 'nowrap')
                .text(d => d.periodOfRecord ?
                    `${d.periodOfRecord.begin_date} to ${d.periodOfRecord.end_date}` : '');
            tr.append('td')
                .append('div')
                .attr('class', 'wateralert-link');
        });

    // WaterAlert does not support every parameter code, so lets take that into account when adding the links
    table.selectAll('.wateralert-link').each(function(d) {
        let selection = select(this);

        let waterAlertCell;
        if (d.waterAlert.hasWaterAlert) {
            waterAlertCell = selection.append('a')
                .attr('href', `${config.WATERALERT_SUBSCRIPTION}/?site_no=${siteno}&parm=${d.waterAlert.subscriptionParameterCode}`);
        } else {
            waterAlertCell = selection;
        }
        waterAlertCell.attr('class', 'water-alert-cell usa-tooltip')
            .attr('data-position', 'left')
            .attr('data-classes', 'width-full tablet:width-auto')
            .attr('title', d.waterAlert.tooltipText)
            .text(d.waterAlert.displayText);
    });

    // Activate the USWDS toolTips for WaterAlert subscriptions
    components.tooltip.on(elem.node());

    table.property('scrollTop', scrollTop);

    table.selectAll('tbody svg').each(function(d) {
        let selection = select(this);
        const paramCd = d.parameterCode;
        const lineSegments = lineSegmentsByParmCd[paramCd] ? lineSegmentsByParmCd[paramCd] : [];
        for (const seriesLineSegments of lineSegments) {
            selection.call(addSparkLine, {
                seriesLineSegments: seriesLineSegments,
                scales: timeSeriesScalesByParmCd[paramCd]
            });
        }
    });
};