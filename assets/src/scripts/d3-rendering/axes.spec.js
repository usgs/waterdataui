import {select} from 'd3-selection';

import {appendXAxis, appendYAxis, appendSecondaryYAxis, appendAxes} from 'd3render/axes';

describe('axes module', () => {
    let svg, layout;

    beforeEach(() => {
        layout = {
            width: 550,
            height: 900,
            margin: {
                top: 10,
                bottom: 10,
                left: 25,
                right: 25
            }
        };
        svg = select('body').append('svg');
    });

    afterEach(() => {
        svg.remove();
    });

    describe('appendXAxis', () => {
        let xAxis;
        beforeEach(() => {
            xAxis = jasmine.createSpy('mockXAxis');

        });
        it('should render the xAxis', () =>  {
            appendXAxis(svg, {xAxis, layout});

            expect(svg.selectAll('.x-axis').size()).toBe(1);
            expect(xAxis).toHaveBeenCalled();
        });
    });

    describe('appendYAxis', () => {
        let yAxis;
        beforeEach(() => {
            yAxis = jasmine.createSpy('mockYAxis');
        });

        it('should render the yAxis', () =>  {
            appendYAxis(svg, {yAxis, layout, yTitle: 'The Y Axis Title'});

            expect(svg.selectAll('.y-axis').size()).toBe(1);
            expect(svg.selectAll('.y-axis-label').size()).toBe(1);
            expect(svg.select('.y-axis-label').select('tspan').html()).toEqual('The Y Axis Title');
            expect(yAxis).toHaveBeenCalled();
        });
    });

    describe('appendSecondaryYAxis', () => {
        let yAxis;
        beforeEach(() => {
            yAxis = jasmine.createSpy('mockYAxis');
        });

        it('should render the secondaryYAxis', () =>  {
            appendSecondaryYAxis(svg, {yAxis, layout, yTitle: 'The Secondary Y Axis Title'});

            expect(svg.selectAll('.secondary-y-axis').size()).toBe(1);
            expect(svg.select('.secondary-y-axis').selectAll('.y-axis-label').size()).toBe(1);
            expect(svg.select('.secondary-y-axis').select('.y-axis-label').select('tspan').html()).toEqual('The Secondary Y Axis Title');
            expect(yAxis).toHaveBeenCalled();
        });
    });

    describe('appendAxes', () => {
        let xAxis, yAxis, secondaryYAxis;
        beforeEach(() => {
            xAxis = jasmine.createSpy('mockXAxis');
            yAxis = jasmine.createSpy('mockYAxis');
        });

        it('should render all three axes if a secondaryYAxis is defined', () => {
            secondaryYAxis = jasmine.createSpy('mockYAxis');
            appendAxes(svg, {xAxis, yAxis, secondaryYAxis, layout, ytitle: 'One Title', secondaryYTitle: 'Two Title'});

            expect(svg.selectAll('.x-axis').size()).toBe(1);
            expect(svg.selectAll('.y-axis').size()).toBe(1);
            expect(svg.selectAll('.secondary-y-axis').size()).toBe(1);
            expect(svg.selectAll('.y-axis-label').size()).toBe(2);
        });

        it('should render only one y axis if a secondaryYAxis is not defined', () => {
            appendAxes(svg, {xAxis, yAxis, secondaryYAxis: null, layout, ytitle: 'One Title', secondaryYTitle: 'Two Title'});

            expect(svg.selectAll('.x-axis').size()).toBe(1);
            expect(svg.selectAll('.y-axis').size()).toBe(1);
            expect(svg.selectAll('.y-axis-label').size()).toBe(1);
            expect(svg.selectAll('.secondary-y-axis').size()).toBe(0);
        });
    });
});