const { floodStageSelector } = require('./floodDataSelector');

describe('floodDataSelector', () => {

    describe('floodStageSelector', () => {

        it('If stages is empty, the gageHeight in the state is returned', () => {
            expect(floodStageSelector({
                floodData: {
                    stages: []
                },
                floodState: {
                    gageHeight: 21
                }
            })).toBe(21);
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

            expect(floodStageSelector(state)).toBe(9);

            state = {
                ...state,
                floodState: {
                    gageHeight: 9.5
                }
            };

            expect(floodStageSelector(state)).toBe(10);
        });

        it('If gageHeight is less than any on the stages then return the lowest stage', () => {
            expect(floodStageSelector({
                floodData: {
                    stages: [9, 10, 11]
                },
                floodState: {
                    gageHeight: 7.5
                }
            })).toBe(9);
        });

        it('If gageHeight is greater than any on the stages then return the highest stage', () => {
            expect(floodStageSelector({
                floodData: {
                    stages: [9, 10, 11]
                },
                floodState: {
                    gageHeight: 14.4
                }
            })).toBe(11);
        });
    });
});