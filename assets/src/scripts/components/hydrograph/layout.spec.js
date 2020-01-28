import { format } from 'd3-format';

import { getMainLayout, getBrushLayout, ASPECT_RATIO, BRUSH_HEIGHT } from './layout';

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

    it('Should return the width and the height with the height set to the BRUSH_HEIGHT for the brush layout', () => {
        const layout = getBrushLayout.resultFunc(200, 600, {
            tickValues: [5, 10, 15],
            tickFormat: format('d')
        });

        expect(layout.width).toEqual(200);
        expect(layout.height).toEqual(BRUSH_HEIGHT);
        expect(layout.windowWidth).toEqual(600);
    });
});
