const { createSelector, createStructuredSelector } = require('reselect');
const { line } = require('d3-shape');
const { select } = require('d3-selection');

const { Actions } = require('./store');
const { currentDataSelector } = require('./timeseries');
const { SPARK_LINE_DIM, SMALL_SCREEN_WIDTH } = require('./layout');
const { createXScale, singleSeriesYScale } = require('./scales');
const { dispatch, link } = require('../../lib/redux');


/**
 * Returns metadata for each available timeseries.
 * @param  {Object} state Redux state
 * @return {Array}        Sorted array of [code, metadata] pairs.
 */
export const availableTimeseriesSelector = createSelector(
    state => state.tsData,
    state => state.currentParameterCode,
    (tsData, currentCd) => {
        const codes = {};
        for (let key of Object.keys(tsData).sort()) {
            for (let code of Object.keys(tsData[key])) {
                codes[code] = codes[code] || {};
                codes[code] = {
                    description: codes[code].description || tsData[key][code].description,
                    type: codes[code].type || tsData[key][code].type,
                    selected: currentCd === code,
                    currentYear: key === 'current' || codes[code].currentYear === true,
                    previousYear: key === 'compare' || codes[code].previousYear === true,
                    medianData: key === 'medianStatistics' || codes[code].medianData === true
                };
            }
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
export const addSparkLine = function(svgSelection, {tsData}) {
    const { parmData, lines } = tsData;
    if (parmData && lines) {
        let x = createXScale(parmData, SPARK_LINE_DIM.width);
        let y = singleSeriesYScale(parmData, SPARK_LINE_DIM.height);
        let spark = line()
            .x(function(d) {
                return x(d.time);
            })
            .y(function(d) {
                return y(d.value);
            });
        for (let lineSegment of lines) {
            if (lineSegment.classes.dataMask === null) {
                 svgSelection.append('path')
                    .attr('d', spark(lineSegment.points))
                    .attr('class', 'spark-line');
            }
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
export const plotSeriesSelectTable = function (elem, {availableTimeseries, layout}) {
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
                    return Actions.setCurrentParameterCode(parm[0]);
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
                        .html(parm => parm[1].currentYear ? '<i class="fa fa-check" aria-label="Current year data available"></i>' : '');
                    tr.append('td')
                        .html(parm => parm[1].previousYear ? '<i class="fa fa-check" aria-label="Previous year data available"></i>' : '');
                    tr.append('td')
                        .html(parm => parm[1].medianData ? '<i class="fa fa-check" aria-label="Median data available"></i>' : '');
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
                .html(d => d[1].currentYear ? '<i class="fa fa-check" aria-label="Current year data available"></i>' : '');
            tableRow.append('td')
                .html(d => d[1].previousYear ? '<i class="fa fa-check" aria-label="Previous year data available"></i>' : '');
            tableRow.append('td')
                .html(d => d[1].medianData ? '<i class="fa fa-check" aria-label="Median data available"></i>' : '');

        });
    }
    table.selectAll('tbody svg').each(function(d) {
        let selection = select(this);
        const parmCd = d[0];
        selection.call(link(addSparkLine, createStructuredSelector(
            {tsData: currentDataSelector(parmCd)}
        )));
    });
};
