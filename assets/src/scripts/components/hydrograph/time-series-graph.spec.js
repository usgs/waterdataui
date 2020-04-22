import {select, selectAll} from 'd3-selection';

import {configureStore} from '../../store';
import {Actions} from '../../store/instantaneous-value-time-series-state';

import {drawTimeSeriesGraph} from './time-series-graph';


const TEST_STATE = {
    ianaTimeZone: 'America/Chicago',
    ivTimeSeriesData: {
        timeSeries: {
            '2:00010:current': {
                points: [{
                    dateTime: 1514926800000,
                    value: 4,
                    qualifiers: ['P']
                }],
                method: '2',
                tsKey: 'current:P7D',
                variable: '45807190'
            },
            '1:00060:current': {
                points: [{
                    dateTime: 1514926800000,
                    value: 10,
                    qualifiers: ['P']
                },
                {
                    dateTime: 1514928800000,
                    value: 10,
                    qualifiers: ['P']
                }],
                method: '1',
                tsKey: 'current:P7D',
                variable: '45807197'
            },
            '1:00060:compare': {
                points: [{
                    dateTime: 1514926800000,
                    value: 10,
                    qualifiers: ['P']
                }],
                method: '1',
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
        siteCodes: {
            '12345678': {
                agencyCode: 'USGS'
            }
        },
        sourceInfo: {
            '12345678': {
                siteName: 'Monitoring Location for Test'
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
            '1': {
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
        ivGraphCursorOffset: 0,
        currentIVMethodID: 1,
        currentIVDateRangeKind: 'P7D',
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

describe('time series graph', () => {

    let div;
    let store;

    beforeEach(() => {
        div = select('body').append('div')
            .attr('id', 'hydrograph');
        store = configureStore(TEST_STATE);
    });

    afterEach(() => {
        div.remove();
    });

    it('single data point renders', () => {
        div.call(drawTimeSeriesGraph, store, '12345678', false, false);
        let svgNodes = selectAll('svg');

        expect(svgNodes.size()).toBe(1);
        expect(div.html()).toContain('hydrograph-container');
    });

    describe('container display', () => {

        it('should not be hidden tag if there is data', () => {
            div.call(drawTimeSeriesGraph, store, '12345678', false, false);
            expect(select('#hydrograph').attr('hidden')).toBeNull();
        });
    });

    describe('SVG has been made accessibile', () => {
        let svg;
        beforeEach(() => {
            div.call(drawTimeSeriesGraph, store, '12345678', false, false);
            svg = select('svg');
        });

        it('title and desc attributes are present', function() {
            const descText = svg.select('desc').html();

            expect(svg.select('title').html()).toEqual('Test title for 00060, method description');
            expect(descText).toContain('Test description for 00060');
            expect(descText).toContain('3/23/2018');
            expect(descText).toContain('3/30/2018');
            expect(svg.attr('aria-labelledby')).toContain('title');
            expect(svg.attr('aria-describedby')).toContain('desc');
        });

        it('svg should be focusable', function() {
            expect(svg.attr('tabindex')).toBe('0');
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
    });

    //TODO: Consider adding a test which checks that the y axis is rescaled by
    // examining the contents of the text labels.

    describe('compare line', () => {

        beforeEach(() => {
            div.call(drawTimeSeriesGraph, store, '12345678', false, false);
        });

        it('Should render one lines', () => {
            expect(selectAll('#ts-compare-group .line-segment').size()).toBe(1);
        });

        it('Should remove the lines when removing the compare time series', (done) => {
            store.dispatch(Actions.setIVTimeSeriesVisibility('compare', false));
            window.requestAnimationFrame(() => {
                expect(selectAll('#ts-compare-group .line-segment').size()).toBe(0);
                done();
            });
        });
    });

    describe('median lines', () => {

        beforeEach(() => {
            div.call(drawTimeSeriesGraph, store, '12345678', false, false);
        });

        it('Should render one lines', () => {
            expect(selectAll('#median-points .median-data-series').size()).toBe(1);
        });

        it('Should remove the lines when removing the median statistics data', (done) => {
            store.dispatch(Actions.setIVTimeSeriesVisibility('median', false));
            window.requestAnimationFrame(() => {
                expect(selectAll('#median-points .median-data-series').size()).toBe(0);
                done();
            });
        });
    });

    describe('monitoring location name', () => {
        it('Should not render the monitoring location name if showMLName is false', () => {
            div.call(drawTimeSeriesGraph, store, '12345678', false, false);

            expect(div.selectAll('.monitoring-location-name-div').size()).toBe(0);
        });

        it('Should render the monitoring location if showMLName is true', () => {
            div.call(drawTimeSeriesGraph, store, '12345678', true, false);

            const nameDiv = div.selectAll('.monitoring-location-name-div');
            const nameContents = nameDiv.html();
            expect(nameDiv.size()).toBe(1);
            expect(nameContents).toContain('Monitoring Location for Test');
            expect(nameContents).toContain('USGS');
            expect(nameContents).toContain('12345678');
        });
    });

    describe('tooltip text and focus elements', () => {
        it('Should not render the tooltip if showTooltip is false', () => {
             div.call(drawTimeSeriesGraph, store, '12345678', false, false);

             expect(div.selectAll('.tooltip-text-group').size()).toBe(0);
             expect(div.selectAll('.focus-overlay').size()).toBe(0);
             expect(div.selectAll('.focus-circle').size()).toBe(0);
             expect(div.selectAll('.focus-line').size()).toBe(0);
        });

        it('Should not render the tooltip if showTooltip is false', () => {
             div.call(drawTimeSeriesGraph, store, '12345678', false, true);

             expect(div.selectAll('.tooltip-text-group').size()).toBe(1);
             expect(div.selectAll('.focus-overlay').size()).toBe(1);
             expect(div.selectAll('.focus-circle').size()).toBe(2);
             expect(div.selectAll('.focus-line').size()).toBe(1);
        });
    });
});