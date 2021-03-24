import mockConsole from 'jest-mock-console';
import sinon from 'sinon';

import {MOCK_GWLEVEL_DATA} from 'ui/mock-service-data';

import {getGroundwaterServiceURL, fetchGroundwaterLevels} from './groundwater-levels';
import {get} from "../ajax";

describe('web-services/groundwater-levels', () => {
    let fakeServer;
    let restoreConsole;

    beforeEach(() => {
        fakeServer = sinon.createFakeServer();
        restoreConsole = mockConsole();

    });

    afterEach(() => {
        fakeServer.restore();
        restoreConsole();
    });

    describe('getGroundwaterServiceURL', () => {
        it('Expects site no and format parameters but no others', () => {
            const result = getGroundwaterServiceURL({
                siteno: '11112222',
                format: 'rdb'
            });
            expect(result).toContain('sites=11112222');
            expect(result).toContain('format=rdb');
            expect(result).not.toContain('parameterCd');
            expect(result).not.toContain('period');
            expect(result).not.toContain('startDT');
            expect(result).not.toContain('endDT');
        });

        it('Expects defined parameter code and period will appear in the URL', () => {
            const result = getGroundwaterServiceURL({
                siteno: '11112222',
                parameterCode: '72019',
                period: 'P30D',
                format: 'rdb'
            });
            expect(result).toContain('sites=11112222');
            expect(result).toContain('format=rdb');
            expect(result).toContain('parameterCd=72019');
            expect(result).toContain('period=P30D');
            expect(result).not.toContain('startDT');
            expect(result).not.toContain('endDT');
        });

        it('Expects period will appear in the URL even if startTime and endTime are specified', () => {
            const result = getGroundwaterServiceURL({
                siteno: '11112222',
                parameterCode: '72019',
                period: 'P45D',
                startTime: '2020-01-03',
                endTime: '20202-01-15',
                format: 'rdb'
            });
            expect(result).toContain('sites=11112222');
            expect(result).toContain('format=rdb');
            expect(result).toContain('parameterCd=72019');
            expect(result).toContain('period=P45D');
            expect(result).not.toContain('startDT');
            expect(result).not.toContain('endDT');
        });

        it('Expects startTime and endTime in the URL if period is not specified', () => {
            const result = getGroundwaterServiceURL({
                siteno: '11112222',
                parameterCode: '72019',
                startTime: '2020-01-03',
                endTime: '2020-01-15',
                format: 'rdb'
            });
            expect(result).toContain('sites=11112222');
            expect(result).toContain('format=rdb');
            expect(result).toContain('parameterCd=72019');
            expect(result).not.toContain('period');
            expect(result).toContain('startDT=2020-01-03');
            expect(result).toContain('endDT=2020-01-15');
        });
    });

    describe('fetchGroundwaterLevels', () => {
        let fetchPromise;
        const fetchParameters = {
            siteno: '354133082042203',
            parameterCode: '72019',
            startTime: '2020-01-01',
            endTime: '2020-11-17'
        };

        it('expects properly formated query parameters in service request', () => {
            fetchGroundwaterLevels(fetchParameters);
            const url = fakeServer.requests[0].url;

            expect(url).toContain(`sites=${fetchParameters.siteno}`);
            expect(url).toContain(`parameterCd=${fetchParameters.parameterCode}`);
            expect(url).not.toContain('period');
            expect(url).toContain(`startDT=${fetchParameters.startTime}`);
            expect(url).toContain(`endDT=${fetchParameters.endTime}`);
            expect(url).toContain('format=json');
        });

        it('expects period to be in query parameters if no startDT and endDT', () => {
            fetchGroundwaterLevels({
                siteno: '354133082042203',
                parameterCode: '72019',
                period: 'P7D'
            });
            const url = fakeServer.requests[0].url;

            expect(url).toContain('period=P7D');
            expect(url).not.toContain('startDT');
            expect(url).not.toContain('endDT');
        });

        it('expect no time parameters if all are null', () => {
            fetchGroundwaterLevels({
                site: '354133082042203',
                parameterCode: '72019'
            });
            const url = fakeServer.requests[0].url;

            expect(url).not.toContain('period');
            expect(url).not.toContain('startDT');
            expect(url).not.toContain('endDT');
        });

        it('Successful fetch returns a JSON object with ground water levels', () => {
            fakeServer.respondWith([200, {'Content-type': 'application/json'}, MOCK_GWLEVEL_DATA]);
            fetchPromise = fetchGroundwaterLevels(fetchParameters);
            fakeServer.respond();
            return fetchPromise.then((resp) => {
                expect(resp).toEqual(JSON.parse(MOCK_GWLEVEL_DATA));
            });
        });

        it('Bad fetch returns an empty object', () => {
            fakeServer.respondWith([500, {}, 'Internal server error']);
            fetchPromise = fetchGroundwaterLevels(fetchParameters);
            fakeServer.respond();
            return fetchPromise.then((resp) => {
                expect(resp).toEqual({});
            });
        });
    });
});