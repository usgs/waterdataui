import {select} from 'd3-selection';
import includes from 'lodash/includes';

import {getAvailableDVTimeSeries} from '../../selectors/observations-selector';
import {retrieveAvailableDVTimeSeries, retrieveDVTimeSeries} from '../../store/observations';

import {drawErrorAlert, drawInfoAlert} from '../../d3-rendering/alerts';
import {drawLoadingIndicator} from '../../d3-rendering/loading-indicator';

import {drawTimeSeriesGraph} from './time-series-graph';
import {drawTooltipCursorSlider} from './tooltip';
import {drawTimeSeriesLegend} from './legend';
import {drawGraphBrush} from './graph-brush';

const GROUND_WATER_LEVELS_PARM_CD  = ['62610', '62611', '72019', '72020', '72150', '72226', '72227', '72228', '72229', '72230', '72231', '72232'];
const MAX_STATISTIC_CODE = '00001';

const getDefaultTimeSeriesId = function(availableTimeSeries) {
    const groundWaterTimeSeries = availableTimeSeries
        .filter(ts => includes(GROUND_WATER_LEVELS_PARM_CD, ts.parameterCode))
        .filter(ts => ts.statisticCode === MAX_STATISTIC_CODE);
    if (groundWaterTimeSeries.length === 0) {
        return undefined;
    } else {
        // TODO: This code to split the id will be removed as part of IOW-444 once the time-series-service has been updated.
        const splitIds = groundWaterTimeSeries[0]['id'].split('-');
        return splitIds[2];
    }


};
/*
 * Creates the daily value hydrograph component on the DOM element node for siteno and state
 * information that is stored in the Redux store.
 * @param {Object} store - Redux store
 * @param {Object} node - DOM element parent for this component
 * @param {String} siteno - the site number of the monitoring location.
 */
export const attachToNode = function (store,
                                      node,
                                      {
                                          siteno
                                      } = {}) {
    const nodeElem = select(node);
    if (!siteno) {
        nodeElem.call(drawErrorAlert, {
            title: 'Must specify monitoring location ID',
            body: ''
        });
        return;
    }

    const monitoringLocationId = `USGS-${siteno}`;
    const loadingIndicator = nodeElem.select('.loading-indicator-container')
        .call(drawLoadingIndicator, {showLoadingIndicator: true, sizeClass: 'fa-3x'});
    const fetchAvailableDVTimeSeries = store.dispatch(retrieveAvailableDVTimeSeries(monitoringLocationId));
    fetchAvailableDVTimeSeries.then(() => {
        const defaultTimeSeriesId = getDefaultTimeSeriesId(getAvailableDVTimeSeries(store.getState()));
        if (defaultTimeSeriesId) {
            store.dispatch(retrieveDVTimeSeries(monitoringLocationId, defaultTimeSeriesId))
                .then(() => {
                    loadingIndicator.call(drawLoadingIndicator, {showLoadingIndicator: false, sizeClass: 'fa-3x'});
                    let graphContainer = nodeElem.select('.graph-container');
                    graphContainer
                        .call(drawTimeSeriesGraph, store)
                        .call(drawTooltipCursorSlider, store)
                        .call(drawGraphBrush, store)
                        .append('div')
                            .classed('dv-legend-controls-container', true)
                            .call(drawTimeSeriesLegend, store);
                });
        } else {
            loadingIndicator.call(drawLoadingIndicator, {showLoadingIndicator: false, sizeClass: 'fa-3x'});
            drawInfoAlert(nodeElem, {
                title: 'No Max Daily Value Data',
                body: 'There is no ground water level maximum daily data available for this site'
            });
        }
    });
};
