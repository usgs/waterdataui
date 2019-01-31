import { get } from './ajax';

describe('ajax module', () => {
    describe('get', () => {

        const FAKE_SERVICE = 'https://fake.service.com/request';
        let resolveSpy, rejectSpy;
        beforeEach(() => {
            resolveSpy = jasmine.createSpy('resolveSpy');
            rejectSpy = jasmine.createSpy('rejectSpy');
            jasmine.Ajax.install();
        });

        afterEach(() => {
            jasmine.Ajax.uninstall();
        });

        it('The url passed to the get command is used to make a request', () => {
            get(FAKE_SERVICE);
            const requests = jasmine.Ajax.requests;
            const thisRequest = requests.mostRecent();

            expect(requests.count()).toBe(1);
            expect(thisRequest.url).toBe(FAKE_SERVICE);
            expect(thisRequest.method).toBe('GET');
        });

        it('Successful request resolves the returned promise with the response', (done) => {
            jasmine.Ajax.stubRequest(FAKE_SERVICE).andReturn({
                status: 200,
                response: 'Successful response'
            });
            let p = get(FAKE_SERVICE).then(resolveSpy, rejectSpy);
            p.then(() => {
                expect(resolveSpy).toHaveBeenCalledWith('Successful response');
                expect(rejectSpy).not.toHaveBeenCalled();
                done();
            });
        });

        it('Failed request rejects the promise with the status code', (done) => {
            jasmine.Ajax.stubRequest(FAKE_SERVICE).andReturn({
                status: 404,
                statusText: 'Information not found'
            });
            let p = get(FAKE_SERVICE).then(resolveSpy, rejectSpy);
            p.then(() => {
                expect(resolveSpy).not.toHaveBeenCalled();
                expect(rejectSpy).toHaveBeenCalled();
                expect(rejectSpy.calls.mostRecent().args[0].toString()).toContain('404');
                done();
            });
        });

        it('Network error rejects the promise', (done) => {
            jasmine.Ajax.stubRequest(FAKE_SERVICE).andError();
            let p = get(FAKE_SERVICE).then(resolveSpy, rejectSpy);
            p.then(() => {
                expect(resolveSpy).not.toHaveBeenCalled();
                expect(rejectSpy).toHaveBeenCalled();
                expect(rejectSpy.calls.mostRecent().args[0].toString()).toContain('Network Error');
                done();
            });
        });
    });
});
