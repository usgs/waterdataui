import mockConsole from 'jest-mock-console';
import sinon from 'sinon';

import config from 'ui/config';

import {getPreviousYearTimeSeries, getTimeSeries, queryWeatherService} from './models';


describe('Models module', () => {
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
        const paramCode = '00060';
        const siteID = '05413500';

        it('Get url includes paramCds and sites', () => {
            getTimeSeries({sites: [siteID], params: [paramCode]});
            let request = fakeServer.requests[0];

            expect(request.url).toContain('sites=' + siteID);
            expect(request.url).toContain('parameterCd=' + paramCode);

            getTimeSeries({sites: [siteID, '12345678'], params: [paramCode, '00080']});
            request = fakeServer.requests[1];

            expect(request.url).toContain('sites=' + siteID + ',12345678');
            expect(request.url).toContain('parameterCd=' + paramCode + ',00080');
        });

        it('Get url includes has the default time period if startDate, endDate and period are null', () => {
            getTimeSeries({sites: [siteID], params: [paramCode]});
            const request = fakeServer.requests[0];
            expect(request.url).toContain('period=P7D');
            expect(request.url).not.toContain('startDT');
            expect(request.url).not.toContain('endDT');
        });

        it('Get url includes startDT and endDT when startDate and endDate are non-null', () => {
            const startDate = new Date('2018-01-02T15:00:00.000-06:00');
            const endDate = new Date('2018-01-02T16:45:00.000-06:00');
            getTimeSeries({sites: [siteID], params: [paramCode], startDate: startDate, endDate: endDate});
            const request = fakeServer.requests[0];
            expect(request.url).not.toContain('period=P7D');
            expect(request.url).toContain('startDT=2018-01-02T21:00');
            expect(request.url).toContain('endDT=2018-01-02T22:45');
        });

        it('Get url includes period when available and startDT and endDT are null', () => {
            getTimeSeries({
                sites: [siteID],
                params: [paramCode],
                period: 'P14D'
            });
            const request = fakeServer.requests[0];
            expect(request.url).toContain('period=P14D');
            expect(request.url).not.toContain('startDT');
            expect(request.url).not.toContain('endDT');
        });

        it('Uses current data service root if data requested is less than 120 days old', () => {
            getTimeSeries({sites: [siteID], params: [paramCode]});
            let request = fakeServer.requests[0];
            expect(request.url).toContain('https://fakeserviceroot.com');

            const startDate = new Date() - 110;
            const endDate = new Date() - 10;
            getTimeSeries({sites: [siteID], params: [paramCode], startDate: startDate, endDate: endDate});
            request = fakeServer.requests[0];
            expect(request.url).toContain('https://fakeserviceroot.com');
        });

        it('Uses nwis data service root if data requested is more than 120 days old', () => {
            const startDate = new Date() - 121;
            const endDate = new Date() - 10;
            getTimeSeries({sites: [siteID], params: [paramCode], startDate: startDate, endDate: endDate});
            let request = fakeServer.requests[0];
            expect(request.url).toContain('https://pastfakeserviceroot.com');
        });

        it('Uses current data service root if period requested is less than P120D', () => {
            getTimeSeries({sites: [siteID], params: [paramCode], period: 'P14D'});
            let request = fakeServer.requests[0];
            expect(request.url).toContain('https://fakeserviceroot.com');
        });

        it('Uses past data service root if period requested is greater than P120D', () => {
            getTimeSeries({sites: [siteID], params: [paramCode], period: 'P140D'});
            let request = fakeServer.requests[0];
            expect(request.url).toContain('https://pastfakeserviceroot.com');
        });
    });

    describe('getPreviousYearTimeSeries', () => {
        const siteID = '05413500';

        const startDate = new Date('2018-01-02T15:00:00.000-06:00');
        const endDate = new Date('2018-01-02T16:45:00.000-06:00');

        it('Retrieves data using the startDT and endDT parameters', () => {
            getPreviousYearTimeSeries({site: siteID, startTime: startDate, endTime: endDate});
            let request = fakeServer.requests[0];

            expect(request.url).toContain('startDT=2017-01-02T21:00');
            expect(request.url).toContain('endDT=2017-01-02T22:45');
        });
    });

    describe('queryWeatherService', () => {
        it('Expect the url to contain the latitude and longitude', () => {
            queryWeatherService('45.3', '-100.2');

            expect(fakeServer.requests[0].url).toContain('45.3,-100.2');
        });

        it('Expect that a successful fetch returns the response', () => {
            const MOCK_WEATHER_SERVICE_DATA = '{"properties" : {"timeZone" : "America/Chicago"}}';
            const promise = queryWeatherService('45.3', '100.2');
            fakeServer.requests[0].respond(200, {}, MOCK_WEATHER_SERVICE_DATA);

            return promise.then((response) => {
                expect(response).toEqual({
                    properties: {
                        timeZone: 'America/Chicago'
                    }
                });
            });
        });

        it('Expect that a failed fetch returns a JSON object with empty properties', () => {
            const promise = queryWeatherService('45.3', '100.2');
            fakeServer.requests[0].respond(500, {}, 'Internal server error');

            return promise.then((response) => {
                expect(response).toEqual({
                    properties: {}
                });
            });
        });
    });
});
