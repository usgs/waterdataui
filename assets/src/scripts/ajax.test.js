import sinon from 'sinon';

import {get} from './ajax';


describe('ajax module', () => {
    describe('get', () => {
        let fakeServer;
        const FAKE_SERVICE = 'https://fake.service.com/request';
        let resolveSpy, rejectSpy;
        beforeEach(() => {
            resolveSpy = jest.fn();
            rejectSpy = jest.fn();
            fakeServer = sinon.createFakeServer();
        });

        afterEach(() => {
            fakeServer.restore();
        });

        it('The url passed to the get command is used to make a request', () => {
            get(FAKE_SERVICE);

            expect(fakeServer.requests).toHaveLength(1);
            expect(fakeServer.requests[0].url).toBe(FAKE_SERVICE);
            expect(fakeServer.requests[0].method).toBe('GET');
        });

        it('Successful request resolves the returned promise with the response', () => {
            fakeServer.respondWith(FAKE_SERVICE, [200, {}, 'Successful response']);
            let p = get(FAKE_SERVICE).then(resolveSpy, rejectSpy);
            fakeServer.respond();
            return p.then(() => {
                expect(resolveSpy).toHaveBeenCalledWith('Successful response');
                expect(rejectSpy).not.toHaveBeenCalled();
            });
        });

        it('Failed request rejects the promise with the status code', () => {
            fakeServer.respondWith(FAKE_SERVICE, [404, {}, 'Information not found']);
            let p = get(FAKE_SERVICE).then(resolveSpy, rejectSpy);
            fakeServer.respond();
            return p.then(() => {
                expect(resolveSpy).not.toHaveBeenCalled();
                expect(rejectSpy).toHaveBeenCalled();
                expect(rejectSpy.mock.calls[rejectSpy.mock.calls.length - 1][0].toString()).toContain('404');
            });
        });

        it('Network error rejects the promise', () => {
            let p = get(FAKE_SERVICE).then(resolveSpy, rejectSpy);
            fakeServer.requests[0].error();
            return p.then(() => {
                expect(resolveSpy).not.toHaveBeenCalled();
                expect(rejectSpy).toHaveBeenCalled();
                expect(rejectSpy.mock.calls[rejectSpy.mock.calls.length - 1][0].toString()).toContain('Network Error');
            });
        });
    });
});
