import { select, selectAll } from 'd3-selection';
import { attachToNode } from './index';
import { Actions, configureStore } from '../../store';


const TEST_STATE = {
    series: {
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
    timeSeriesState: {
        currentVariableID: '45807197',
        currentDateRange: 'P7D',
        requestedTimeRange: null,
        showSeries: {
            current: true,
            compare: true,
            median: true
        },
        loadingTSKeys: []
    },
    ui: {
        width: 400
    }
};


describe('Hydrograph charting and Loading indicators and data alerts', () => {
    let graphNode;

    beforeEach(() => {
        let body = select('body');
        let component = body.append('div')
            .attr('id', 'hydrograph');
        component.append('div').attr('class', 'loading-indicator-container');
        component.append('div').attr('class', 'graph-container');
        component.append('div').attr('class', 'select-time-series-container');
        component.append('div').attr('class', 'provisional-data-alert');

        graphNode = document.getElementById('hydrograph');

        jasmine.Ajax.install();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
        select('#hydrograph').remove();
    });

    it('expect alert if no siteno defined', () => {
        attachToNode({}, graphNode, {});
        expect(graphNode.innerHTML).toContain('No data is available');
    });

    describe('Tests for initial data fetching when showOnlyGraph is false (the default)', () => {
        let store;

        beforeEach(() => {
            store = configureStore({});
        });

        it('loading-indicator is shown until initial data has been retrieved', () => {
            attachToNode(store, graphNode, {
                siteno: '1234568'
            });

            expect(select(graphNode).select('.loading-indicator').size()).toBe(1);
        });

        it('Expects retrieveLocationTimeZone to be called', () => {
            spyOn(Actions, 'retrieveLocationTimeZone').and.callThrough();
            attachToNode(store, graphNode, {
                siteno: '12345678'
            });

            expect(Actions.retrieveLocationTimeZone).toHaveBeenCalled();
        });

        describe('Always retrieve the 7 day data and median statistics', () => {

            beforeEach(() => {
                spyOn(Actions, 'retrieveTimeSeries').and.callThrough();
                spyOn(Actions, 'retrieveMedianStatistics').and.callThrough();
            });

            it('Retrieve if no date parameters are used', () => {
                attachToNode(store, graphNode, {
                    siteno: '12345678',
                    parameterCode: '00065'
                });

                expect(Actions.retrieveTimeSeries).toHaveBeenCalledWith('12345678');
                expect(Actions.retrieveMedianStatistics).toHaveBeenCalledWith('12345678');
            });

            it('Retrieve if period parameters is used', () => {
                attachToNode(store, graphNode, {
                    siteno: '12345678',
                    parameterCode: '00065',
                    period: 'P30D'
                });

                expect(Actions.retrieveTimeSeries).toHaveBeenCalledWith('12345678');
                expect(Actions.retrieveMedianStatistics).toHaveBeenCalledWith('12345678');
            });

            it('Retrieve if startDT and endDT parameters are used', () => {
                attachToNode(store, graphNode, {
                    siteno: '12345678',
                    parameterCode: '00065',
                    startDT: '2010-01-01',
                    endDT: '2010-03-01'
                });

                expect(Actions.retrieveTimeSeries).toHaveBeenCalledWith('12345678');
                expect(Actions.retrieveMedianStatistics).toHaveBeenCalledWith('12345678');
            });
        });

        describe('Retrieve additional data if indicated', () => {
            beforeEach(() => {
                spyOn(Actions, 'retrieveTimeSeries').and.returnValue(function() {
                    return Promise.resolve({});
                });
                spyOn(Actions, 'retrieveExtendedTimeSeries').and.callThrough();
                spyOn(Actions, 'retrieveDataForDateRange').and.callThrough();
            });

            it('Expect to not retrieve additional time series if not indicated', (done) => {
                attachToNode(store, graphNode, {
                    siteno: '12345678',
                    parameterCode: '00065'
                });

                window.requestAnimationFrame(() => {
                    expect(Actions.retrieveExtendedTimeSeries).not.toHaveBeenCalled();
                    expect(Actions.retrieveDataForDateRange).not.toHaveBeenCalled();
                    done();
                });
            });
            it('should retrieve extend time series if period set', (done) => {
                attachToNode(store, graphNode, {
                    siteno: '12345678',
                    parameterCode: '00065',
                    period: 'P30D'
                });

                window.requestAnimationFrame(() => {
                    expect(Actions.retrieveExtendedTimeSeries).toHaveBeenCalledWith('12345678', 'P30D', '00065');
                    expect(Actions.retrieveDataForDateRange).not.toHaveBeenCalled();
                    done();
                });
            });

            it('should not retrieve data for date range if  time zone has not been fetched', (done) => {
                attachToNode(store, graphNode, {
                    siteno: '12345678',
                    parameterCode: '00065',
                    startDT: '2010-01-01',
                    endDT: '2010-03-01'
                });

                window.requestAnimationFrame(() => {
                    expect(Actions.retrieveExtendedTimeSeries).not. toHaveBeenCalled();
                    expect(Actions.retrieveDataForDateRange).not.toHaveBeenCalled();
                    done();
                });
            });

            it('should retrieve data for date range if  time zone has  been fetched', (done) => {
                spyOn(Actions, 'retrieveLocationTimeZone').and.returnValue(function() {
                    return Promise.resolve({});
                });
                attachToNode(store, graphNode, {
                    siteno: '12345678',
                    parameterCode: '00065',
                    startDT: '2010-01-01',
                    endDT: '2010-03-01'
                });

                window.requestAnimationFrame(() => {
                    expect(Actions.retrieveExtendedTimeSeries).not. toHaveBeenCalled();
                    expect(Actions.retrieveDataForDateRange).toHaveBeenCalledWith('12345678', '2010-01-01', '2010-03-01', '00065');
                    done();
                });
            });
        });
    });

    describe('Tests for initial data fetching when showOnlyGraph is true ', () => {
        let store;

        beforeEach(() => {
            store = configureStore({});
            spyOn(Actions, 'retrieveTimeSeries').and.callThrough();
            spyOn(Actions, 'retrieveCustomTimePeriodTimeSeries').and.callThrough();
            spyOn(Actions, 'retrieveDataForDateRange');
        });

        it('should retrieve custom time period if period is specificed', (done) => {
            attachToNode(store, graphNode, {
                siteno: '12345678',
                parameterCode: '00065',
                period: 'P20D',
                showOnlyGraph: true
            });

            window.requestAnimationFrame(() => {
                expect(Actions.retrieveTimeSeries).not.toHaveBeenCalled();
                expect(Actions.retrieveCustomTimePeriodTimeSeries).toHaveBeenCalledWith('12345678', '00065', 'P20D');
                expect(Actions.retrieveDataForDateRange).not.toHaveBeenCalled();
                done();
            });
        });

        it('should not retrieve date range for date range parameters if time zone has not been fetched', (done) => {
            attachToNode(store, graphNode, {
                siteno: '12345678',
                parameterCode: '00065',
                startDT: '2010-01-01',
                endDT: '2010-03-01',
                showOnlyGraph: true
            });

            window.requestAnimationFrame(() => {
                expect(Actions.retrieveTimeSeries).not.toHaveBeenCalled();
                expect(Actions.retrieveCustomTimePeriodTimeSeries).not.toHaveBeenCalled();
                expect(Actions.retrieveDataForDateRange).not.toHaveBeenCalled();
                done();
            });
        });

        it('should  retrieve date range for date range parameters if time zone has been fetched', (done) => {
            spyOn(Actions, 'retrieveLocationTimeZone').and.returnValue(function() {
                return Promise.resolve({});
            });
            attachToNode(store, graphNode, {
                siteno: '12345678',
                parameterCode: '00065',
                startDT: '2010-01-01',
                endDT: '2010-03-01',
                showOnlyGraph: true
            });

            window.requestAnimationFrame(() => {
                expect(Actions.retrieveTimeSeries).not.toHaveBeenCalled();
                expect(Actions.retrieveCustomTimePeriodTimeSeries).not.toHaveBeenCalled();
                expect(Actions.retrieveDataForDateRange).toHaveBeenCalledWith('12345678', '2010-01-01', '2010-03-01', '00065');
                done();
            });
        });

        it('should retrieve time series if no custom period or date range', (done) => {
            attachToNode(store, graphNode, {
                siteno: '12345678',
                parameterCode: '00065',
                showOnlyGraph: true
            });

            window.requestAnimationFrame(() => {
                expect(Actions.retrieveTimeSeries).toHaveBeenCalledWith('12345678', ['00065']);
                expect(Actions.retrieveCustomTimePeriodTimeSeries).not.toHaveBeenCalled();
                expect(Actions.retrieveDataForDateRange).not.toHaveBeenCalled();
                done();
            });
        });
    });

    describe('graphNode contains the expected elements when showOnlyGraph is false', () => {
        /* eslint no-use-before-define: 0 */
        let store;
        beforeEach((done) => {
            spyOn(Actions, 'retrieveTimeSeries').and.returnValue(function() {
                return Promise.resolve({});
            });
            store = configureStore({
                ...TEST_STATE,
                series: {
                    ...TEST_STATE.series,
                    timeSeries: {
                        ...TEST_STATE.series.timeSeries,
                        '00060:current': {
                            ...TEST_STATE.series.timeSeries['00060:current'],
                            startTime: 1514926800000,
                            endTime: 1514930400000,
                            points: [{
                                dateTime: 1514926800000,
                                value: 10,
                                qualifiers: ['P']
                            }, {
                                dateTime: 1514930400000,
                                value: null,
                                qualifiers: ['P', 'FLD']
                            }]
                        }
                    }
                },
                timeSeriesState: {
                    showSeries: {
                        current: true,
                        compare: true,
                        median: true
                    },
                    currentVariableID: '45807197',
                    currentDateRange: 'P7D',
                    currentMethodID: 'method1',
                    loadingTSKeys: []
                },
                ui: {
                    windowWidth: 400,
                    width: 400,
                    hydrographXRange: undefined
                }

            });

            attachToNode(store, graphNode, {siteno: '123456788'});
            window.requestAnimationFrame(() => {
                done();
            });
        });

        it('should render the correct number of svg nodes', () => {
            // one main hydrograph, brush, legend and two sparklines
            expect(selectAll('svg').size()).toBe(5);
        });

        it('should have a title div', () => {
            const titleDiv = selectAll('.time-series-graph-title');
            expect(titleDiv.size()).toBe(1);
            expect(titleDiv.text()).toEqual('Test title for 00060, method description');
        });

        it('should have a defs node', () => {
            expect(selectAll('defs').size()).toBe(1);
            expect(selectAll('defs mask').size()).toBe(1);
            expect(selectAll('defs pattern').size()).toBe(2);
        });

        it('should render time series data as a line', () => {
            // There should be one segment per time-series. Each is a single
            // point, so should be a circle.
            expect(selectAll('.hydrograph-svg .line-segment').size()).toBe(2);
        });

        it('should render a rectangle for masked data', () => {
            expect(selectAll('.hydrograph-svg g.current-mask-group').size()).toBe(1);
        });

        it('should have a point for the median stat data with a label', () => {
            expect(selectAll('#median-points path').size()).toBe(1);
            expect(selectAll('#median-points text').size()).toBe(0);
        });

        it('should have brush element for the hydrograph', () => {
            expect(selectAll('.brush').size()).toBe(1);
        });

        it('should have slider-wrapper element', () => {
            expect(selectAll('.slider-wrapper').size()).toBe(1);
        });

        it('should have date control elements', () => {
            expect(selectAll('#ts-daterange-select-container').size()).toBe(1);
            expect(selectAll('#ts-customdaterange-select-container').size()).toBe(1);
        });

        it('should have method select element', () => {
            expect(selectAll('#ts-method-select-container').size()).toBe(1);
        });

        it('should have the select time series element', () => {
            expect(selectAll('#select-time-series').size()).toBe(1);
        });

        it('should have tooltips for the select series table', () => {
            // one for each of the two parameters
            expect(selectAll('table .tooltip-item').size()).toBe(2);
        });

        it('should not have tooltips for the select series table when the screen is large', (done) => {
            store.dispatch(Actions.resizeUI(800, 800));
            window.requestAnimationFrame(() => {
                expect(selectAll('table .tooltip-table').size()).toBe(0);
                done();
            });
        });
    });

    describe('hide elements when showOnlyGraph is set to true', () => {
        let store;
        beforeEach(() => {
            spyOn(Actions, 'retrieveTimeSeries').and.returnValue(function() {
                return Promise.resolve({});
            });
            store = configureStore({
                ...TEST_STATE,
                series: {
                    ...TEST_STATE.series,
                    timeSeries: {
                        ...TEST_STATE.series.timeSeries,
                        '00060:current': {
                            ...TEST_STATE.series.timeSeries['00060:current'],
                            startTime: 1514926800000,
                            endTime: 1514930400000,
                            points: [{
                                dateTime: 1514926800000,
                                value: 10,
                                qualifiers: ['P']
                            }, {
                                dateTime: 1514930400000,
                                value: null,
                                qualifiers: ['P', 'FLD']
                            }]
                        }
                    }
                },
                timeSeriesState: {
                    showSeries: {
                        current: true,
                        compare: true,
                        median: true
                    },
                    currentVariableID: '45807197',
                    currentDateRange: 'P7D',
                    currentMethodID: 'method1',
                    loadingTSKeys: []
                },
                ui: {
                    windowWidth: 400,
                    width: 400,
                    hydrographXRange: undefined
                }

            });

            attachToNode(store, graphNode, {siteno: '123456788', showOnlyGraph: true});
        });

        it('should not have brush element for the hydrograph', () => {
            expect(selectAll('.brush').size()).toBe(0);
        });

        it('should not have slider-wrapper element', () => {
            expect(selectAll('.slider-wrapper').size()).toBe(0);
        });

        it('should not have date control elements', () => {
            expect(selectAll('#ts-daterange-select-container').size()).toBe(0);
            expect(selectAll('#ts-customdaterange-select-container').size()).toBe(0);
        });

        it('should not have method select element', () => {
            expect(selectAll('#ts-method-select-container').size()).toBe(0);
        });

        it('should not have the select time series element', () => {
            expect(selectAll('#select-time-series').size()).toBe(0);
        });
    });
});