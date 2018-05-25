import { format } from 'd3-format';

const LayoutInjector = require('inject-loader!./layout');


describe('points module', () => {
    let Layout;

    beforeEach(() => {
        Layout = LayoutInjector({
            './domain': {
                tickSelector: function () {
                    return {
                        tickValues: [5, 10, 15],
                        tickFormat: format('d')
                    };
                }
            }
        });
    });

    it('Should return the width and height with the predefined ASPECT_RATIO', () => {
        let layout = Layout.layoutSelector({
            ui: {
                width: 200,
                windowWidth: 600
            }
        });

        expect(layout.width).toEqual(200);
        expect(layout.height).toEqual(200 * Layout.ASPECT_RATIO);
        expect(layout.windowWidth).toEqual(600);
    });
});
