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

/*
 * Returns a selector function which returns an array of {Object}. Each object
 * represents a flood level and includes the properties:
 *      @prop {Number} value - the value of the flood level
 *      @prop {String} label - a human friendly label for the flood level
 *      @prop {String} class - a class to be used to decorate the flood level
 */
export const getFloodLevelData = createSelector(
    getWaterwatchFloodLevels,
    levels => {
        const result = [];
        if (levels) {
            Object.keys(levels).forEach(stage => {
                if (levels[stage]) {
                    result.push({
                        value: levels[stage],
                        label: STAGES[stage].label,
                        class: STAGES[stage].class
                    });
                }
            });
        }
        return result;
    }
);