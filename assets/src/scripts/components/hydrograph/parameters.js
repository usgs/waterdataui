const { createSelector } = require('reselect');

const { Actions } = require('./store');
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
                currentYear: Boolean(seriesList.find(
                    ts => ts.tsKey === 'current' && ts.variable === variableID)),
                previousYear: Boolean(seriesList.find(
                    ts => ts.tsKey === 'compare' && ts.variable === variableID)),
                medianData: Boolean(seriesList.find(
                    ts => ts.tsKey === 'median' && ts.variable === variableID))
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

    table.append('caption').text('Select a timeseries');

    table.append('thead')
        .append('tr')
            .selectAll('th')
            .data(['Parameter Code', 'Description', 'Now', 'Last Year', 'Median'])
            .enter().append('th')
                .attr('scope', 'col')
                .text(d => d);

    table.append('tbody')
        .selectAll('tr')
        .data(availableTimeseries)
        .enter().append('tr')
            .classed('selected', parm => parm[1].selected)
            .on('click', dispatch(function (parm) {
                if (!parm[1].selected) {
                    return Actions.setCurrentParameterCode(parm[0], parm[1].variableID);
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
            });
};
