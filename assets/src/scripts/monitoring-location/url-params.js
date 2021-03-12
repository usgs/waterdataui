import {createStructuredSelector} from 'reselect';

import {listen} from 'ui/lib/d3-redux';
import {getPrimaryMethods} from 'ml/selectors/hydrograph-data-selector';
import {isCompareIVDataVisible, getSelectedIVMethodID, getSelectedDateRange, getSelectedCustomDateRange,
    getSelectedParameterCode
} from 'ml/selectors/hydrograph-state-selector';

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
        parameterCode: getSelectedParameterCode,
        methodId: getSelectedIVMethodID,
        methods: getPrimaryMethods,
        compare: isCompareIVDataVisible,
        currentDateRange: getSelectedDateRange,
        customDateRange: getSelectedCustomDateRange
    }), ({parameterCode, methodId, methods, compare, currentDateRange, customDateRange}) => {
        let params = new window.URLSearchParams();

        /* filter the 'currentDateRange', which comes in one of two forms
        * 'P{some number}{Day or Year code}' (like P30D or P1Y) or the word 'custom'.
        * In this case, 'custom' is a selection not using the 'period query', such as start and end date calendar dates.
        * If the user selection is the default of 'P7D' or of the type 'custom', we will leave it as is.
        * Otherwise, we will filter the code so it is generic and in the form of 'P'
        * so that it will work for any arbitrary number of days in query parameters such as P20D.
        */
        const filteredCurrentDateRange =
            currentDateRange === 'P7D' ? 'P7D' :
            currentDateRange === 'custom' ? currentDateRange :
            currentDateRange !== null ? currentDateRange.substr(0, 1) : '';

        if (parameterCode) {
            params.set('parameterCode', parameterCode);
        }

        if (Object.keys(methods).length > 1) {
            params.set('timeSeriesId', methodId);
        }

        switch(filteredCurrentDateRange) {
            case 'P7D':
                break;
            case  'P':
                params.set('period', currentDateRange);
                break;
            case 'custom':
                params.set('startDT', customDateRange.start);
                params.set('endDT', customDateRange.end);
        }
        if (compare) {
            params.set('compare', true);
        }

        window.location.hash = `#${params.toString()}`;
    });
};
