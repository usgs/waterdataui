import * as utils from 'ui/utils';

import {getCursorOffset, getCursorTime, getIVDataCursorPoint,  getIVDataTooltipPoint, getGroundwaterLevelCursorPoint,
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

const TEST_IV_DATA = {
    parameter: {
        parameterCode: '00060'
    },
    values: {
        '90649': {
            points: DATA,
            method: {
                methodID: '90649'
            }
        }
    }
};

const TEST_GW_LEVELS = {
    parameter: {
        parameterCode: '00060'
    },
    values: [{
        value: 20.1,
        qualifiers: ['A'],
        dateTime: new Date('2018-01-03T13:00:00.000Z').getTime()
    }, {
        value: 18.3,
        qualifiers: ['A'],
        dateTime: new Date('2018-01-03T15:00:00.000Z').getTime()
    }]
};

const TEST_TIME_RANGE = {
    start: 1514980800000,
    end: 1515002400000
};


describe('monitoring-location/components/hydrograph/selectors/cursor module', () => {
    utils.mediaQuery = jest.fn().mockReturnValue(true);
    const TEST_STATE = {
        hydrographData: {
                currentTimeRange: TEST_TIME_RANGE,
                primaryIVData: TEST_IV_DATA
            },
            hydrographState: {
                selectedIVMethodID: '90649'
            },
            ui: {
                windowWidth: 1400,
                width: 990
            }
    };

    describe('getCursorOffset', () => {
        it('returns null when false', () => {
            const cursorRange = DATA[DATA.length - 1].dateTime - DATA[0].dateTime;
            expect(getCursorOffset({
                ...TEST_STATE,
                hydrographState: {
                    ...TEST_STATE.hydrographState,
                    graphCursorOffset: false
                }
            })).toBe(cursorRange);
        });

        it('returns the cursor offset if set', () => {
            expect(getCursorOffset({
                ...TEST_STATE,
                hydrographState: {
                    ...TEST_STATE.hydrographState,
                    graphCursorOffset: 25000000
                }
            })).toEqual(25000000);
        });
    });

    describe('getCursorTime', () => {
        it('returns last date if graphCursorOffset is not set', () => {
            expect(getCursorTime('current')(TEST_STATE)).toEqual(new Date(DATA[DATA.length - 1].dateTime));
        });

        it('Returns the epoch time where the cursor is', () => {
            expect(getCursorTime('current')({
                ...TEST_STATE,
                hydrographState: {
                    ...TEST_STATE.hydrographState,
                    graphCursorOffset: 25000000
                }
            })).toEqual(new Date(DATA[0].dateTime + 25000000));
        });
    });

    describe('getIVDataCursorPoint', () => {
        it('Return an null if no IV data', () => {
            expect(getIVDataCursorPoint('compare', 'prioryear')(TEST_STATE)).toBeNull();
        });

        it('Return the point nearest to the cursor when no brush offset', () => {
            expect(getIVDataCursorPoint('primary', 'current')({
                ...TEST_STATE,
                hydrographState: {
                    ...TEST_STATE.hydrographState,
                    graphCursorOffset: 7200000
                }
            })).toEqual({
                dateTime: 1514988000000,
                value: 14,
                approvalQualifier: undefined,
                maskedQualifier: undefined,
                class: 'provisional',
                isMasked: false,
                label: 'Provisional',
                dataKind: 'primary'
            });
        });

        it('Return the nearest point to the cursor when there is a brush offset', () => {
            expect(getIVDataCursorPoint('primary', 'current')({
                ...TEST_STATE,
                hydrographState: {
                    ...TEST_STATE.hydrographState,
                    graphCursorOffset: 1000,
                    graphBrushOffset: {
                        start: 10000000,
                        end: 0
                    }
                }
            })).toEqual({
                dateTime: 1514991600000,
                value: 15,
                approvalQualifier: undefined,
                maskedQualifier: undefined,
                class: 'provisional',
                isMasked: false,
                label: 'Provisional',
                dataKind: 'primary'
            });
        });
    });

    describe('getIVDataTooltipPoint', () => {
        it('Returns null if no iv data', () => {
            expect(getIVDataTooltipPoint('compare', 'prioryear')(TEST_STATE)).toBeNull();
        });

        it('Returns the expected point if cursor offset is set', () => {
            const point = getIVDataTooltipPoint('primary', 'current')({
                ...TEST_STATE,
                hydrographState: {
                    ...TEST_STATE.hydrographState,
                    graphCursorOffset: 7200000
                }
            });
            expect(point.x).toBeDefined();
            expect(point.y).toBeDefined();
        });
    });

    describe('getGroundwaterLevelCursorPoint', () => {
        it('Return null if no groundwater levels data', () => {
            expect(getGroundwaterLevelCursorPoint(TEST_STATE)).toBeNull();
        });

        it('Return nearest point when brush offset is null', () => {
            expect(getGroundwaterLevelCursorPoint({
                ...TEST_STATE,
                hydrographData: {
                    ...TEST_STATE.hydrographData,
                    groundwaterLevels: TEST_GW_LEVELS
                },
                hydrographState: {
                    ...TEST_STATE.hydrographState,
                    graphCursorOffset: 7200000
                }
            })).toEqual({
                value: 20.1,
                dateTime: 1514984400000
            });
        });

        it('Return nearest point brush offset is not null', () => {
            expect(getGroundwaterLevelCursorPoint({
                ...TEST_STATE,
                hydrographData: {
                    ...TEST_STATE.hydrographData,
                    groundwaterLevels: TEST_GW_LEVELS
                },
                hydrographState: {
                    ...TEST_STATE.hydrographState,
                    graphCursorOffset: 1000,
                    graphBrushOffset: {
                        start: 10000000,
                        end: 0
                    }
                }
            })).toEqual({
                value: 18.3,
                dateTime: 1514991600000
            });
        });
    });

    describe('getGroundwaterLevelTooltipPoint', () => {
        it('Return null when no ground water levels', () => {
            expect(getGroundwaterLevelTooltipPoint(TEST_STATE)).toBeNull();
        });

        it('Returns a point when ground water levels are defined', () => {
            const point = getGroundwaterLevelTooltipPoint({
                ...TEST_STATE,
                hydrographData: {
                    ...TEST_STATE.hydrographData,
                    groundwaterLevels: TEST_GW_LEVELS
                },
                hydrographState: {
                    ...TEST_STATE.hydrographState,
                    graphCursorOffset: 7200000
                }
            });
            expect(point.x).toBeDefined();
            expect(point.y).toBeDefined();
        });
    });
});
