import {lineMarker, rectangleMarker, textOnlyMarker} from '../../../d3-rendering/markers';

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
                },
                '12346': {
                    type: 'Feature',
                    id: '12346',
                    properties: {
                        phenomenonTimeStart: '2018-01-02',
                        phenomenonTimeEnd: '2018-01-05',
                        timeStep: ['2018-01-02', '2018-01-03', '2018-01-04', '2018-01-05'],
                        result: ['6.0', '5.0', '7.1', '4.2'],
                        approvals: [['Approved'], ['Approved'], ['Approved'], ['Approved']],
                        nilReason: [null, 'AA', null, null],
                        qualifiers: [null, null, null, null],
                        grades: [['50'], ['50'], ['60'], ['60']]
                    }
                }
            }
        },
        dailyValueTimeSeriesState: {
            currentDVTimeSeriesId: {
                min: null,
                median: '12345',
                max: '12346'
            }
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

            expect(result.length).toBe(2);
            expect(result[0].length).toBe(4);
            expect(result[0][0]).toEqual({
                type: textOnlyMarker,
                domId: null,
                domClass: null,
                text: 'Median'
            });
            expect(result[0]).toContain({
                type: lineMarker,
                domId: null,
                domClass: 'line-segment approved',
                text: 'Approved'

            });
            expect(result[0]).toContain({
                type: lineMarker,
                domId: null,
                domClass: 'line-segment estimated',
                text: 'Estimated'

            });
            expect(result[0]).toContain({
                type: rectangleMarker,
                domId: null,
                domClass: 'mask mask-0',
                text: 'Ice affected',
                fill: 'url(#dv-masked-pattern)'

            });

            expect(result[1].length).toEqual(2);
            expect(result[1][0]).toEqual({
                type: textOnlyMarker,
                domId: null,
                domClass: null,
                text: 'Maximum'
            });
            expect(result[1]).toContain({
                type: lineMarker,
                domId: null,
                domClass: 'line-segment approved',
                text: 'Approved'

            });
        });
    });
});