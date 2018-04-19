const { createSelector } = require('reselect');


export const floodStagesSelector = state => state.floodData.stages;

export const floodExtentSelector = state => state.floodData.extent;

export const floodGageHeightSelector = state => state.floodState.gageHeight;

/*
 * Provides a function which returns True if flood data is not empty.
 */
export const hasFloodDataSelector = createSelector(
    floodStagesSelector,
    (stages) => stages.length > 0
);

/*
 * Provides a function which returns the stage closest to the gageHeight
 */
export const floodStageHeightSelector = createSelector(
    floodStagesSelector,
    floodGageHeightSelector,
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
export const floodGageHeightStageIndexSelector = createSelector(
    floodStagesSelector,
    floodStageHeightSelector,
    (stages, stageHeight) => {
        let result = null;
        if (stageHeight) {
            result = stages.indexOf(stageHeight);
        }
        return result;
    }
);

