const { createSelector } = require('reselect');

export const floodStageSelector = createSelector(
    state => state.floodData.stages,
    state => state.floodState.gageHeight,
    (stages, gageHeight) => {
        let result = gageHeight;
        if (stages.length) {
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

