
import List from 'list.js';

import {link} from '../../lib/d3-redux';

import {getCurrentPointData} from './drawing-data';

const COLUMN_HEADINGS = [
    'Parameter',
    'Time',
    'Result',
    'Approval',
    'Masks'
];

const VALUE_NAMES = [
    'parameterName',
    'dateTime',
    'result',
    'approvals',
    'masks'
];

const CONTAINER_ID = 'iv-data-table-container';

const drawTableBody = function(table, ivData) {
    table.select('tbody').remove();
    table.append('tbody')
        .classed('list', true);
    const items = VALUE_NAMES.reduce(function(total, propName) {
        return `${total}<td class="${propName}"></td>`;
    }, '');
    const options = {
        valueNames: VALUE_NAMES,
        item: `<tr>${items}</tr>`,
        page: 30,
        pagination:[{
            left: 1,
            innerWindow: 2,
            right: 1
        }]
    };
    new List(CONTAINER_ID, options, ivData);
};

/*
 * Renders a table of the currently selected IV Data
 * @param {D3 selection} elem - Table is rendered within elem
 * @param {Redux store} store
 */
export const drawDataTable = function(elem, store) {
    const tableContainer = elem.append('div')
        .attr('id', CONTAINER_ID);
    const table = tableContainer.append('table')
        .classed('usa-table', true);
    tableContainer.append('ul')
        .classed('pagination', true);

    table.append('thead')
            .append('tr')
                .selectAll('th')
                .data(COLUMN_HEADINGS)
                .enter()
                .append('th')
                    .text(col => col);
    table.call(link(store, drawTableBody, getCurrentPointData));
};