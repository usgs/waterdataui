
import {select} from 'd3-selection';

import {link} from '../../lib/d3-redux';
import {hasObservationsTimeSeries} from '../../selectors/observations-selector';
import {Actions} from '../../store';

import {drawErrorAlert, drawInfoAlert} from '../../d3-utils/alerts';
import {drawTimeSeriesGraph} from "./time-series-graph";

const TEMP_TIME_SERIES_ID = '36307c899ac14d2eac6956b1bf5ceb69';

export const attachToNode = function (store,
                                      node,
                                      {
                                          siteno,
                                          timeSeriesId=TEMP_TIME_SERIES_ID
                                      } = {}) {
    // Not sure how we will be getting the time series id but for now default to this which will
    // only work for the site USGS-414240072033201

    const nodeElem = select(node);
    if (!siteno) {
        nodeElem.call(drawErrorAlert, {
            title: 'Must specify monitoring location ID',
            body: ''
        });
    }

    store.dispatch(Actions.retrieveDailyValueData(`USGS-${siteno}`, TEMP_TIME_SERIES_ID))
        .then(() => {
            if (Object.keys(store.getState().observationsData.timeSeries[TEMP_TIME_SERIES_ID]).length === 0) {
                drawInfoAlert(nodeElem, {
                    title: 'No Data',
                    body: 'There is no ground water level daily data available for this site'
                });
            } else {
                nodeElem.append('div').text('Was able to retrieve data');
            }
        });

        let graphContainer = nodeElem.select('.graph-container')
            .call(link(store, function(container, showElem) {
                container.attr('hidden', showElem ? null : true);
            }, hasObservationsTimeSeries))
            .call(drawTimeSeriesGraph, store, timeSeriesId);

};