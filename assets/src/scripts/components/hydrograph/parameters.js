const { createSelector } = require('reselect');
const { line } = require('d3-shape');
const { select } = require('d3-selection');

const { Actions } = require('../../store');
const { SPARK_LINE_DIM, SMALL_SCREEN_WIDTH } = require('./layout');
const { dispatch } = require('../../lib/redux');


/**
 * Returns metadata for each available timeseries.
 * @param  {Object} state Redux state
 * @return {Array}        Sorted array of [code, metadata] pairs.
 */
export const availableTimeseriesSelector = createSelector(
    state => state.series.variables,
    state => state.series.timeSeries,
    state => state.currentVariableID,
    (variables, timeSeries, currentVariableID) => {
        if (!variables) {
            return [];
        }

        const codes = {};
        const seriesList = Object.values(timeSeries);
        for (const variableID of Object.keys(variables).sort()) {
            const variable = variables[variableID];
            codes[variable.variableCode.value] = {
                variableID: variable.oid,
                description: variable.variableDescription,
                selected: currentVariableID === variableID,
                currentTimeseriesCount: seriesList.filter(
                    ts => ts.tsKey === 'current' && ts.variable === variableID).length,
                compareTimeseriesCount: seriesList.filter(
                    ts => ts.tsKey === 'compare' && ts.variable === variableID).length,
                medianTimeseriesCount: seriesList.filter(
                    ts => ts.tsKey === 'median' && ts.variable === variableID).length
            };
        }
        let sorted = [];
        for (let key of Object.keys(codes).sort()) {
            sorted.push([key, codes[key]]);
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
 * @param  {Object} elem                d3 selection
 * @param  {Object} availableTimeseries Timeseries metadata to display
 * @param  {Object} layout              layout as retrieved from the redux store
 */
export const plotSeriesSelectTable = function (elem, {availableTimeseries, lineSegmentsByParmCd, timeSeriesScalesByParmCd, layout}) {
    elem.select('#select-timeseries').remove();

    const screenSizeCheck = layout.windowWidth <= SMALL_SCREEN_WIDTH;

    let columnHeaders;
    if (screenSizeCheck) {
        columnHeaders = ['Parameter Code', 'Description', 'Preview'];
    } else {
        columnHeaders = ['Parameter Code', 'Description', 'Now', 'Last Year', 'Median', 'Preview'];
    }

    const table = elem
        .append('table')
            .attr('id', 'select-timeseries')
            .classed('usa-table-borderless', true);

    table.append('caption').text('Select a timeseries');

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
            .attr('ga-event-category', 'TimeseriesGraph')
            .attr('ga-event-action', 'selectTimeSeries')
            .classed('selected', parm => parm[1].selected)
            .on('click', dispatch(function (parm) {
                if (!parm[1].selected) {
                    return Actions.setCurrentParameterCode(parm[0], parm[1].variableID);
                }
            }))
            .call(tr => {
                let parmCdCol = tr.append('td')
                    .attr('scope', 'row');
                parmCdCol.append('span')
                        .text(parm => parm[0]);
                parmCdCol.append('div')
                        .attr('class', 'tooltip-item parameter-tooltip');
                tr.append('td')
                    .text(parm => parm[1].description);
                // if screen size is medium/large, place "Now", "Previous Year", and "Median Data" in the table
                // under the appropriate column headers
                if (!screenSizeCheck) {
                    tr.append('td')
                        .html(parm => {
                            const subScript = parm[1].currentTimeseriesCount > 1 ? `<sub>${parm[1].currentTimeseriesCount}</sub>` : '';
                            return parm[1].currentTimeseriesCount ? `<i class="fa fa-check" aria-label="Current year data available"></i>${subScript}` : '';
                        });
                    tr.append('td')
                        .html(parm => {
                            const subScript = parm[1].compareTimeseriesCount > 1 ? `<sub>${parm[1].compareTimeseriesCount}</sub>` : '';
                            return parm[1].compareTimeseriesCount ? `<i class="fa fa-check" aria-label="Previous year data available"></i>${subScript}` : '';
                        });
                    tr.append('td')
                        .html(parm => {
                            const subScript = parm[1].medianTimeseriesCount > 1 ? `<sub>${parm[1].medianTimeseriesCount}</sub>` : '';
                            return parm[1].medianTimeseriesCount ? `<i class="fa fa-check" aria-label="Median data available"></i>${subScript}` : '';
                        });
                    }
                tr.append('td')
                    .append('svg')
                    .attr('width', SPARK_LINE_DIM.width.toString())
                    .attr('height', SPARK_LINE_DIM.height.toString());
            });

    // seems to be more straight-forward to access an element's joined
    // data by iterating over a selection...

    // if screen size is small, place "Now", "Previous Year", and "Median Data" in a tooltip
    if (screenSizeCheck) {
        table.selectAll('div.tooltip-item').each(function() {
            let selection = select(this);
            selection.append('sup')
                .append('i')
                    .attr('class', 'fa fa-info-circle');
            let tooltipContent = selection.append('div').attr('class', 'tooltip');
            let tooltipTable = tooltipContent.append('table')
                .attr('class', 'tooltip-table');
            tooltipTable.append('caption').text('Available Data');
            tooltipTable.append('thead')
                .append('tr')
                    .selectAll('th')
                    .data(['Now', 'Last Year', 'Median'])
                    .enter()
                    .append('th')
                        .attr('scope', 'col')
                        .text(d => d);

            let tableRow = tooltipTable.append('tr');
            tableRow.append('td')
                .html(d => d[1].currentTimeseriesCount ? '<i class="fa fa-check" aria-label="Current year data available"></i>' : '');
            tableRow.append('td')
                .html(d => d[1].compareTimeseriesCount ? '<i class="fa fa-check" aria-label="Previous year data available"></i>' : '');
            tableRow.append('td')
                .html(d => d[1].medianTimeseriesCount ? '<i class="fa fa-check" aria-label="Median data available"></i>' : '');

        });
    }
    table.selectAll('tbody svg').each(function(d) {
        let selection = select(this);
        const parmCd = d[0];
        for (const seriesLineSegments of lineSegmentsByParmCd[parmCd]) {
            selection.call(addSparkLine, {
                seriesLineSegments: seriesLineSegments,
                scales: timeSeriesScalesByParmCd[parmCd]
            });
        }
    });
};
