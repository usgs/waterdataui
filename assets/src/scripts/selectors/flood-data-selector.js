import { createSelector } from 'reselect';


export const getFloodStages = state => state.floodData.stages || [];

export const getFloodExtent = state => state.floodData.extent || {};

export const getFloodGageHeight = state => state.floodState.gageHeight;

export const getWaterwatchActionStage = state => state.floodState.actionStage;
export const getWaterwatchFloodStage = state => state.floodState.floodStage;
export const getWaterwatchModerateFloodStage = state => state.floodState.moderateFloodStage;
export const getWaterwatchMajorFloodStage = state => state.floodState.majorFloodStage;

/*
 * Provides a function which returns True if flood data is not empty.
 */
export const hasFloodData = createSelector(
    getFloodStages,
    (stages) => stages.length > 0
);

/*
 * Provides a function which returns True if waterwatch flood levels is not empty.
 */
export const hasWaterwatchData = createSelector(
    getWaterwatchActionStage,
    getWaterwatchFloodStage,
    getWaterwatchModerateFloodStage,
    getWaterwatchMajorFloodStage,
    (actionStage, floodStage, moderateFloodStage, majorFloodStage) =>
        actionStage != null ||
        floodStage != null ||
        moderateFloodStage != null ||
        majorFloodStage != null
);

/*
 * Provides a function which returns the stage closest to the gageHeight
 */
export const getFloodStageHeight = createSelector(
    getFloodStages,
    getFloodGageHeight,
    (stages, gageHeight) => {
        let result = null;
        if (stages.length && gageHeight) {
            result = stages[0];
            let diff = Math.abs(gageHeight - result);
            stages.forEach((stage) => {
                let newDiff = Math.abs(gageHeight - stage);
                if (newDiff <= diff) {
                    diff = newDiff;
                    result = stage;
                }
            });
        }
        return result;
    }
);

/*
 * Provides a function which returns the stage index closest to the gageHeight
 */
export const getFloodGageHeightStageIndex= createSelector(
    getFloodStages,
    getFloodStageHeight,
    (stages, stageHeight) => {
        let result = null;
        if (stageHeight) {
            result = stages.indexOf(stageHeight);
        }
        return result;
    }
);

/*
 * Provides a function which returns the Waterwatch Flood Levels
 */
export const getWaterwatchFloodLevels = createSelector(
    getWaterwatchActionStage,
    getWaterwatchFloodStage,
    getWaterwatchModerateFloodStage,
    getWaterwatchMajorFloodStage,
    (actionStage, floodStage, moderateFloodStage, majorFloodStage) => {
        return [actionStage, floodStage, moderateFloodStage, majorFloodStage];
    }
);

