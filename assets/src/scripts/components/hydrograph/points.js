const { createSelector } = require('reselect');

const { xScaleSelector, yScaleSelector } = require('./scales');


const pointsSelector = function (state, tsDataKey) {
    if (state.tsData[tsDataKey]) {
        return state.tsData[tsDataKey].data;
    }
    return [];
};


const isVisibleSelector = function (state, tsDataKey) {
    if (state.tsData[tsDataKey]) {
        return state.tsData[tsDataKey].show;
    }
    return false;
};


const validPointsSelector = createSelector(
    pointsSelector,
    xScaleSelector,
    yScaleSelector,
    (tsData, xScale, yScale) => {
        let a = tsData
            .filter(d => d.value !== undefined)
            .map(d => {
                return {
                    x: xScale(d.time),
                    y: yScale(d.value)
                };
            });
        return a;
    }
);


module.exports = { pointsSelector, validPointsSelector, isVisibleSelector };
