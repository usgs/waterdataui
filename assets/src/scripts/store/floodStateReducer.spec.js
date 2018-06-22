import { floodStateReducer } from './floodStateReducer';

describe('floodStateReducer', () => {

    describe('SET_GAGE_HEIGHT', () => {
        it('Expects that the gage height is changed to the new value', () => {
            expect(floodStateReducer({
                gageHeight: 10
            }, {
                type: 'SET_GAGE_HEIGHT',
                gageHeight: 20
            })).toEqual({
                gageHeight: 20
            });
        });
    });
});