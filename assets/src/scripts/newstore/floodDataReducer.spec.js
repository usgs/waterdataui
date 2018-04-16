const { floodDataReducer } = require('./floodDataReducer');

describe('floodDataReducer', () => {

    describe('SET_FLOOD_FEATURES', () => {
        it('should handle  when gage height is set to less than the the lowest stage', () => {
            expect(floodDataReducer({
                floodGageHeight: 7.5
            }, {
                type: 'SET_FLOOD_FEATURES',
                stages: [9, 10, 11],
                extent: {xmin: -87, ymin: 42, xmax: -86, ymax: 43}
            })).toEqual({
                floodData: {
                    stages: [9, 10, 11],
                    extent: {xmin: -87, ymin: 42, xmax: -86, ymax: 43}
                },
                floodGageHeight: 9
            });
        });

        it('should handle when gage height is set to a value in the flood stages', () => {
            expect(floodDataReducer({
                floodGageHeight: 10.6
            }, {
                type: 'SET_FLOOD_FEATURES',
                stages: [9, 10, 11],
                extent: {xmin: -87, ymin: 42, xmax: -86, ymax: 43}
            })).toEqual({
                floodData: {
                    stages: [9, 10, 11],
                    extent: {xmin: -87, ymin: 42, xmax: -86, ymax: 43}
                },
                floodGageHeight: 11
            });
        });

        it('should handle when gage height is above the height of the largest flood stage', () => {
            expect(floodDataReducer({
                floodGageHeight: 13
            }, {
                type: 'SET_FLOOD_FEATURES',
                stages: [9, 10, 11],
                extent: {xmin: -87, ymin: 42, xmax: -86, ymax: 43}
            })).toEqual({
                floodData: {
                    stages: [9, 10, 11],
                    extent: {xmin: -87, ymin: 42, xmax: -86, ymax: 43}
                },
                floodGageHeight: 11
            });
        });

        it('should not change the gage height if there are no flood stages', () => {
            expect(floodDataReducer({
                floodGageHeight: 10.6
            }, {
                type: 'SET_FLOOD_FEATURES',
                stages: [],
                extent: {}
            })).toEqual({
                floodData: {
                    stages: [],
                    extent: {}
                },
                floodGageHeight: 10.6
            });
        });
    });
});