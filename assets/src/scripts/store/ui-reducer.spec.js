import { uiReducer } from './ui-reducer';

describe('uiReducer', () => {

    it('Handles RESIZE_UI', () =>  {
        expect(uiReducer({
            width: 50,
            windowWidth: 100,
            hydrographBrushOffset: undefined
        }, {
            type: 'RESIZE_UI',
            width: 20,
            windowWidth: 50
        })).toEqual({
            width: 20,
            windowWidth: 50,
            hydrographBrushOffset: undefined
        });
    });

    it('Handles SET_HYDROGRAPH_BRUSH_OFFSET', () => {
        expect(uiReducer({
            width: 50,
            windowWidth: 100,
            hydrographBrushOffset: undefined
        }, {
            type: 'SET_HYDROGRAPH_BRUSH_OFFSET',
            hydrographBrushOffset: [1000, 10000000]
        })).toEqual({
            width: 50,
            windowWidth: 100,
            hydrographBrushOffset: {
                start: 1000,
                end: 10000000
            }
        });
    });

    it('Handles CLEAR_HYDROGRAPH_BRUSH_OFFSET', () => {
        expect(uiReducer({
            width: 50,
            windowWidth: 100,
            hydrographBrushOffset: {
                start: 1000,
                end: 10000000
            }
        }, {
            type: 'CLEAR_HYDROGRAPH_BRUSH_OFFSET'
        })).toEqual({
            width: 50,
            windowWidth: 100,
            hydrographBrushOffset: undefined
        });
    });
});
