const { createSelector } = require('reselect');

export const hasFloodDataSelector = state => state.floodData.stages.length > 0;

export const floodStageHeightSelector = createSelector(
    state => state.floodData.stages,
    state => state.floodState.gageHeight,
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

