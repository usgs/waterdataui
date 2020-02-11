import { format } from 'd3-format';

import { getMainLayout, ASPECT_RATIO } from './layout';

describe('layout module', () => {

    it('Should return the width and height with the predefined ASPECT_RATIO for the main layout', () => {
        const layout = getMainLayout.resultFunc(200, 600, {
            tickValues: [5, 10, 15],
            tickFormat: format('d')
        });

        expect(layout.width).toEqual(200);
        expect(layout.height).toEqual(200 * ASPECT_RATIO);
        expect(layout.windowWidth).toEqual(600);
    });
});
