import {DateTime} from 'luxon';
import {createStructuredSelector} from 'reselect';

import {listen} from '../lib/d3-redux';
import {getCurrentMethodID, getAllMethodsForCurrentVariable, getCurrentDateRangeKind, getCustomTimeRange, getCurrentParmCd}
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
        compare: (state) => state.ivTimeSeriesState.showIVTimeSeries.compare,
        currentDateRangeKind: getCurrentDateRangeKind,
        customTimeRange: getCustomTimeRange,
        timeZone: getIanaTimeZone
    }), ({parameterCode, methodId, methods, compare, currentDateRangeKind, customTimeRange, timeZone}) => {
        let params = new window.URLSearchParams();

        /* filter the 'currentDateRangeKind', which comes in one of two forms
        * 'P{some number}{Day or Year code}' (like P30D or P1Y) or the word 'custom'.
        * In this case, 'custom' is a selection not using the 'period query', such as start and end date calender dates.
        * If the user selection is the default of 'P7D' or of the type 'custom', we will leave it as is.
        * Otherwise, we will filter the code so it is generic and in the form of 'P'
        * so that it will work for any arbitrary number of days in query parameters such as P20D.
        */
        const filteredCurrentDateRangeKind =
            currentDateRangeKind === 'P7D' ? 'P7D' :
            currentDateRangeKind !== 'custom' ? currentDateRangeKind.substr(0, 1) : currentDateRangeKind;

        if (parameterCode) {
            params.set('parameterCode', parameterCode);
        }

        if (Object.keys(methods).length > 1) {
            params.set('timeSeriesId', methodId);
        }
        console.log('filteredCurrentDateRangeKind ', filteredCurrentDateRangeKind)
        switch(filteredCurrentDateRangeKind) {
            case 'P7D':
                break;
            case  'P':
                params.set('period', currentDateRangeKind);
                break;
            case 'custom':
                params.set(
                    'startDT',
                    DateTime.fromMillis(customTimeRange.start, {zone: timeZone}).toFormat('yyyy-LL-dd'));
                params.set(
                    'endDT',
                    DateTime.fromMillis(customTimeRange.end, {zone: timeZone}).toFormat('yyyy-LL-dd'));
        }
        if (compare) {
            params.set('compare', true);
        }

        window.location.hash = `#${params.toString()}`;
    });
};
