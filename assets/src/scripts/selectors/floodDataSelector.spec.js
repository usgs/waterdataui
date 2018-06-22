import { getFloodStageHeight, hasFloodData, getFloodGageHeightStageIndex } from './floodDataSelector';

describe('floodDataSelector', () => {

    describe('getFloodStageHeight', () => {

        it('If stages is empty,null is returned', () => {
            expect(getFloodStageHeight({
                floodData: {
                    stages: []
                },
                floodState: {
                    gageHeight: 21
                }
            })).toBeNull();
        });

        it('If stages is not empty, the gageHeight returned is set to the closest stage', () => {
            let state = {
                floodData: {
                    stages: [9, 10, 11]
                },
                floodState: {
                    gageHeight: 9.4
                }
            };

            expect(getFloodStageHeight(state)).toBe(9);

            state = {
                ...state,
                floodState: {
                    gageHeight: 9.5
                }
            };

            expect(getFloodStageHeight(state)).toBe(10);
        });

        it('If gageHeight is less than any on the stages then return the lowest stage', () => {
            expect(getFloodStageHeight({
                floodData: {
                    stages: [9, 10, 11]
                },
                floodState: {
                    gageHeight: 7.5
                }
            })).toBe(9);
        });

        it('If gageHeight is greater than any on the stages then return the highest stage', () => {
            expect(getFloodStageHeight({
                floodData: {
                    stages: [9, 10, 11]
                },
                floodState: {
                    gageHeight: 14.4
                }
            })).toBe(11);
        });
    });

    describe('hasFloodData', () => {
        it('Return false if no flood stages are available', () =>{
            expect(hasFloodData({
                floodData: {
                    stages: []
                }
            })).toBeFalsy();
        });

        it('return true if flood stages are available', () => {
            expect(hasFloodData({
                floodData: {
                    stages: [9, 10, 11]
                }
            })).toBeTruthy();
        });
    });

    describe('getFloodGageHeightStageIndex', () => {
        it('If stages is empty,null is returned', () => {
            expect(getFloodGageHeightStageIndex({
                floodData: {
                    stages: []
                },
                floodState: {
                    gageHeight: 21
                }
            })).toBeNull();
        });

        it('If stages is not empty, the index returned is set to the closest stage', () => {
            let state = {
                floodData: {
                    stages: [9, 10, 11]
                },
                floodState: {
                    gageHeight: 9.4
                }
            };

            expect(getFloodGageHeightStageIndex(state)).toBe(0);

            state = {
                ...state,
                floodState: {
                    gageHeight: 9.5
                }
            };

            expect(getFloodGageHeightStageIndex(state)).toBe(1);
        });

        it('If gageHeight is less than any on the stages then return the 0', () => {
            expect(getFloodGageHeightStageIndex({
                floodData: {
                    stages: [9, 10, 11]
                },
                floodState: {
                    gageHeight: 7.5
                }
            })).toBe(0);
        });

        it('If gageHeight is greater than any on the stages then return the highest stage', () => {
            expect(getFloodGageHeightStageIndex({
                floodData: {
                    stages: [9, 10, 11]
                },
                floodState: {
                    gageHeight: 14.4
                }
            })).toBe(2);
        });
    });
});