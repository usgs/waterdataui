
import {select} from 'd3-selection';

export const attachToNode = function (store,
                                      node,
                                      {
                                          siteno
                                      } = {}) {
    // Not sure how we will be getting the time series id but for now default to this which will
    // only work for the site USGS-414240072033201
    const TEMP_TIME_SERIES_ID = '36307c899ac14d2eac6956b1bf5ceb69';

    const nodeElem = select(node);
    if (!siteno) {
        select(node).call()
    }
}