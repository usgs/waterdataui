import {select} from 'd3-selection';

import {configureStore} from 'ml/store';
import {Actions} from 'ml/store/instantaneous-value-time-series-state';
import {drawGraphControls} from 'ivhydrograph/graph-controls';

// Tests for the graph-controls module
describe('monitoring-location/components/hydrograph/graph-controls', () => {

    const TEST_STATE = {
        ivTimeSeriesData: {
            timeSeries: {
                '00010:current': {
                    points: [{
                        dateTime: 1514926800000,
                        value: 4,
                        qualifiers: ['P']
                    }],
                    method: 'method1',
                    tsKey: 'current:P7D',
                    variable: '45807190'
                },
                '00060:current': {
                    points: [{
                        dateTime: 1514926800000,
                        value: 10,
                        qualifiers: ['P']
                    }],
                    method: 'method1',
                    tsKey: 'current:P7D',
                    variable: '45807197'
                },
                '00060:compare': {
                    points: [{
                        dateTime: 1514926800000,
                        value: 10,
                        qualifiers: ['P']
                    }],
                    method: 'method1',
                    tsKey: 'compare:P7D',
                    variable: '45807197'
                }
            },
            timeSeriesCollections: {
                'coll1': {
                    variable: '45807197',
                    timeSeries: ['00060:current']
                },
                'coll2': {
                    variable: '45807197',
                    timeSeries: ['00060:compare']
                },
                'coll3': {
                    variable: '45807197',
                    timeSeries: ['00060:median']
                },
                'coll4': {
                    variable: '45807190',
                    timeSeries: ['00010:current']
                }
            },
            queryInfo: {
                'current:P7D': {
                    notes: {
                        'filter:timeRange':  {
                            mode: 'PERIOD',
                            periodDays: 7
                        },
                        requestDT: 1522425600000
                    }
                }
            },
            requests: {
                'current:P7D': {
                    timeSeriesCollections: ['coll1']
                },
                'compare:P7D': {
                    timeSeriesCollections: ['coll2', 'col4']
                }
            },
            variables: {
                '45807197': {
                    variableCode: {
                        value: '00060'
                    },
                    oid: '45807197',
                    variableName: 'Test title for 00060',
                    variableDescription: 'Test description for 00060',
                    unit: {
                        unitCode: 'unitCode'
                    }
                },
                '45807190': {
                    variableCode: {
                        value: '00010'
                    },
                    oid: '45807190',
                    unit: {
                        unitCode: 'unitCode'
                    }
                }
            },
            methods: {
                'method1': {
                    methodDescription: 'method description'
                }
            }
        },
        statisticsData : {
            median: {
                '00060': {
                    '1234': [
                        {
                            month_nu: '2',
                            day_nu: '20',
                            p50_va: '40',
                            begin_yr: '1970',
                            end_yr: '2017',
                            loc_web_ds: 'This method'
                        }, {
                            month_nu: '2',
                            day_nu: '21',
                            p50_va: '41',
                            begin_yr: '1970',
                            end_yr: '2017',
                            loc_web_ds: 'This method'
                        }, {
                            month_nu: '2',
                            day_nu: '22',
                            p50_va: '42',
                            begin_yr: '1970',
                            end_yr: '2017',
                            loc_web_ds: 'This method'
                        }
                    ]
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
            },
            loadingIVTSKeys: []
        },
        ui: {
            width: 400
        }
    };

    describe('drawGraphControls', () => {

        let div;
        let store;

        beforeEach(() => {
            div = select('body').append('div');
            store = configureStore(TEST_STATE);
            div.call(drawGraphControls, store);
        });

        afterEach(() => {
            div.remove();
        });

        // last year checkbox tests
        it('Should render the compare toggle checked', () => {
            const checkbox = select('#last-year-checkbox');
            expect(checkbox.size()).toBe(1);
            expect(checkbox.property('checked')).toBe(true);
        });

        it('Should render the compare toggle unchecked', (done) => {
            store.dispatch(Actions.setIVTimeSeriesVisibility('compare', false));
            window.requestAnimationFrame(() => {
                const checkbox = select('#last-year-checkbox');
                expect(checkbox.size()).toBe(1);
                expect(checkbox.property('checked')).toBe(false);
                done();
            });
        });

        it('should be enabled if there are last year data', () => {
            expect(select('#last-year-checkbox').property('disabled')).toBeFalsy();
        });

        it('should be disabled if there are no last year data', (done) => {
            store.dispatch(Actions.setCurrentIVVariable('45807190'));
            window.requestAnimationFrame(() => {
                expect(select('#last-year-checkbox').property('disabled')).toBeTruthy();
                done();
            });
        });

        // median checkbox tests
        it('Should render the median toggle checked', () => {
            const checkbox = select('#median-checkbox');
            expect(checkbox.size()).toBe(1);
            expect(checkbox.property('checked')).toBe(true);
        });

        it('Should render the median toggle unchecked', (done) => {
            store.dispatch(Actions.setIVTimeSeriesVisibility('median', false));
            window.requestAnimationFrame(() => {
                const checkbox = select('#median-checkbox');
                expect(checkbox.size()).toBe(1);
                expect(checkbox.property('checked')).toBe(false);
                done();
            });
        });

        it('should be enabled if there are median statistics data', () => {
            expect(select('#median-checkbox').property('disabled')).toBeFalsy();
        });

        it('should be disabled if there are no median statistics data', (done) => {
            store.dispatch(Actions.setCurrentIVVariable('45807190'));
            window.requestAnimationFrame(() => {
                expect(select('#median-checkbox').property('disabled')).toBeTruthy();
                done();
            });
        });
    });
});
