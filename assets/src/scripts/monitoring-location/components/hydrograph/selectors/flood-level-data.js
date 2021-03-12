import {createSelector} from 'reselect';

import {getWaterwatchFloodLevels} from 'ml/selectors/flood-data-selector';

const STAGES = {
    actionStage: {
        label: 'Action stage',
        class: 'action-stage'
    },
    floodStage: {
        label: 'Flood stage',
        class: 'flood-stage'
    },
    moderateFloodStage: {
        label: 'Moderate flood stage',
        class: 'moderate-flood-stage'
    },
    majorFloodStage: {
        label: 'Major flood stage',
        class: 'major-flood-stage'
    }
};

export const getFloodLevelData = createSelector(
    getWaterwatchFloodLevels,
    levels => {
        const result = [];
        Object.keys(levels).forEach(stage => {
            if (levels[stage]) {
                result.push({
                    value: levels[stage],
                    label: STAGES[stage].label,
                    class: STAGES[stage].class
                });
            }
        });
        return result;
    }
);