import config from 'ui/config';

import {isCompareIVDataVisible, isMedianDataVisible, getSelectedDateRange, getSelectedCustomDateRange,
    getSelectedParameterCode, getSelectedIVMethodID, getGraphCursorOffset, getGraphBrushOffset,
    getInputsForRetrieval
} from './hydrograph-state-selector';

describe('monitoring-location/selectors/hydrograph-state-selector', () => {
    config.locationTimeZone = 'America/Chicago';
    describe('isCompareIVDataVisible', () => {
        it('returns false if no compare iv data visible', () => {
            expect(isCompareIVDataVisible({
                hydrographState: {}
            })).toBe(false);
        });

        it('Returns true if set in the store', () => {
            expect(isCompareIVDataVisible({
                hydrographState: {
                    showCompareIVData: true
                }
            })).toBe(true);
        });
    });

    describe('isMedianDataVisible', () => {
        it('returns false if no median data visible', () => {
            expect(isMedianDataVisible({
                hydrographState: {}
            })).toBe(false);
        });

        it('Returns true if set in the store', () => {
            expect(isMedianDataVisible({
                hydrographState: {
                    showMedianData: true
                }
            })).toBe(true);
        });
    });

    describe('getSelectedDateRange', () => {
       it('Returns null if no selected date range', () => {
           expect(getSelectedDateRange({
               hydrographState: {}
           })).toBeNull();
       });

       it('Returns selected date range', () => {
           expect(getSelectedDateRange({
               hydrographState: {
                   selectedDateRange: 'P45D'
               }
           })).toEqual('P45D');
       });
    });

    describe('getSelectedCustomDateRange', () => {
        it('Returns null if no selected custom date range', () => {
            expect(getSelectedCustomDateRange({
                hydrographState: {}
            })).toBeNull();
        });

        it('Returns selected custom date range', () => {
            expect(getSelectedCustomDateRange({
                hydrographState: {
                    selectedCustomDateRange: {
                        start: '2021-02-01',
                        end: '2021-02-06'
                    }
                }
            })).toEqual({
                start: '2021-02-01',
                end: '2021-02-06'
            });
        });
    });

    describe('getSelectedIVMethodID', () => {
        it('Returns null if no selected method id', () => {
            expect(getSelectedIVMethodID({
                hydrographState: {}
            })).toBeNull();
        });

        it('Returns selected IV method id', () => {
            expect(getSelectedIVMethodID({
                hydrographState: {
                    selectedIVMethodID: '90649'
                }
            })).toEqual('90649');
        });
    });

    describe('getGraphCursorOffset', () => {
        it('Returns null if no graph cursor offset', () => {
            expect(getGraphCursorOffset({
                hydrographState: {}
            })).toBeNull();
        });

        it('Returns graph cursor offset', () => {
            expect(getGraphCursorOffset({
                hydrographState: {
                    graphCursorOffset: 362866473
                }
            })).toEqual(362866473);
        });
    });

    describe('getGraphBushOffset', () => {
        it('Returns null if no graph brush offset', () => {
            expect(getGraphBrushOffset({
                hydrographState: {}
            })).toBeNull();
        });

        it('Returns graph brush offset', () => {
            expect(getGraphBrushOffset({
                hydrographState: {
                    graphBrushOffset: {
                        start: 0,
                        end: 60945089
                    }
                }
            })).toEqual({
                start: 0,
                end: 60945089
            });
        });
    });

    describe('getSelectedParameterCode', () => {
       it('Returns null if no selected parameter code', () => {
           expect(getSelectedParameterCode({
               hydrographState: {}
           })).toBeNull();
       });

       it('Returns selected parameter code', () => {
           expect(getSelectedParameterCode({
               hydrographState: {
                   selectedParameterCode: '00060'
               }
           })).toEqual('00060');
       });
    });


    describe('getInputsForRetrieval', () => {
        it('Return expected inputs when selectedDateRange is not custom', () => {
            expect(getInputsForRetrieval({
                hydrographState: {
                    showCompareIVData: false,
                    showMedianData: true,
                    selectedDateRange: 'P30D',
                    selectedCustomDateRange: null,
                    selectedParameterCode: '00060'
                }
            })).toEqual({
                parameterCode: '00060',
                period: 'P30D',
                startTime: null,
                endTime: null,
                loadCompare: false,
                loadMedian: true
            });
        });
        it('Return expects inputs when selectedDateRange is custom', () => {
            expect(getInputsForRetrieval({
                hydrographState: {
                    showCompareIVData: true,
                    showMedianData: false,
                    selectedDateRange: 'custom',
                    selectedCustomDateRange: {
                        start: '2021-02-01',
                        end: '2021-02-06'
                    },
                    selectedParameterCode: '00060'
                }
            })).toEqual({
                parameterCode: '00060',
                period: null,
                startTime: '2021-02-01T00:00:00.000-06:00',
                endTime: '2021-02-06T23:59:59.999-06:00',
                loadCompare: true,
                loadMedian: false
            });
        });
    });
});