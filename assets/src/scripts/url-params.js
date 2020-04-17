import {DateTime} from 'luxon';
import {createStructuredSelector} from 'reselect';

import {listen} from './lib/d3-redux';
import {getCurrentMethodID, getAllMethodsForCurrentVariable, getCurrentDateRange, getCustomTimeRange, getCurrentParmCd}
    from './selectors/time-series-selector';
import {getIanaTimeZone} from './selectors/time-zone-selector';

/*
 * Return {String} hash part of url minus the leading '#'.
 */
export const getParamString = function() {
    const hash = window.location.hash;
    return hash.length ? hash.substring(1) : '';
};

export const renderTimeSeriesUrlParams = function(store) {
// subscribe to selectors for setting url parameter state
    listen(store, createStructuredSelector({
        parameterCode: getCurrentParmCd,
        methodId: getCurrentMethodID,
        methods: getAllMethodsForCurrentVariable,
        compare: (state) => state.timeSeriesState.showSeries.compare,
        currentDateRange: getCurrentDateRange,
        customTimeRange: getCustomTimeRange,
        timeZone: getIanaTimeZone
    }), ({parameterCode, methodId, methods, compare, currentDateRange, customTimeRange, timeZone}) => {
        let params = new window.URLSearchParams();
        if (parameterCode) {
            params.set('parameterCode', parameterCode);
        }
        if (Object.keys(methods).length > 1) {
            params.set('timeSeriesId', methodId);
        }
        switch(currentDateRange) {
            case 'P30D':
            case 'P1Y':
                params.set('period', currentDateRange);
                break;
            case 'custom':
                params.set(
                    'startDT',
                    DateTime.fromMillis(customTimeRange.startDT, {zone: timeZone}).toFormat('yyyy-LL-dd'));
                params.set(
                    'endDT',
                    DateTime.fromMillis(customTimeRange.endDT, {zone: timeZone}).toFormat('yyyy-LL-dd'));
        }
        if (compare) {
            params.set('compare', true);
        }

        window.location.hash = `#${params.toString()}`;
    });
};
