import {lineMarker, rectangleMarker} from '../../../d3-rendering/markers';

import {getLegendMarkers} from './legend-data';

describe('daily-value-hydrograph/legend-data', () => {

    const TEST_STATE = {
        dailyValueTimeSeriesData: {
            dvTimeSeries: {
                '12345': {
                    type: 'Feature',
                    id: '12345',
                    properties: {
                        phenomenonTimeStart: '2018-01-02',
                        phenomenonTimeEnd: '2018-01-05',
                        timeStep: ['2018-01-02', '2018-01-03', '2018-01-04', '2018-01-05'],
                        result: ['5.0', '4.0', '6.1', '3.2'],
                        approvals: [['Approved'], ['Approved'], ['Approved'], ['Approved']],
                        nilReason: [null, 'AA', null, null],
                        qualifiers: [null, ['ESTIMATED'], ['ICE'], ['ICE']],
                        grades: [['50'], ['50'], ['60'], ['60']]
                    }
                }
            }
        },
        dailyValueTimeSeriesState: {
            currentDVTimeSeriesId: '12345'
        },
        ui: {
            windowWidth: 1024,
            width: 800
        }
    };

    describe('getLegendMarkers', () => {
        it('Should return no markers if no time series to show', () => {
            let newData = {
                ...TEST_STATE,
                dailyValueTimeSeriesData: {
                    ...TEST_STATE.dailyValueTimeSeriesData,
                    dvTimeSeries: {}
                }
            };

            expect(getLegendMarkers(newData)).toEqual([]);
        });

        it('Should return markers for the selected variable', () => {
            const result = getLegendMarkers(TEST_STATE);

            expect(result.length).toBe(3);
            expect(result).toContain({
                type: lineMarker,
                domId: null,
                domClass: 'approved',
                text: 'Approved'

            });
            expect(result).toContain({
                type: lineMarker,
                domId: null,
                domClass: 'estimated',
                text: 'Estimated'

            });
            expect(result).toContain({
                type: rectangleMarker,
                domId: null,
                domClass: 'mask-0',
                text: 'Ice affected',
                fill: 'url(#dv-masked-pattern)'

            });
        });

    });

});