import { uiReducer } from './ui-reducer';

describe('uiReducer', () => {

    it('Handles RESIZE_UI', () =>  {
        expect(uiReducer({
            width: 50,
            windowWidth: 100,
            hydrographXRange: undefined
        }, {
            type: 'RESIZE_UI',
            width: 20,
            windowWidth: 50
        })).toEqual({
            width: 20,
            windowWidth: 50,
            hydrographXRange: undefined
        });
    });

    it('Handles SET_HYDROGRAPH_X_RANGE', () => {
        expect(uiReducer({
            width: 50,
            windowWidth: 100,
            hydrographXRange: undefined
        }, {
            type: 'SET_HYDROGRAPH_X_RANGE',
            hydrographXRange: [150000000, 150000100]
        })).toEqual({
            width: 50,
            windowWidth: 100,
            hydrographXRange: {
                start: 150000000,
                end: 150000100
            }
        });
    });

    it('Handles CLEAR_HYDROGRAPH_X_RANGE', () => {
        expect(uiReducer({
            width: 50,
            windowWidth: 100,
            hydrographXRange: {
                start: 150000000,
                end: 150000100
            }
        }, {
            type: 'CLEAR_HYDROGRAPH_X_RANGE'
        })).toEqual({
            width: 50,
            windowWidth: 100,
            hydrographXRange: undefined
        });
    });
});
