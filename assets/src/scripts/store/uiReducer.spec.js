import { uiReducer } from './uiReducer';

describe('uiReducer', () => {

    it('Handles RESIZE_UI', () =>  {
        expect(uiReducer({
            width: 50,
            windowWidth: 100
        }, {
            type: 'RESIZE_UI',
            width: 20,
            windowWidth: 50
        })).toEqual({
            width: 20,
            windowWidth: 50
        });
    });
});
