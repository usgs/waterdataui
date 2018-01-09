import Hydrograph from './hydrograph';


describe('Hydrograph charting module', function () {
    it('empty graph displays warning', () => {
        let graph = new Hydrograph({});
        expect(graph._element.innerHTML).toContain('No data is available');
    });

    it('single data point renders', () => {
        let graph = new Hydrograph({data: [{
            time: new Date(),
            value: 10,
            label: 'Label'
        }]});
        expect(graph._element.innerHTML).toContain('hydrograph-container');
    });
});
