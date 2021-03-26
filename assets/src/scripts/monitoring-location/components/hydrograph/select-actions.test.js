import {select} from 'd3-selection';

import {configureStore} from 'ml/store';

import {TEST_PRIMARY_IV_DATA, TEST_MEDIAN_DATA, TEST_GW_LEVELS, TEST_CURRENT_TIME_RANGE} from './mock-hydrograph-state';
import {drawSelectActions} from './select-actions';

describe('monitoring-location/components/hydrograph/select-actions', () => {
    let testDiv;
    let store;
    const TIME_FORM_ID = 'change-time-span-container';
    const DOWNLOAD_FORM_ID = 'download-graph-data-container';
    const TEST_STATE = {
        hydrographData: {
            currentTimeRange: TEST_CURRENT_TIME_RANGE,
            primaryIVData: TEST_PRIMARY_IV_DATA,
            medianStatistics: TEST_MEDIAN_DATA,
            groundwaterLevels: TEST_GW_LEVELS
        },
        hydrographState: {
            selectedTimeSpan: 'P7D',
            selectedIVMethodID: '90649'
        }
    };
    beforeEach(() => {
        testDiv = select('body').append('div');
        store = configureStore(TEST_STATE);
        testDiv.call(drawSelectActions, store, '11112222');
    });

    afterEach(() => {
        testDiv.remove();
    });

    it('Draws the change time and download buttons and forms', () => {
        const buttonContainer = testDiv.selectAll('.select-actions-button-group');

        expect(buttonContainer.size()).toBe(1);
        expect(buttonContainer.selectAll('button').size()).toBe(2);

        const downloadButton = buttonContainer.selectAll(`button[aria-controls=${TIME_FORM_ID}]`);
        const timeSpanButton = buttonContainer.selectAll(`button[aria-controls=${DOWNLOAD_FORM_ID}]`);
        expect(downloadButton.size()).toBe(1);
        expect(timeSpanButton.size()).toBe(1);
        expect(downloadButton.attr('aria-expanded')).toBe('false');
        expect(timeSpanButton.attr('aria-expanded')).toBe('false');

        const timeSpanContainer = testDiv.select(`#${TIME_FORM_ID}`);
        const downloadContainer = testDiv.select(`#${DOWNLOAD_FORM_ID}`);
        expect(timeSpanContainer.size()).toBe(1);
        expect(timeSpanContainer.attr('hidden')).toBe('true');
        expect(downloadContainer.size()).toBe(1);
        expect(downloadContainer.attr('hidden')).toBe('true');
    });

    it('When the download button is clicked, the download section is shown', () => {
        const downloadButton = testDiv.select(`button[aria-controls=${DOWNLOAD_FORM_ID}]`);
        downloadButton.dispatch('click');

        expect(downloadButton.attr('aria-expanded')).toBe('true');
        expect(testDiv.select(`button[aria-controls=${TIME_FORM_ID}]`).attr('aria-expanded')).toBe('false');
        expect(testDiv.select(`#${DOWNLOAD_FORM_ID}`).attr('hidden')).toBeNull();
        expect(testDiv.select(`#${TIME_FORM_ID}`).attr('hidden')).toBe('true');
    });

    it('When the change time span button is clicked, the time span section is shown', () => {
        const timeSpanButton =  testDiv.select(`button[aria-controls=${TIME_FORM_ID}]`);
        timeSpanButton.dispatch('click');

        expect(timeSpanButton.attr('aria-expanded')).toBe('true');
        expect(testDiv.select(`button[aria-controls=${DOWNLOAD_FORM_ID}]`).attr('aria-expanded')).toBe('false');
        expect(testDiv.select(`#${TIME_FORM_ID}`).attr('hidden')).toBeNull();
        expect(testDiv.select(`#${DOWNLOAD_FORM_ID}`).attr('hidden')).toBe('true');
    });

    it('When the download button is clicked twice the download section is hidden again', () => {
        const downloadButton = testDiv.select(`button[aria-controls=${DOWNLOAD_FORM_ID}]`);
        downloadButton.dispatch('click');
        downloadButton.dispatch('click');

        expect(downloadButton.attr('aria-expanded')).toBe('false');
        expect(testDiv.select(`button[aria-controls=${TIME_FORM_ID}]`).attr('aria-expanded')).toBe('false');
        expect(testDiv.select(`#${DOWNLOAD_FORM_ID}`).attr('hidden')).toBe('true');
        expect(testDiv.select(`#${TIME_FORM_ID}`).attr('hidden')).toBe('true');
    });

    it('When the time span button is clicked twice the time span section is hidden again', () => {
        const timeSpanButton =  testDiv.select(`button[aria-controls=${TIME_FORM_ID}]`);
        timeSpanButton.dispatch('click');
        timeSpanButton.dispatch('click');

        expect(timeSpanButton.attr('aria-expanded')).toBe('false');
        expect(testDiv.select(`button[aria-controls=${DOWNLOAD_FORM_ID}]`).attr('aria-expanded')).toBe('false');
        expect(testDiv.select(`#${TIME_FORM_ID}`).attr('hidden')).toBe('true');
        expect(testDiv.select(`#${DOWNLOAD_FORM_ID}`).attr('hidden')).toBe('true');
    });

    it('When the download button is clicked and then the time span button, the download form is hidden and the time span form shown', () => {
        const downloadButton = testDiv.select(`button[aria-controls=${DOWNLOAD_FORM_ID}]`);
        const timeSpanButton =  testDiv.select(`button[aria-controls=${TIME_FORM_ID}]`);
        downloadButton.dispatch('click');
        timeSpanButton.dispatch('click');

        expect(timeSpanButton.attr('aria-expanded')).toBe('true');
        expect(downloadButton.attr('aria-expanded')).toBe('false');
        expect(testDiv.select(`#${TIME_FORM_ID}`).attr('hidden')).toBeNull();
        expect(testDiv.select(`#${DOWNLOAD_FORM_ID}`).attr('hidden')).toBe('true');
    });
});