import * as utils from 'ui/utils';

import {configureStore} from 'ml/store';
import {Actions} from 'ml/store/instantaneous-value-time-series-state';

import {getCursorOffset, getIVDataCursorPoints,  getIVDataTooltipPoints, getGroundwaterLevelCursorPoint,
    getGroundwaterLevelTooltipPoint} from './cursor';

let DATA = [12, 13, 14, 15, 16].map(hour => {
    return {
        dateTime: new Date(`2018-01-03T${hour}:00:00.000Z`).getTime(),
        qualifiers: ['P'],
        value: hour
    };
});
DATA = DATA.concat([
    {
        dateTime: 1514998800000,
        qualifiers: ['Fld', 'P'],
        value: null
    },
    {
        dateTime: 1515002400000,
        qualifiers: ['Mnt', 'P'],
        value: null
    }

]);


describe('monitoring-location/components/hydrograph/cursor module', () => {
    utils.mediaQuery = jest.fn().mockReturnValue(true);

    describe('getCursorOffset', () => {
        let store;
        beforeEach(() => {
            store = configureStore({
                hydrographState: {},
                ui: {
                    windowWidth: 1400,
                    width: 990
                }
            });
        });

        it('returns null when false', () => {
            store.dispatch(Actions.setIVGraphCursorOffset(false));
            expect(getCursorOffset(store.getState())).toBe(null);
        });

        it('returns last point when null', () => {
            store.dispatch(Actions.setIVGraphCursorOffset(null));
            const cursorRange = DATA[4].dateTime - DATA[0].dateTime;
            expect(getCursorOffset(store.getState())).toBe(cursorRange);
        });
    });

    describe('getTooltipPoints', () => {
        const id = (val) => val;

        it('should return the requested time series focus time', () => {
            expect(getTooltipPoints('current').resultFunc(id, id, {
                '00060:current': {
                    dateTime: '1date',
                    value: 1
                },
                '00060:compare': {
                    dateTime: '2date',
                    value: 2
                }
            })).toEqual([{
                x: '1date',
                y: 1
            }, {
                x: '2date',
                y: 2
            }]);
        });

        it('should exclude values that are infinite', () => {
            expect(getTooltipPoints('current').resultFunc(id, id, {
                '00060:current': {
                    dateTime: '1date',
                    value: Infinity
                },
                '00060:compare': {
                    dateTime: '2date',
                    value: 2
                }
            })).toEqual([{
                x: '2date',
                y: 2
            }]);
        });
    });

    describe('getGroundwaterLevelCursorPoint', () => {
        it('Return null if no groundwater levels are defined', () => {
            const testState = {
                ...TEST_STATE_THREE_VARS,
                ivTimeSeriesState: {
                    ...TEST_STATE_THREE_VARS.ivTimeSeriesState,
                    currentIVVariableID: '45807140',
                    ivGraphCursorOffset: 16 * 60 * 1000
                },
                discreteData: {}
            };
            expect(getGroundwaterLevelCursorPoint(testState)).toBeNull();
        });

        it('Return the expected nearest point', () => {
            const testState = {
                ...TEST_STATE_THREE_VARS,
                ivTimeSeriesState: {
                    ...TEST_STATE_THREE_VARS.ivTimeSeriesState,
                    currentIVVariableID: '45807140',
                    ivGraphCursorOffset: 16 * 60 * 1000
                }
            };

            expect(getGroundwaterLevelCursorPoint(testState)).toEqual({
                value: 20,
                qualifiers: [],
                dateTime: 1522347300000
            });
        });
    });

    describe('getGroundwaterLevelTooltipPoint', () => {
        const id = (val) => val;

        it('should return the requested time series focus time', () => {
            expect(getGroundwaterLevelTooltipPoint.resultFunc({
                dateTime: '1date',
                value: 1
            }, id, id)).toEqual({
                x: '1date',
                y: 1
            }, {
                x: '2date',
                y: 2
            });
        });
    });
});
