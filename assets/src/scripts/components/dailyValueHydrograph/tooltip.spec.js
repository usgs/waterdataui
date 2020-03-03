import {select} from 'd3-selection';

import {configureStore} from '../../store';

import {drawTooltipFocus, drawTooltipText} from './tooltip';

fdescribe('dailyValueHydrograph/tooltip module', () => {
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
            store = configureStore(TEST_STATE);
        });

        afterEach(() => {
            div.remove();
        });

        it('Expect to render a dv tooltip text div with the appropriate text', () => {
            drawTooltipText(div, store);

            const textDiv = div.selectAll('.dv-tooltip-text');
            expect(textDiv.size()).toBe(1);
            const tooltip = textDiv.text();
            console.log(`tooltip is ${tooltip}`);
            expect(tooltip).toContain('ft');
            expect(tooltip).toContain('4.0');
            expect(tooltip).toContain('2018-01-03');
        });
    });
});