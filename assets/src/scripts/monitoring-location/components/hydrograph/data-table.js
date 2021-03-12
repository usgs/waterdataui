
import List from 'list.js';
import {createStructuredSelector} from 'reselect';

import {link} from 'ui/lib/d3-redux';

import {getGroundwaterLevelsTableData} from './selectors/discrete-data';
import {getIVTableData} from './selectors/iv-data';

const TABLE_CAPTION = {
    iv: 'Instantaneous value data',
    gw: 'Field visit data'
};

const COLUMN_HEADINGS = {
    iv: ['Parameter', 'Time', 'Result', 'Approval', 'Masks'],
    gw: ['Parameter', 'Time', 'Result', 'Approval']
};

const VALUE_NAMES = {
    iv: ['parameterName', 'dateTime', 'result', 'approvals', 'masks'],
    gw: ['parameterName', 'dateTime', 'result', 'approvals']
};

const CONTAINER_ID = {
    iv: 'iv-table-container',
    gw: 'gw-table-container'
};

const drawTableBody = function(table, dataKind, data) {
    table.append('tbody')
        .classed('list', true);
    const items = VALUE_NAMES[dataKind].reduce(function(total, propName, index) {
        if (index === 0) {
            return `${total}<th scope="row" class="${propName}"></th>`;
        } else {
            return `${total}<td class="${propName}"></td>`;
        }
    }, '');
    const options = {
        valueNames: VALUE_NAMES[dataKind],
        item: `<tr>${items}</tr>`,
        page: 30,
        pagination:[{
            left: 1,
            innerWindow: 2,
            right: 1
        }]
    };
    new List(CONTAINER_ID[dataKind], options, data);
};

/*
 * Renders a table of currentData
 * @param {D3 selection} elem - Table is rendered within elem
 * @param {String} kind - kind of data, iv or gw
 * @param {Array of Object} currentData - data that will be rendered in the table.
 */
const drawDataTable = function(elem, {dataKind, currentData}) {
    elem.select(`#${CONTAINER_ID[dataKind]}`).remove();
    if (!currentData.length) {
        return;
    }

    const tableContainer = elem.append('div')
        .attr('id', CONTAINER_ID[dataKind]);

    const table = tableContainer.append('table')
        .classed('usa-table', true);
    tableContainer.append('ul')
        .classed('pagination', true);

    table.append('caption')
        .text(TABLE_CAPTION[dataKind]);
    table.append('thead')
            .append('tr')
                .selectAll('th')
                .data(COLUMN_HEADINGS[dataKind])
                .enter()
                .append('th')
                    .attr('scope', 'col')
                    .text(col => col);
    table.call(drawTableBody, dataKind, currentData);
};

/*
 * Create the hydrograph data tables section which will update when the data
 * displayed on the hydrograph changes.
 * @param {D3 selection} elem
 * @param {Redux store} store
 */
export const drawDataTables = function(elem, store) {
    elem.append('div')
        .attr('id', 'iv-hydrograph-data-table-container')
        .call(link(store, drawDataTable, createStructuredSelector({
            dataKind: () => 'iv',
            currentData: getIVTableData('primary')
        })));
    elem.append('div')
        .attr('id', 'gw-hydrograph-data-table-container')
        .call(link(store, drawDataTable, createStructuredSelector({
            dataKind: () => 'gw',
            currentData: getGroundwaterLevelsTableData
        })));
};