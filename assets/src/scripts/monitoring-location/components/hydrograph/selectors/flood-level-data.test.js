import {getFloodLevelData} from './flood-level-data';

describe('monitoring-location/components/hydrograph/selectors/flood-level-data', () => {

    describe('getFloodLevelData', () => {
        it('Returns an empty array if no flood data', () => {
            expect(getFloodLevelData({
                floodData: {
                    floodLevels: null
                }
            })).toHaveLength(0);
        });

        it('Returns the expected data for flood data', () => {
            const result = getFloodLevelData({
                floodData: {
                    floodLevels: {
                        action_stage: '5',
                        flood_stage: '10',
                        moderate_flood_stage: '12',
                        major_flood_stage: '14'
                    }
                }
            });
            expect(result).toHaveLength(4);
            expect(result[0].label).toBeDefined();
            expect(result[0].class).toBeDefined();
            expect(result.map(level => level.value)).toEqual([5, 10, 12, 14]);
        });
    });
});