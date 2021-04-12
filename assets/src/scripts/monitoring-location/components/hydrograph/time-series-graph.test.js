import {select} from 'd3-selection';

import * as utils from 'ui/utils';

import {configureStore} from 'ml/store';
import {setMedianDataVisibility} from 'ml/store/hydrograph-state';

import {TEST_PRIMARY_IV_DATA, TEST_GW_LEVELS, TEST_MEDIAN_DATA,
    TEST_CURRENT_TIME_RANGE
} from './mock-hydrograph-state';
import {drawTimeSeriesGraph} from './time-series-graph';


const TEST_STATE = {
    hydrographData: {
        primaryIVData: TEST_PRIMARY_IV_DATA,
        groundwaterLevels: TEST_GW_LEVELS,
        medianStatisticsData: TEST_MEDIAN_DATA,
        currentTimeRange: TEST_CURRENT_TIME_RANGE
    },
    hydrographState: {
        selectedIVMethodID: '90649',
        showCompareIVData: false,
        showMedianData: false,
        graphCursorOffset: 300000
    },
    ui: {
        width: 400
    },
    floodData: {}
};

describe('monitoring-location/components/hydrograph/time-series-graph', () => {
    utils.mediaQuery = jest.fn().mockReturnValue(true);
    utils.wrap = jest.fn();

    let div;
    let store;

    beforeEach(() => {
        div = select('body').append('div').attr('id', 'hydrograph');
        store = configureStore(TEST_STATE);
    });

    afterEach(() => {
        div.remove();
    });

    it('Render graph title with monitoring location name in title and tooltip', () => {
        drawTimeSeriesGraph(div, store, '11112222', 'USGS', 'This site', true, true);

        const titleDiv = div.select('.time-series-graph-title');
        expect(titleDiv.size()).toBe(1);
        expect(titleDiv.select('.monitoring-location-name-div').size()).toBe(1);
        expect(titleDiv.select('.usa-tooltip').size()).toBe(1);
    });

    it('Render graph title without monitoring location name in title', () => {
        drawTimeSeriesGraph(div, store, '11112222', 'USGS', 'This site', false, true);

        const titleDiv = div.select('.time-series-graph-title');
        expect(titleDiv.size()).toBe(1);
        expect(titleDiv.select('.monitoring-location-name-div').size()).toBe(0);
        expect(titleDiv.select('.usa-tooltip').size()).toBe(1);
    });

    it('Render graph title without info toolip', () => {
        drawTimeSeriesGraph(div, store, '11112222', 'USGS', 'This site', true, false);

        const titleDiv = div.select('.time-series-graph-title');
        expect(titleDiv.size()).toBe(1);
        expect(titleDiv.select('.monitoring-location-name-div').size()).toBe(1);
        expect(titleDiv.select('.usa-tooltip').size()).toBe(0);
    });

    it('Should render tooltip text and focus circles', () => {
        drawTimeSeriesGraph(div, store, '11112222', 'USGS', 'This site', false, true);

        expect(div.selectAll('.tooltip-text-group').size()).toBe(1);
        expect(div.selectAll('.focus-line-group').size()).toBe(1);
        expect(div.selectAll('.focus-circle').size()).toBe(2);
    });

    it('Should not render tooltip text and focus circles', ()=> {
        drawTimeSeriesGraph(div, store, '11112222', 'USGS', 'This site', false, false);

        expect(div.selectAll('.tooltip-text-group').size()).toBe(0);
        expect(div.selectAll('.focus-line-group').size()).toBe(0);
        expect(div.selectAll('.focus-circle').size()).toBe(0);
    });

    it('Should render current IV Data and groundwater levels but not median steps', () => {
        drawTimeSeriesGraph(div, store, '11112222', 'USGS', 'This site', false, false);
        expect(div.selectAll('.ts-primary-group').html()).not.toEqual('');
        expect(div.selectAll('.ts-compare-group').html()).toEqual('');
        expect(div.selectAll('.iv-graph-gw-levels-group').html()).not.toEqual('');
        expect(div.selectAll('.median-stats-group').size()).toBe(0);
    });

    it('Should render median data if visible', () => {
        store.dispatch(setMedianDataVisibility(true));
        drawTimeSeriesGraph(div, store, '11112222', 'USGS', 'This site', false, false);

        expect(div.selectAll('.ts-primary-group').html()).not.toEqual('');
        expect(div.selectAll('.ts-compare-group').html()).toEqual('');
        expect(div.selectAll('.iv-graph-gw-levels-group').html()).not.toEqual('');
        expect(div.selectAll('.median-stats-group').size()).toBe(1);
    });
});