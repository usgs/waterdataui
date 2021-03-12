import {lineMarker, rectangleMarker, textOnlyMarker, circleMarker} from 'd3render/markers';

import {getLegendMarkerRows} from './legend-data';

describe('monitoring-location/components/hydrograph/selectors/legend-data', () => {
    const TEST_PRIMARY_IV_DATA = {
        parameter: {
            parameterCode: '72019'
        },
        values: {
            '90649': {
                points: [
                    {value: 12.6, qualifiers: ['P'], dateTime: 1582560900000},
                    {value: null, qualifiers: ['ICE'], dateTime: 1582561800000}
                ],
                method: {
                    methodID: '90649'
                }
            }
        }
    };
    const TEST_COMPARE_IV_DATA = {
        parameter: {
            parameterCode: '72019'
        },
        values: {
            '90649': {
                points: [
                    {value: 12.3, qualifiers: ['A'], dateTime: 1582560900000},
                    {value: 14.0, qualifiers: ['E'], dateTime: 1582561800000}
                ],
                method: {
                    methodID: '90649'
                }
            }
        }
    };

    const TEST_GROUNDWATER_LEVELS = {
        parameter: {
            parameterCode: '72019'
        },
        values: [
            {value: 11.3, qualifiers: ['R'], dateTime: 1582560900000},
            {value: 12.2, qualifiers: ['A'], dateTime: 1582561800000}
        ]
    };

    const TEST_STATE = {
        hydrographData: {
            currentTimeRange: {
                start: 1582560900000,
                end: 1582561800000
            },
            prioryearTimeRange: {
                start: 1582560900000,
                end: 1582561800000
            },
            primaryIVData: TEST_PRIMARY_IV_DATA,
            compareIVData: TEST_COMPARE_IV_DATA,
            groundwaterLevels: TEST_GROUNDWATER_LEVELS
        },
        hydrographState: {
            showCompareIVData: false,
            showMedianData: false,
            selectedIVMethodID: '90649'
        },
        floodData: {}
    };

    describe('getLegendMarkerRows', () => {
        it('Should return no data to show', () => {
            expect(getLegendMarkerRows({
                ...TEST_STATE,
                hydrographData: {}
            })).toHaveLength(0);
        });

        it('Should return markers for primary IV Data', () => {
            const markerRows = getLegendMarkerRows(TEST_STATE);
            expect(markerRows).toHaveLength(2);
            const currentRow = markerRows[0];
            expect(currentRow).toHaveLength(3);
            expect(currentRow[0].type).toEqual(textOnlyMarker);
            expect(currentRow[1].type).toEqual(lineMarker);
            expect(currentRow[2].type).toEqual(rectangleMarker);

            const gwRow = markerRows[1];
            expect(gwRow).toHaveLength(3);
            expect(gwRow[0].type).toEqual(textOnlyMarker);
            expect(gwRow[1].type).toEqual(circleMarker);
            expect(gwRow[2].type).toEqual(circleMarker);
        });

        it('Should return markers for primary and compare when compare is visible', () => {
            const markerRows = getLegendMarkerRows({
                ...TEST_STATE,
                hydrographState: {
                    ...TEST_STATE.hydrographState,
                    showCompareIVData: true
                }
            });
            expect(markerRows).toHaveLength(3);
            const compareRow = markerRows[2];
            expect(compareRow).toHaveLength(3);
            expect(compareRow[0].type).toEqual(textOnlyMarker);
            expect(compareRow[1].type).toEqual(lineMarker);
            expect(compareRow[2].type).toEqual(lineMarker);
        });
    });
});