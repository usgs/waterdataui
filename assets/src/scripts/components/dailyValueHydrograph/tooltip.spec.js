import {select} from 'd3-selection';

import {configureStore} from '../../store/site-store';

import {drawTooltipFocus, drawTooltipText, drawTooltipCursorSlider} from './tooltip';

describe('dailyValueHydrograph/tooltip module', () => {
    const TEST_STATE = {
        observationsData: {
            timeSeries: {
                '12345': {
                    type: 'Feature',
                    id: '12345',
                    properties: {
                        phenomenonTimeStart: '2018-01-02',
                        phenomenonTimeEnd: '2018-01-05',
                        unitOfMeasureName: 'ft',
                        timeStep: ['2018-01-02', '2018-01-03', '2018-01-04', '2018-01-05'],
                        result: ['5.0', '4.0', '6.1', '3.2'],
                        approvals: [['Approved'], ['Approved'], ['Approved'], ['Approved']],
                        nilReason: [null, 'AA', null, null],
                        qualifiers: [null, null, ['ICE'], ['ICE']],
                        grades: [['50'], ['50'], ['60'], ['60']]
                    }
                }
            }
        },
        observationsState: {
            currentTimeSeriesId: '12345',
            cursorOffset: 86400000
        },
        ui: {
            windowWidth: 1024,
            width: 800
        }
    };

    describe('drawTooltipText', () => {

        let div, store;

        beforeEach(() => {
            div = select('body').append('div');
        });

        afterEach(() => {
            div.remove();
        });

        it('Expect to render a dv tooltip text div with the appropriate text', () => {
            store = configureStore(TEST_STATE);
            drawTooltipText(div, store);

            const textDiv = div.selectAll('.dv-tooltip-text');
            expect(textDiv.size()).toBe(1);
            const tooltip = textDiv.text();
            expect(tooltip).toContain('ft');
            expect(tooltip).toContain('4.0');
            expect(tooltip).toContain('2018-01-03');
        });

        it('Expect tooltip text element rendered to contain the most recent information if cursorOffset is null', () => {
            store = configureStore({
                ...TEST_STATE,
                observationsState: {
                    ...TEST_STATE.observationsState,
                    cursorOffset: null
                }
            });
            drawTooltipText(div, store);

            const textDiv = div.selectAll('.dv-tooltip-text');
            expect(textDiv.size()).toBe(1);
            const tooltip = textDiv.text();
            expect(tooltip).toContain('ft');
            expect(tooltip).toContain('3.2');
            expect(tooltip).toContain('2018-01-05');
        });
    });

    describe('drawTooltipFocus', () => {
        let svg;
        beforeEach(() => {
            svg = select('body').append('svg');
        }) ;

        afterEach(() => {
            svg.remove();
        });

        it('Should draw the focus line, focus circles, and focus overlay', () => {
            let store = configureStore(TEST_STATE);
            drawTooltipFocus(svg, store);

            expect(svg.selectAll('.focus-line').size()).toBe(1);
            expect(svg.selectAll('.focus-circle').size()).toBe(1);
            expect(svg.selectAll('.focus-overlay').size()).toBe(1);
        });
    });


    describe('drawTooltipCursorSlider', () => {
        let div;
        beforeEach(() => {
            div = select('body').append('div');
        });

        afterEach(() => {
            div.remove();
        });

        it('should draw a slider with the position set to the cursor offset', () => {
            let store = configureStore(TEST_STATE);
            drawTooltipCursorSlider(div, store);

            const rangeInput = div.selectAll('input');
            expect(rangeInput.size()).toBe(1);
            expect(rangeInput.attr('type')).toBe('range');
        });
    });
});