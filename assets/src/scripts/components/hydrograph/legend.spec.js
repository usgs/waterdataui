import {select, selectAll} from 'd3-selection';

import {lineMarker, rectangleMarker, textOnlyMarker} from '../../d3-rendering/markers';
import {configureStore} from '../../store';
import {Actions} from '../../store/instantaneous-value-time-series-state';

import {legendMarkerRowsSelector, drawTimeSeriesLegend} from './legend';


describe('UV: Legend module', () => {

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
            currentIVDateRangeKind: 'P7D',
            showIVTimeSeries: {
                current: true,
                compare: true,
                median: true
            }
        },
        floodState: {
            actionStage: 1,
            floodStage: 2,
            moderateFloodStage: 3,
            majorFloodStage: 4
        }
    };

    describe('legendMarkerRowSelector', () => {

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

            expect(legendMarkerRowsSelector(newData)).toEqual([]);
        });

        it('Should return markers for the selected variable', () => {
            const result = legendMarkerRowsSelector(TEST_DATA);

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
            const result = legendMarkerRowsSelector(newData);

            expect(result.length).toBe(1);
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

            const result = legendMarkerRowsSelector(newData);

            expect(result.length).toBe(1);
            expect(result[0].length).toBe(4);
            expect(result[0][0].type).toEqual(textOnlyMarker);
            expect(result[0][1].type).toEqual(lineMarker);
            expect(result[0][2].type).toEqual(rectangleMarker);
            expect(result[0][3].type).toEqual(rectangleMarker);
        });
    });

    describe('legends should render', () => {

        let graphNode;
        let store;

        beforeEach(() => {
            let body = select('body');
            let component = body.append('div')
                .attr('id', 'hydrograph');
            component.append('div').attr('class', 'loading-indicator-container');
            component.append('div').attr('class', 'graph-container');
            component.append('div').attr('class', 'select-time-series-container');
            component.append('div').attr('class', 'provisional-data-alert');

            graphNode = document.getElementById('hydrograph');

            store = configureStore(TEST_DATA);
            select(graphNode)
                .call(drawTimeSeriesLegend, store);

            jasmine.Ajax.install();
        });

        afterEach(() => {
            jasmine.Ajax.uninstall();
            select('#hydrograph').remove();
        });


        it('Should have 6 legend markers', () => {
            expect(selectAll('.legend g').size()).toBe(6);
            expect(selectAll('.legend g line.median-step').size()).toBe(1);
        });

        it('Should have 4 legend marker after the median time series are removed', (done) => {
            store.dispatch(Actions.setIVTimeSeriesVisibility('median', false));
            window.requestAnimationFrame(() => {
                expect(selectAll('.legend g').size()).toBe(4);
                done();
            });
        });
    });
});
