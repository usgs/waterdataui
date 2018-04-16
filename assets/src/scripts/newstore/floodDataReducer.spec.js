const { floodDataReducer } = require('./floodDataReducer');

describe('floodDataReducer', () => {

    describe('SET_FLOOD_FEATURES', () => {
        it('should handle setting the floodData', () => {
            expect(floodDataReducer({}, {
                type: 'SET_FLOOD_FEATURES',
                stages: [9, 10, 11],
                extent: {xmin: -87, ymin: 42, xmax: -86, ymax: 43}
            })).toEqual({
                floodData: {
                    stages: [9, 10, 11],
                    extent: {xmin: -87, ymin: 42, xmax: -86, ymax: 43}
                }
            });
        });
    });
});