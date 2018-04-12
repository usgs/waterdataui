const { floodDataReducer } = require('./floodDataReducer');

fdescribe('floodDataReducer', () => {

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
                    extent: {xmin: -87, ymin: 42, xmax: -86, ymax: 43},
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
                    extent: {xmin: -87, ymin: 42, xmax: -86, ymax: 43},
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

    describe('SET_GAGE_HEIGHT_FROM_STAGE', () => {
        it('Should update the gage height if the index is with the flood data stages', () => {
            expect(floodDataReducer({
                floodData : {
                    stages: [9, 10, 11]
                },
                floodGageHeight: 9
            }, {
                type: 'SET_GAGE_HEIGHT_FROM_STAGE',
                gageHeightIndex: 1
            })).toEqual({
                floodData: {
                    stages: [9, 10, 11]
                },
                floodGageHeight: 10
            });
        });

        it('Should not update the gage height if there are no stages', () => {
            expect(floodDataReducer({
                floodData : {
                    stages: []
                },
                floodGageHeight: 9
            }, {
                type: 'SET_GAGE_HEIGHT_FROM_STAGE',
                gageHeightIndex: 1
            })).toEqual({
                floodData: {
                    stages: []
                },
                floodGageHeight: 9
            });
        });

        it('Should not update the gage height if the index is greater than the number of stages', () => {
            expect(floodDataReducer({
                floodData : {
                    stages: [9, 10, 11]
                },
                floodGageHeight: 9
            }, {
                type: 'SET_GAGE_HEIGHT_FROM_STAGE',
                gageHeightIndex: 3
            })).toEqual({
                floodData: {
                    stages: [9, 10, 11]
                },
                floodGageHeight: 9
            });
        });
    });

    describe('SET_GAGE_HEIGHT', () => {
        it('Should set the gage height to the stage closest to the height set in the action', () => {
            expect(floodDataReducer({
                floodData : {
                    stages: [9, 10, 11]
                },
                floodGageHeight: 9
            }, {
                type: 'SET_GAGE_HEIGHT',
                gageHeight: 9.6
            })).toEqual({
                floodData: {
                    stages: [9, 10, 11]
                },
                floodGageHeight: 10
            });
            expect(floodDataReducer({
                floodData : {
                    stages: [9, 10, 11]
                },
                floodGageHeight: 9
            }, {
                type: 'SET_GAGE_HEIGHT',
                gageHeight: 10.4
            })).toEqual({
                floodData: {
                    stages: [9, 10, 11]
                },
                floodGageHeight: 10
            });
        });

        it('Should set the gage height to the lowest stage if the gage height in the action is less than the lowest stage', () => {
            expect(floodDataReducer({
                floodData : {
                    stages: [9, 10, 11]
                },
                floodGageHeight: 10
            }, {
                type: 'SET_GAGE_HEIGHT',
                gageHeight: 7
            })).toEqual({
                floodData: {
                    stages: [9, 10, 11]
                },
                floodGageHeight: 9
            });
        });

        it('Should set the gage height to the highest stage if the gage height in the action is greater than the highest stage', () => {
            expect(floodDataReducer({
                floodData : {
                    stages: [9, 10, 11]
                },
                floodGageHeight: 10
            }, {
                type: 'SET_GAGE_HEIGHT',
                gageHeight: 13
            })).toEqual({
                floodData: {
                    stages: [9, 10, 11]
                },
                floodGageHeight: 11
            });
        });


        it('Should set gage height to the value in the action if there are no flood stages', () => {
            expect(floodDataReducer({
                floodData : {
                    stages: []
                },
                floodGageHeight: 9
            }, {
                type: 'SET_GAGE_HEIGHT',
                gageHeight: 9.6
            })).toEqual({
                floodData: {
                    stages: []
                },
                floodGageHeight: 9.6
            });
        });
    });
});