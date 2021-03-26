import {createStructuredSelector} from 'reselect';

import {listen} from 'ui/lib/d3-redux';

import {getPrimaryMethods} from 'ml/selectors/hydrograph-data-selector';
import {isCompareIVDataVisible, getSelectedIVMethodID, getSelectedTimeSpan,
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
        timeSpan: getSelectedTimeSpan
    }), ({parameterCode, methodId, methods, compare, timeSpan}) => {
        const timeSpanIsDuration = typeof timeSpan === 'string';
        let params = new window.URLSearchParams();

        if (parameterCode) {
            params.set('parameterCode', parameterCode);
        }

        if (Object.keys(methods).length > 1) {
            params.set('timeSeriesId', methodId);
        }
        if (timeSpan) {
            if (timeSpanIsDuration) {
                params.set('period', timeSpan);
            } else {
                params.set('startDT', timeSpan.start);
                params.set('endDT', timeSpan.end);
            }
        }

        if (compare) {
            params.set('compare', true);
        }

        window.location.hash = `#${params.toString()}`;
    });
};
