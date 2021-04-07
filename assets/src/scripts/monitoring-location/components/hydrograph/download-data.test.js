import {select} from 'd3-selection';

import config from 'ui/config';

import {configureStore} from 'ml/store';
import {setCompareDataVisibility, setMedianDataVisibility} from 'ml/store/hydrograph-state';

import {drawDownloadForm} from './download-data';
import {TEST_CURRENT_TIME_RANGE, TEST_PRIMARY_IV_DATA, TEST_MEDIAN_DATA, TEST_GW_LEVELS} from './mock-hydrograph-state';


describe('monitoring-location/components/hydrograph/download-data', () => {
    config.SITE_DATA_ENDPOINT = 'https://fakeserviceroot.com/nwis/site';
    config.IV_DATA_ENDPOINT = 'https://fakeserviceroot.com/nwis/iv';
    config.HISTORICAL_IV_DATA_ENDPOINT = 'https://fakeserviceroot-more-than-120-days.com/nwis/iv';
    config.STATISTICS_ENDPOINT = 'https://fakeserviceroot.com/nwis/stat';
    config.GROUNDWATER_LEVELS_ENDPOINT = 'https://fakegroundwater.org/gwlevels/';
    config.locationTimeZone = 'America/Chicago';

    const TEST_STATE = {
        hydrographData: {
            currentTimeRange: TEST_CURRENT_TIME_RANGE,
            prioryearTimeRange: TEST_CURRENT_TIME_RANGE,
            primaryIVData: TEST_PRIMARY_IV_DATA,
            compareIVData: TEST_PRIMARY_IV_DATA,
            medianStatisticsData: TEST_MEDIAN_DATA,
            groundwaterLevels: TEST_GW_LEVELS
        },
        hydrographState: {
            showCompareIVData: false,
            showMedianData: false,
            selectedIVMethodID: '90649'
        }
    };

    describe('drawDownloadForm', () => {
        let div;
        let store;
        let windowSpy;

        beforeEach(() => {
            div = select('body').append('div');
            store = configureStore(TEST_STATE);
            windowSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
            drawDownloadForm(div, store, '11112222');
        });

        afterEach(() => {
            div.remove();
        });

        it('Renders form with the appropriate radio buttons and download button', () => {
            expect(div.selectAll('input[type="radio"]').size()).toBe(3);
            expect(div.selectAll('input[value="primary"]').size()).toBe(1);
            expect(div.selectAll('input[value="groundwater-levels"]').size()).toBe(1);
            expect(div.selectAll('input[value="site"]').size()).toBe(1);
            expect(div.selectAll('button.download-selected-data').size()).toBe(1);
        });

        it('Rerenders the radio buttons if data visibility changes', () => {
            store.dispatch(setCompareDataVisibility(true));
            store.dispatch(setMedianDataVisibility(true));
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    expect(div.selectAll('input[type="radio"]').size()).toBe(5);
                    expect(div.selectAll('input[value="compare"]').size()).toBe(1);
                    expect(div.selectAll('input[value="median"]').size()).toBe(1);
                    resolve();
                });
            });
        });

        it('Shows an error message if the download button is clicked with no radio buttons checked', () => {
            const downloadButton = div.select('button.download-selected-data');
            downloadButton.dispatch('click');
            expect(div.select('.usa-alert--error').size()).toBe(1);
        });

        it('Opens a window with the URL for the selected data', () => {
            const downloadButton = div.select('button.download-selected-data');
            div.select('input[value="site"]').property('checked', true);
            downloadButton.dispatch('click');

            expect(div.select('.usa-alert--error').size()).toBe(0);
            expect(windowSpy.mock.calls).toHaveLength(1);
            expect(windowSpy.mock.calls[0][0]).toContain('/site/');
            expect(windowSpy.mock.calls[0][0]).toContain('sites=11112222');
        });

        it('Opens a window for each selected data', () => {
            const downloadButton = div.select('button.download-selected-data');
            store.dispatch(setMedianDataVisibility(true));
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    div.select('input[value="primary"]').property('checked', true);
                    downloadButton.dispatch('click');
                    expect(windowSpy.mock.calls[0][0]).toContain('/iv/');
                    expect(windowSpy.mock.calls[0][0]).toContain('sites=11112222');
                    expect(windowSpy.mock.calls[0][0]).toContain('parameterCd=72019');
                    expect(windowSpy.mock.calls[0][0]).toContain('startDT=2020-02-24T10:15:00.000-06:00');
                    expect(windowSpy.mock.calls[0][0]).toContain('endDT=2020-09-20T11:45:00.000-05:00');

                    div.select('input[value="median"]').property('checked', true);
                    downloadButton.dispatch('click');
                    expect(windowSpy.mock.calls[1][0]).toContain('/stat/');
                    expect(windowSpy.mock.calls[1][0]).toContain('statTypeCd=median');
                    expect(windowSpy.mock.calls[1][0]).toContain('parameterCd=72019');

                    div.select('input[value="groundwater-levels"]').property('checked', true);
                    downloadButton.dispatch('click');
                    expect(windowSpy.mock.calls[2][0]).toContain('/gwlevels/');
                    expect(windowSpy.mock.calls[2][0]).toContain('sites=11112222');
                    expect(windowSpy.mock.calls[2][0]).toContain('parameterCd=72019');
                    expect(windowSpy.mock.calls[2][0]).toContain('startDT=2020-02-24T10:15:00.000-06:00');
                    expect(windowSpy.mock.calls[2][0]).toContain('endDT=2020-09-20T11:45:00.000-05:00');

                    resolve();
                });
            });
        });

        it('Expects the error alert to disappear once a user checks a box and clicks download', () => {
            const downloadButton = div.select('button.download-selected-data');
            downloadButton.dispatch('click');
            div.select('input[value="site"]').property('checked', true);
            downloadButton.dispatch('click');

            expect(div.select('.usa-alert--error').size()).toBe(0);
        });
    });

    describe('Tests for calculated primary parameter', () => {
        const TEST_STATE_TWO = {
            hydrographData: {
                currentTimeRange: TEST_CURRENT_TIME_RANGE,
                primaryIVData: {
                    parameter: {
                        parameterCode: '00010F'
                    },
                    values: {
                        '11111': {
                            points: [{value: 26.0, qualifiers: ['A'], dateTime: 1582560900000}],
                            method: {
                                methodID: '11111'
                            }
                        }
                    }
                }
            },
            hydrographState: {
                showCompareIVData: false,
                showMedianData: false,
                selectedMethodID: '1111'
            }
        };

        let div;
        let store;
        beforeEach(() => {
            div = select('body').append('div');
            store = configureStore(TEST_STATE_TWO);
            drawDownloadForm(div, store, '11112222');
        });

        afterEach(() => {
            div.remove();
        });

        it('Expect to render only the site radio button', () => {
            expect(div.selectAll('input[type="radio"]').size()).toBe(1);
            expect(div.selectAll('input[value="primary"]').size()).toBe(0);
            expect(div.selectAll('input[value="groundwater-levels"]').size()).toBe(0);
            expect(div.selectAll('input[value="site"]').size()).toBe(1);
        });
    });
});
