const { createSelector, createStructuredSelector } = require('reselect');
const { scaleLinear } = require('d3-scale');
const { line } = require('d3-shape');
const { select } = require('d3-selection');

const { Actions } = require('./store');
const { createXScale, simplifiedYScale } = require('./scales');
const { pointsTableDataSelector } = require('./timeseries');
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
 * Draws a table with clickable rows of timeseries parameter codes. Selecting
 * a row changes the active parameter code.
 * @param  {Object} elem                d3 selection
 * @param  {Object} availableTimeseries Timeseries metadata to display
 */
export const plotSeriesSelectTable = function (elem, {availableTimeseries}) {
    elem.select('#select-timeseries').remove();

    const table = elem
        .append('table')
            .attr('id', 'select-timeseries')
            .classed('usa-table-borderless', true);
    const sparkLineSvgWidth = 50;
    const sparkLineSvgHeight = 30;
    const sparkLines = function(selection, {tsData}) {
        const tsDataVals = tsData.values;
        if (tsDataVals) {
            let x = createXScale(tsDataVals, sparkLineSvgWidth);
            let y = simplifiedYScale(tsDataVals, sparkLineSvgHeight);
            let spark = line()
                .x(function(d) {
                    return x(d.time);
                })
                .y(function(d) {
                    return y(d.value);
                });
            selection.append('g')
                .append('path')
                .attr('d', spark(tsDataVals))
                .attr('class', 'spark-line');
        }
    };

    table.append('caption').text('Select a timeseries');

    table.append('thead')
        .append('tr')
            .selectAll('th')
            .data(['Parameter Code', 'Description', 'Now', 'Last Year', 'Median', 'Graph'])
            .enter().append('th')
                .attr('scope', 'col')
                .text(d => d);

    let tBody = table.append('tbody')
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
                tr.append('td')
                    .attr('scope', 'row')
                    .text(parm => parm[0]);
                tr.append('td')
                    .text(parm => parm[1].description);
                tr.append('td')
                    .html(parm => parm[1].currentYear ? '<i class="fa fa-check" aria-label="Current year data available"></i>' : '');
                tr.append('td')
                    .html(parm => parm[1].previousYear ? '<i class="fa fa-check" aria-label="Previous year data available"></i>' : '');
                tr.append('td')
                    .html(parm => parm[1].medianData ? '<i class="fa fa-check" aria-label="Median data available"></i>' : '');
                tr.append('td')
                    .append('svg')
                    .attr('width', sparkLineSvgWidth.toString())
                    .attr('height', sparkLineSvgHeight.toString())
                    .attr('id', (parm) => {return parm[0]});
            });

    let tableSvgs = tBody.selectAll('svg');
    tableSvgs.each(function(d) {
        let selection = select(this);
        let parmCd = d[0];
        const dataSelector = createSelector(
            state => state.tsData['current'][parmCd],
            (parmCdData) => {
                return parmCdData || {};
            }
        );
        selection.call(link(sparkLines,createStructuredSelector(
            {tsData: dataSelector}
        )));
    });
};
