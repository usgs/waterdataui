import { format } from 'd3-format';

import { ASPECT_RATIO, layoutSelectorFactory } from './layout';


describe('points module', () => {
    it('Should return the width and height with the predefined ASPECT_RATIO', () => {
        const layoutSelector = layoutSelectorFactory(function () {
            return {
                tickValues: [5, 10, 15],
                tickFormat: format('d')
            };
        });
        const layout = layoutSelector({
            ui: {
                width: 200,
                windowWidth: 600
            }
        });

        expect(layout.width).toEqual(200);
        expect(layout.height).toEqual(200 * ASPECT_RATIO);
        expect(layout.windowWidth).toEqual(600);
    });
});
