import {addSVGAccessibility, addSROnlyTable} from './accessibility';
import {select} from 'd3-selection';

describe('svgAccessibility tests', () => {
    describe('addAccessibility tests', () => {

        let svg;
        beforeEach(() => {
            svg = select('body').append('svg');
        });

        afterEach(() => {
            svg.remove();
        });

        it('Should add a title and desc tags and aria attributes', () => {
            addSVGAccessibility(svg, {
                title: 'This is a title',
                description: 'This is a description',
                isInteractive: false,
                idPrefix: 'prefix'
            });

            const title = svg.selectAll('title');
            const desc = svg.selectAll('desc');

            expect(title.size()).toBe(1);
            expect(desc.size()).toBe(1);
            expect(title.html()).toEqual('This is a title');
            expect(desc.html()).toEqual('This is a description');
            expect(svg.attr('aria-labelledby')).toContain('prefix-title');
            expect(svg.attr('aria-describedby')).toContain('prefix-desc');
        });

        it('Should remove the previous title and desc tags when called again', () => {
            addSVGAccessibility(svg, {
                title: 'This is a title',
                description: 'This is a description',
                isInteractive: false
            });

            addSVGAccessibility(svg, {
                title: 'That is a title',
                description: 'That is a description',
                isInteractive: false
            });

            const title = svg.selectAll('title');
            const desc = svg.selectAll('desc');

            expect(title.size()).toBe(1);
            expect(desc.size()).toBe(1);
            expect(title.html()).toEqual('That is a title');
            expect(desc.html()).toEqual('That is a description');
        });

        it('Should not add a tabindex if isInteractive is false', () => {
            addSVGAccessibility(svg, {
                title: 'This is a title',
                description: 'This is a description',
                isInteractive: false
            });
            expect(svg.attr('tabindex')).toBeNull();
        });

        it('Should add a tabindex if isInteractive is true', () => {
            addSVGAccessibility(svg, {
                title: 'This is a title',
                description: 'This is a description',
                isInteractive: true
            });
            expect(svg.attr('tabindex')).toBe('0');
        });
    });

    describe('addSROnlyTable tests', () => {
       let container;
       let columnNames = ['Postal Code', 'FIPS', 'Name'];
       let data = [
           ['WI', '55', 'Wisconson'],
           ['CA', '06', 'California'],
           ['CO', '08', 'Colorado'],
           ['AL', '01', 'Alabama']
               ];
       let describeById = 'some-id';
       let describeByText = 'some descriptive text';

       beforeEach(() => {
           container = select('body').append('div').attr('id', 'test-div');
           addSROnlyTable(select(document.getElementById('test-div')), {
               columnNames: columnNames,
               data: data,
               describeById: describeById,
               describeByText: describeByText
           });
       });

       afterEach(() => {
           container.remove();
       });

       it('Table with the appropriate class is created', () => {
           expect(document.getElementById('test-div').innerHTML).toContain('table');
           expect(container.select('table').attr('class')).toContain('usa-sr-only');
       });

       it('Table descriptions are setup', () => {
            expect(container.select('table').attr('aria-describedby')).toEqual(describeById);
            expect(container.select(`div#${describeById}`).text()).toEqual(describeByText);
       });

       it('Table should contain three columns in table header', () => {
           const cols = container.select('table').select('thead').selectAll('th');
           expect(cols.size()).toBe(3);
           cols.each((s, index) => {
               expect(s).toBe(columnNames[index]);
           });
       });

       it('Table should contain three rows in body', () => {
           const rows = container.select('table').select('tbody').selectAll('tr');
           expect(rows.size()).toBe(4);
           rows.each((row, rindex) => {
               select(this).each((cell, cindex) => {
                   expect(cell).toBe(data[rindex][cindex]);
               });
           });
       });
    });
});
