const { floodStageHeightSelector, hasFloodDataSelector } = require('./floodDataSelector');

describe('floodDataSelector', () => {

    describe('floodStageHeightSelector', () => {

        it('If stages is empty,null is returned', () => {
            expect(floodStageHeightSelector({
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

            expect(floodStageHeightSelector(state)).toBe(9);

            state = {
                ...state,
                floodState: {
                    gageHeight: 9.5
                }
            };

            expect(floodStageHeightSelector(state)).toBe(10);
        });

        it('If gageHeight is less than any on the stages then return the lowest stage', () => {
            expect(floodStageHeightSelector({
                floodData: {
                    stages: [9, 10, 11]
                },
                floodState: {
                    gageHeight: 7.5
                }
            })).toBe(9);
        });

        it('If gageHeight is greater than any on the stages then return the highest stage', () => {
            expect(floodStageHeightSelector({
                floodData: {
                    stages: [9, 10, 11]
                },
                floodState: {
                    gageHeight: 14.4
                }
            })).toBe(11);
        });
    });

    describe('hasFloodDataSelector', () => {
        it('Return false if no flood stages are available', () =>{
            expect(hasFloodDataSelector({
                floodData: {
                    stages: []
                }
            })).toBeFalsy();
        });

        it('return true if flood stages are available', () => {
            expect(hasFloodDataSelector({
                floodData: {
                    stages: [9, 10, 11]
                }
            })).toBeTruthy();
        });
    });
});