import {lineMarker, rectangleMarker, textOnlyMarker} from 'd3render//markers';

import {getLegendMarkerRows} from 'ivhydrograph/selectors/legend-data';

describe('monitoring-location/components/hydrograph/selectors/legend-data', () => {
    const TEST_DATA = {
        ivTimeSeriesData: {
            timeSeries: {
                '00060:current': {
                    tsKey: 'current:P7D',
                    startTime: new Date('2018-03-06T15:45:00.000Z'),
                    endTime: new Date('2018-03-13T13:45:00.000Z'),
                    variable: '45807197',
                    points: [{
                        value: 10,
                        qualifiers: ['P'],
                        approved: false,
                        estimated: false
                    }, {
                        value: null,
                        qualifiers: ['P', 'ICE'],
                        approved: false,
                        estimated: false
                    }, {
                        value: null,
                        qualifiers: ['P', 'FLD'],
                        approved: false,
                        estimated: false
                    }]
                },

                '00060:compare': {
                    tsKey: 'compare:P7D',
                    startTime: new Date('2018-03-06T15:45:00.000Z'),
                    endTime: new Date('2018-03-06T15:45:00.000Z'),
                    variable: '45807202',
                    points: [{
                        value: 1,
                        qualifiers: ['A'],
                        approved: false,
                        estimated: false
                    }, {
                        value: 2,
                        qualifiers: ['A'],
                        approved: false,
                        estimated: false
                    }, {
                        value: 3,
                        qualifiers: ['E'],
                        approved: false,
                        estimated: false
                    }]
                }
            },
            variables: {
                '45807197': {
                    variableCode: {value: '00060'},
                    variableName: 'Streamflow',
                    variableDescription: 'Discharge, cubic feet per second',
                    oid: '45807197'
                },
                '45807202': {
                    variableCode: {value: '00065'},
                    variableName: 'Gage height',
                    oid: '45807202'
                }
            }
        },
        statisticsData: {
            median: {
                '00060': {
                    '1': [{
                        month_nu: '2',
                        day_nu: '25',
                        p50_va: '43',
                        begin_yr: '1970',
                        end_yr: '2017',
                        loc_web_ds: 'This method'
                    }]
                }
            }
        },
        ivTimeSeriesState: {
            currentIVVariableID: '45807197',
            currentIVDateRange: 'P7D',
            showIVTimeSeries: {
                current: true,
                compare: true,
                median: true
            }
        },
        floodData: {
            floodLevels: {
                site_no: '07144100',
                action_stage: '20',
                flood_stage: '22',
                moderate_flood_stage: '25',
                major_flood_stage: '26'
            }
        }
    };

    describe('getLegendMarkerRows', () => {

        it('Should return no markers if no time series to show', () => {
            let newData = {
                ...TEST_DATA,
                ivTimeSeriesData: {
                    ...TEST_DATA.ivTimeSeriesData,
                    timeSeries: {}
                },
                statisticsData: {},
                floodState: {}
            };

            expect(getLegendMarkerRows(newData)).toEqual([]);
        });

        it('Should return markers for the selected variable', () => {
            const result = getLegendMarkerRows(TEST_DATA);

            expect(result.length).toBe(2);
            expect(result[0].length).toBe(4);
            expect(result[0][0].type).toEqual(textOnlyMarker);
            expect(result[0][1].type).toEqual(lineMarker);
            expect(result[0][2].type).toEqual(rectangleMarker);
            expect(result[0][3].type).toEqual(rectangleMarker);
            expect(result[1].length).toBe(2);
            expect(result[1][0].type).toEqual(textOnlyMarker);
            expect(result[1][1].type).toEqual(lineMarker);
        });

        it('Should return markers for a different selected variable', () => {
            const newData = {
                ...TEST_DATA,
                ivTimeSeriesState: {
                    ...TEST_DATA.ivTimeSeriesState,
                    currentIVVariableID: '45807202'
                }
            };
            const result = getLegendMarkerRows(newData);

            expect(result.length).toBe(5);
            expect(result[0].length).toBe(3);
            expect(result[0][0].type).toEqual(textOnlyMarker);
            expect(result[0][1].type).toEqual(lineMarker);
            expect(result[0][2].type).toEqual(lineMarker);
        });

        it('Should return markers only for time series shown', () => {
            const newData = {
                ...TEST_DATA,
                ivTimeSeriesState: {
                    ...TEST_DATA.ivTimeSeriesState,
                    showIVTimeSeries: {
                        'current': true,
                        'compare': false,
                        'median': false
                    }
                }
            };

            const result = getLegendMarkerRows(newData);

            expect(result.length).toBe(1);
            expect(result[0].length).toBe(4);
            expect(result[0][0].type).toEqual(textOnlyMarker);
            expect(result[0][1].type).toEqual(lineMarker);
            expect(result[0][2].type).toEqual(rectangleMarker);
            expect(result[0][3].type).toEqual(rectangleMarker);
        });
    });
});