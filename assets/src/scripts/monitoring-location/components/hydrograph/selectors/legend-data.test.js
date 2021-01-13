import {lineMarker, rectangleMarker, textOnlyMarker, circleMarker} from 'd3render/markers';

import {getLegendMarkerRows} from './legend-data';

describe('monitoring-location/components/hydrograph/selectors/legend-data', () => {
    const TEST_DATA = {
        ivTimeSeriesData: {
            queryInfo: {
                    'current:P7D': {
                        notes: {
                            requestDT: 1520339792000,
                            'filter:timeRange': {
                                mode: 'PERIOD',
                                periodDays: 7,
                                modifiedSince: null
                            }
                        }
                    }
                },
            timeSeries: {
                '72019:current:P7D': {
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

                '72019:compare': {
                    tsKey: 'compare:P7D',
                    startTime: new Date('2018-03-06T15:45:00.000Z'),
                    endTime: new Date('2018-03-18T15:45:00.000Z'),
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
                    variableCode: {value: '72019'},
                    variableName: 'Groundwater Levels',
                    variableDescription: 'Depth to water level, ft below land surface',
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
                '72019': {
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
        discreteData: {
            groundwaterLevels: {
                '72019': {
                    variable: {
                        variableCode: {
                            value: '72019',
                            variableID: 45807197
                        }
                    },
                    values: [
                        {value: '14.0', dateTime: 1519942619200},
                        {value: '14.5', dateTime: 1490882400000},
                        {value: '13.0', dateTime: 1490536800000},
                        {value: '12.0', dateTime: 1489672800000}
                    ]
                }
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
                floodState: {},
                discreteData: {}
            };

            expect(getLegendMarkerRows(newData)).toEqual([]);
        });

        it('Should return markers for the selected variable', () => {
            const result = getLegendMarkerRows(TEST_DATA);

            expect(result).toHaveLength(2);
            expect(result[0]).toHaveLength(5);
            expect(result[0][0].type).toEqual(textOnlyMarker);
            expect(result[0][1].type).toEqual(lineMarker);
            expect(result[0][2].type).toEqual(rectangleMarker);
            expect(result[0][3].type).toEqual(rectangleMarker);
            expect(result[0][4].type).toEqual(circleMarker);
            expect(result[1]).toHaveLength(2);
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

            expect(result).toHaveLength(5);
            expect(result[0]).toHaveLength(3);
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

            expect(result).toHaveLength(1);
            expect(result[0]).toHaveLength(5);
            expect(result[0][0].type).toEqual(textOnlyMarker);
            expect(result[0][1].type).toEqual(lineMarker);
            expect(result[0][2].type).toEqual(rectangleMarker);
            expect(result[0][3].type).toEqual(rectangleMarker);
            expect(result[0][4].type).toEqual(circleMarker);

        });
    });
});