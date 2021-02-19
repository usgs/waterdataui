import {select, selectAll} from 'd3-selection';
import sinon from 'sinon';

import * as utils from 'ui/utils';

import {configureStore} from 'ml/store';
import {Actions} from 'ml/store/instantaneous-value-time-series-state';

import {drawTimeSeriesLegend} from './legend';


describe('monitoring-location/components/hydrograph/legend module', () => {
    utils.mediaQuery = jest.fn().mockReturnValue(true);

    const TEST_DATA = {
        ivTimeSeriesData: {
            timeSeries: {
                '00060:current': {
                    tsKey: 'current:P7D',
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
                }
            },
            variables: {
                '45807197': {
                    variableCode: {value: '00060'},
                    oid: '45807197'
                }
            }
        },
        statisticsData: {
            median: {
                '00060': {
                    '1': [{ }]
                }
            }
        },
        ivTimeSeriesState: {
            currentIVVariableID: '45807197',
            currentIVDateRange: 'P7D',
            showIVTimeSeries: {
                current: true,
                median: true
            }
        }
    };

    describe('legends should render', () => {

        let graphNode;
        let store;
        let fakeServer;

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

            fakeServer = sinon.createFakeServer();
        });

        afterEach(() => {
            fakeServer.restore();
            select('#hydrograph').remove();
        });


        it('Should have 6 legend markers', () => {
            expect(selectAll('.legend g').size()).toBe(6);
            expect(selectAll('.legend g line.median-step').size()).toBe(1);
        });

        it('Should have 4 legend marker after the median time series are removed', () => {
            store.dispatch(Actions.setIVTimeSeriesVisibility('median', false));
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    expect(selectAll('.legend g').size()).toBe(4);
                    resolve();
                });
            });
        });
    });
});
