
const { layoutSelector, ASPECT_RATIO } = require('./layout');

describe('points module', () => {
    it('Should return the width and height with the predefined ASPECT_RATIO', () => {
        let layout = layoutSelector({width: 200, windowWidth: 600});
        expect(layout.width).toEqual(200);
        expect(layout.height).toEqual(200 * ASPECT_RATIO);
        expect(layout.windowWidth).toEqual(600);
    });
});

