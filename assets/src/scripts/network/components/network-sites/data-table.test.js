import {select} from 'd3-selection';

import {drawSiteTable} from './data-table';

describe('network/components/network-sites/data-table', () => {

    describe('drawSiteTable', () => {
        let testDiv;

        beforeEach(() => {
            testDiv = select('body').append('div')
                .attr('id', 'link-list');
            testDiv.append('p').attr('class', 'overload-table');
            testDiv.append('ul')
                .attr('class', 'pagination');
            const table = testDiv.append('table');
            table.append('tbody')
                .attr('class', 'list');
        });

        afterEach(() => {
            testDiv.remove();
        });

        it('Expects no rows to be added if no network sites', () => {
            drawSiteTable('link-list', []);

            expect(testDiv.select('tbody').selectAll('tr').size()).toBe(0);
        });

        it('Expects rows to be add when there are network sites', () => {
            drawSiteTable('link-list', [{
                properties: {
                    monitoringLocationName: 'ML Name 1',
                    monitoringLocationUrl: 'https://fakeml.usgs.gov/ML1'
                }
            }, {
                properties: {
                    monitoringLocationName: 'ML Name 2',
                    monitoringLocationUrl: 'https://fakeml.usgs.gov/ML2'
                }
            }]);

            let rows = testDiv.select('tbody').selectAll('tr');
            expect(rows.size()).toBe(2);
            expect(rows.filter(':first-child').html())
                .toEqual('<th scope="row" class="name">ML Name 1</th><td><a class="link linkhref" href="https://fakeml.usgs.gov/ML1">https://fakeml.usgs.gov/ML1</a></td>');
        });
    });
});