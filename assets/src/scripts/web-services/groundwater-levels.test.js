import mockConsole from 'jest-mock-console';
import sinon from 'sinon';

import {MOCK_GWLEVEL_DATA} from 'ui/mock-service-data';

import {fetchGroundwaterLevels} from './groundwater-levels';

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

    describe('fetchGroundwaterLevels', () => {
        let fetchPromise;
        const fetchParameters = {
            site: '354133082042203',
            parameterCode: '72019',
            startDT: '2020-01-01',
            endDT: '2020-11-17'
        };

        it('expects properly formated query parameters in service request', () => {
            fetchGroundwaterLevels(fetchParameters);
            const url = fakeServer.requests[0].url;

            expect(url).toContain(`sites=${fetchParameters.site}`);
            expect(url).toContain(`parameterCd=${fetchParameters.parameterCode}`);
            expect(url).not.toContain('period');
            expect(url).toContain(`startDT=${fetchParameters.startDT}`);
            expect(url).toContain(`endDT=${fetchParameters.endDT}`);
            expect(url).toContain('format=json');
        });

        it('expects period to be in query parameters if no startDT and endDT', () => {
            fetchGroundwaterLevels({
                site: '354133082042203',
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