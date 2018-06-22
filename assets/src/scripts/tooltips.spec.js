import { select } from 'd3-selection';
import { appendTooltip } from './tooltips';


describe('tooltips', () => {

    let testDiv;
    beforeEach(() => {
        testDiv = select('body').append('div')
            .attr('id', 'test-div');
    });

    afterEach(() => {
        select('#test-div').remove();
    });

    it('Creates a tooltip widget', () => {
        let tooltipItem;
        testDiv.call(appendTooltip, 'Help text');
        tooltipItem = testDiv.select('.tooltip-item');
        expect(tooltipItem.size()).toBe(1);
        expect(tooltipItem.select('.tooltip').html()).toContain('Help text');
    });

    it('Uses bound data to create tooltips', () => {
        testDiv
            .selectAll('div')
            .data([{
                helpText: 'Help1'
            }])
            .enter().append('div')
                .attr('class', 'data-div')
                .call(appendTooltip, d => d.helpText);
        expect(testDiv.select('.data-div').html()).toContain('Help1');
    });
});