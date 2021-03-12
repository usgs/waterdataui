import mockConsole from 'jest-mock-console';
import {DateTime} from 'luxon';
import sinon from 'sinon';

import config from 'ui/config';

import {fetchTimeSeries} from './instantaneous-values';


describe('web-services/instantaneous-values', () => {
    let fakeServer;
    let restoreConsole;
    config.SERVICE_ROOT = 'https://fakeserviceroot.com';
    config.PAST_SERVICE_ROOT = 'https://pastfakeserviceroot.com';

    beforeEach(() => {
        fakeServer = sinon.createFakeServer();
        restoreConsole = mockConsole();
    });

    afterEach(() => {
        restoreConsole();
        fakeServer.restore();
    });

    describe('getTimeSeries function', () => {
        const parameterCode = '00060';
        const siteID = '05413500';

        it('Get url includes parameterCode and sites but no period or startDT/endDT', () => {
            fetchTimeSeries({sites: [siteID], parameterCode: parameterCode});
            let request = fakeServer.requests[0];

            expect(request.url).toContain('sites=' + siteID);
            expect(request.url).toContain('parameterCd=' + parameterCode);
            expect(request.url).not.toContain('period');
            expect(request.url).not.toContain('startDT');
            expect(request.url).not.toContain('endDT');
        });

        it('Get url includes has the  time period if period is non null', () => {
            fetchTimeSeries({sites: [siteID], parameterCode: parameterCode, period: 'P7D'});
            const request = fakeServer.requests[0];
            expect(request.url).toContain('period=P7D');
            expect(request.url).not.toContain('startDT');
            expect(request.url).not.toContain('endDT');
        });

        it('Get url includes startDT and endDT when startTime and endTime are non-null and period is null', () => {
            const startTime = '2018-01-02T15:00:00.000-06:00';
            const endTime = '2018-01-02T16:45:00.000-06:00';
            fetchTimeSeries({sites: [siteID], parameterCode: parameterCode, period: null, startTime: startTime, endTime: endTime});
            const request = fakeServer.requests[0];
            expect(request.url).not.toContain('period');
            expect(request.url).toContain(`startDT=${startTime}`);
            expect(request.url).toContain(`endDT=${endTime}`);
        });

        it('Get url does not include any time parameters if all are null', () => {
            fetchTimeSeries({sites: [siteID], parameterCode: parameterCode, period: null, startTime: null, endTime: null});
            const request = fakeServer.requests[0];
            expect(request.url).not.toContain('period');
            expect(request.url).not.toContain('startDT');
            expect(request.url).not.toContain('endDT');
        });

        it('Uses current data service root if data requested is less than 120 days old', () => {
            fetchTimeSeries({sites: [siteID], parameterCode: parameterCode});
            let request = fakeServer.requests[0];
            expect(request.url).toContain('https://fakeserviceroot.com');

            const startTime = DateTime.local().minus({days: 100}).toISO();
            const endTime = DateTime.local().minus({days: 10}).toISO();
            fetchTimeSeries({sites: [siteID], parameterCode: parameterCode, startTime: startTime, endTime: endTime});
            request = fakeServer.requests[0];
            expect(request.url).toContain('https://fakeserviceroot.com');
        });

        it('Uses nwis data service root if data requested is more than 120 days old', () => {
            const startTime = DateTime.local().minus({days: 121}).toISO();
            const endTime = DateTime.local().minus({days: 10}).toISO();
            fetchTimeSeries({sites: [siteID], parameterCode: parameterCode, startTime: startTime, endTime: endTime});
            let request = fakeServer.requests[0];
            expect(request.url).toContain('https://pastfakeserviceroot.com');
        });

        it('Uses current data service root if period requested is less than P120D', () => {
            fetchTimeSeries({sites: [siteID], parameterCode: parameterCode, period: 'P14D'});
            let request = fakeServer.requests[0];
            expect(request.url).toContain('https://fakeserviceroot.com');
        });

        it('Uses past data service root if period requested is greater than P120D', () => {
            fetchTimeSeries({sites: [siteID], parameterCode: parameterCode, period: 'P140D'});
            let request = fakeServer.requests[0];
            expect(request.url).toContain('https://pastfakeserviceroot.com');
        });

        it('Contains no parameterCode is parameterCode is null', () => {
            fetchTimeSeries({sites: [siteID], parameterCode: null, period: 'P14D'});
            let request = fakeServer.requests[0];
            expect(request.url).not.toContain('parameterCd');
        });
    });
});
