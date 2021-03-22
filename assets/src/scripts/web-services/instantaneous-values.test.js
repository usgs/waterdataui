import mockConsole from 'jest-mock-console';
import {DateTime} from 'luxon';
import sinon from 'sinon';

import config from 'ui/config';

import {getSiteMetaDataServiceURL, getIVServiceURL, fetchTimeSeries} from './instantaneous-values';


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

    describe('getSiteMetaDataServiceURL', () => {
       it('Expects the correct URL when isExpanded is false', () => {
           const result = getSiteMetaDataServiceURL({
               siteno: '11112222'
           });
           expect(result).toContain(`${config.SERVICE_ROOT}/site`);
           expect(result).toContain('sites=11112222');
           expect(result).not.toContain('siteOutput=expanded');
       });

       it('Expects the correct URL when isExpanded is true', () => {
           const result = getSiteMetaDataServiceURL({
               siteno: '11112222',
               isExpanded: true
           });
           expect(result).toContain(`${config.SERVICE_ROOT}/site`);
           expect(result).toContain('sites=11112222');
           expect(result).toContain('siteOutput=expanded');
       });
    });

    describe('getIVServiceURL', () => {
        it('expects if no parameters are defaulted that the url will only contain sites parameter', () => {
           const result = getIVServiceURL({
               siteno: '11112222',
               format: 'json'
           });
           expect(result).toContain(`${config.SERVICE_ROOT}/iv`);
           expect(result).toContain('sites=1111222');
           expect(result).toContain('format=json');
           expect(result).not.toContain('parameterCd');
           expect(result).not.toContain('period');
           expect(result).not.toContain('startDT');
           expect(result).not.toContain('endDT');
        });

        it('Expects if parameterCode is defined, the url contains the parameterCode', () => {
            const result = getIVServiceURL({
                siteno: '11112222',
                parameterCode: '72019',
                format: 'json'
            });
            expect(result).toContain(`${config.SERVICE_ROOT}/iv`);
            expect(result).toContain('parameterCd=72019');
        });

        it('Expects if period is under 120 days SERVICE_ROOT will be used', () => {
            const result = getIVServiceURL({
                siteno: '11112222',
                parameterCode: '72019',
                period: 'P119D',
                format: 'json'
            });
            expect(result).toContain(`${config.SERVICE_ROOT}/iv`);
            expect(result).toContain('period=P119D');
            expect(result).not.toContain('startDT');
            expect(result).not.toContain('endDT');
        });

        it('Expects if period is over 120 days PAST_SERVICE_ROOT will be used', () => {
            const result = getIVServiceURL({
                siteno: '11112222',
                parameterCode: '72019',
                period: 'P120D',
                format: 'json'
            });
            expect(result).toContain(`${config.PAST_SERVICE_ROOT}/iv`);
            expect(result).toContain('period=P120D');
            expect(result).not.toContain('startDT');
            expect(result).not.toContain('endDT');
        });

        it('Expects if period, startTime, and endTime are defined, only period is used', () => {
            const result = getIVServiceURL({
                siteno: '11112222',
                parameterCode: '72019',
                period: 'P7D',
                startTime: '2020-01-04',
                endTime: '2020-01-31',
                format: 'json'
            });
            expect(result).toContain(`${config.SERVICE_ROOT}/iv`);
            expect(result).toContain('period=P7D');
            expect(result).not.toContain('startDT');
            expect(result).not.toContain('endDT');
        });

        it('Expects if no period, but startTime and endTime are defined and less than 120 days in the past, the SERVICE_ROOT is used', () => {
            const startTime = DateTime.local().minus({days: 100}).toISO();
            const endTime = DateTime.local().minus({days: 10}).toISO();
            const result = getIVServiceURL({
                siteno: '11112222',
                parameterCode: '72019',
                startTime: startTime,
                endTime: endTime,
                format: 'json'
            });
            expect(result).toContain(`${config.SERVICE_ROOT}/iv`);
            expect(result).not.toContain('period');
            expect(result).toContain(`startDT=${startTime}`);
            expect(result).toContain(`endDT=${endTime}`);
        });

        it('Expects if no period, but startTime and endTime are defined and more than 120 days in the past, the PAST_SERVICE_ROOT is used', () => {
            const startTime = DateTime.local().minus({days: 121}).toISO();
            const endTime = DateTime.local().minus({days: 10}).toISO();
            const result = getIVServiceURL({
                siteno: '11112222',
                parameterCode: '72019',
                startTime: startTime,
                endTime: endTime,
                format: 'json'
            });
            expect(result).toContain(`${config.PAST_SERVICE_ROOT}/iv`);
            expect(result).not.toContain('period');
            expect(result).toContain(`startDT=${startTime}`);
            expect(result).toContain(`endDT=${endTime}`);
        });
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
