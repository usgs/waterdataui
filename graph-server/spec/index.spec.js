const decache = require('decache');
const request = require('supertest');


describe('Graph server', () => {
    let server;

    beforeEach(() => {
        server = require('../src');
    });

    afterEach(function () {
        server.close();
        decache('../src');
    });

    it('returns SVG at /monitoring-location/<site-id>/', (done) => {
        request(server)
            .get('/monitoring-location/05370000/?parameterCode=00060')
            .expect('Content-Type', 'image/svg+xml; charset=utf-8')
            .expect(200, done);
    });
});
