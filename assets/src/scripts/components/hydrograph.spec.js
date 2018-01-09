import Hydrograph from './hydrograph';


describe('Hydrograph should do stuff', function () {
    let graph;

    beforeEach(() => {
        graph = new Hydrograph({});
    });

    it('graph exists', () => {
        expect(graph).not.toBe(null);
    });
});
