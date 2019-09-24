import { format } from 'd3-format';

import { layoutSelector, ASPECT_RATIO } from './layout';

describe('points module', () => {
    it('Should return the width and height with the predefined ASPECT_RATIO', () => {
        const layout = layoutSelector.resultFunc(200, 600, {
            tickValues: [5, 10, 15],
            tickFormat: format('d')
        });

        expect(layout.width).toEqual(200);
        expect(layout.height).toEqual(200 * ASPECT_RATIO);
        expect(layout.windowWidth).toEqual(600);
        expect(layout.margin).toEqual({
            top: 25,
            right: 45,
            bottom: 10,
            left: 65
        });
    });
});
