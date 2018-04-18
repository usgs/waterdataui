const proxyquire = require('proxyquireify')(require);
const { format } = require('d3-format');

const { ASPECT_RATIO } = require('./layout');

describe('points module', () => {
    let layoutMock = proxyquire('./layout', {
        './domain': {
            tickSelector: () => {
                return {
                    tickValues: [5, 10, 15],
                    tickFormat: format('d')
                };
            }
        }
    });

    it('Should return the width and height with the predefined ASPECT_RATIO', () => {
        let layout = layoutMock.layoutSelector({
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

