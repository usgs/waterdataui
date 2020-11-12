import {select, selectAll} from 'd3-selection';


import {configureStore} from 'ml/store';
import {Actions} from 'ml/store/instantaneous-value-time-series-state';

import {drawTimeSeriesLegend} from 'ivhydrograph/legend';


describe('monitoring-location/components/hydrograph/legend module', () => {

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
