import config from 'ui/config';

import {
    isVisible, getTitle, getDescription, getPrimaryParameterUnitCode,
    getPreferredIVMethodID
}
    from './time-series-data';


const TEST_STATE = {
    hydrographData: {
        currentTimeRange: {
            start: 1613569918466,
            end: 1614174718466
        },
        primaryIVData: {
            parameter: {
                parameterCode:'00030',
                name: 'Dissolved oxygen, water, unfiltered, mg/L',
                description: 'Dissolved oxygen, water, unfiltered, milligrams per liter',
                unit: 'mg/l'
            },
            values: {
                '69937': {
                    points: [],
                    method: {
                        methodDescription: 'From multiparameter sonde, [Discontinued]',
                        methodID: '69937'
                    }
                },
                '252055': {
                    points: [],
                    method: {
                        methodDescription: 'From multiparameter sonde',
                        methodID: '252055'
                    }
                }
            }
        }
    },
    hydrographState: {
        showCompareIVData: false,
        showMedianData: false,
        selectedIVMethodID: '252055'
    }
};

describe('monitoring-location/components/hydrograph/time-series module', () => {
    config.locationTimeZone = 'America/Chicago';
    describe('isVisible', () => {
        it('Returns whether the time series is visible', () => {
            expect(isVisible('primary')(TEST_STATE)).toBe(true);
            expect(isVisible('compare')(TEST_STATE)).toBe(false);
            expect(isVisible('compare')({
                ...TEST_STATE,
                hydrographState: {
                    ...TEST_STATE.hydrographState,
                    showCompareIVData: true
                }
            })).toBe(true);
            expect(isVisible('median')(TEST_STATE)).toBe(false);
            expect(isVisible('median')({
                ...TEST_STATE,
                hydrographState: {
                    ...TEST_STATE.hydrographState,
                    showMedianData: true
                }
            })).toBe(true);
        });
    });

    describe('getTitle', () => {
        it('Returns an empty if no IV data exists', () => {
            expect(getTitle({
                hydrographData: {},
                hydrographState: {}
            })).toBe('');
        });

        it('Returns the parameter name if only one method is defined', () => {
            expect(getTitle({
                ...TEST_STATE,
                hydrographData: {
                    ...TEST_STATE.hydrographData,
                    primaryIVData: {
                        ...TEST_STATE.hydrographData.primaryIVData,
                        values: {
                            '252055': {
                                ...TEST_STATE.hydrographData.primaryIVData.values['252055']
                            }
                        }
                    }
                }
            })).toBe('Dissolved oxygen, water, unfiltered, mg/L');
        });

        it('Returns the parameter name with the method description if more than one method is defined', () => {
            expect(getTitle(TEST_STATE)).toBe('Dissolved oxygen, water, unfiltered, mg/L, From multiparameter sonde');
        });
    });

    describe('getDescription', () => {
        it('Returns an empty string if no IV data', () => {
            expect(getDescription({
                hydrographData: {}
            })).toBe('');
        });

        it('Returns the description of the primary parameter as well as the current time range', () => {
            expect(getDescription(TEST_STATE)).toBe(
                'Dissolved oxygen, water, unfiltered, milligrams per liter from 2/17/2021 7:51:58 AM -0600 to 2/24/2021 7:51:58 AM -0600');
        });

        it('Returns the description without time if current time range is missing', () => {
            expect(getDescription({
                ...TEST_STATE,
                hydrographData: {
                    primaryIVData: {
                        ...TEST_STATE.hydrographData.primaryIVData
                    }
                }
            })).toBe('Dissolved oxygen, water, unfiltered, milligrams per liter');
        });
    });

    describe('getPrimaryParameterUnitCode', () => {
        it('Return null if no primary IV data', () => {
            expect(getPrimaryParameterUnitCode({
                hydrographData: {}
            })).toBeNull();
        });

        it('Return unit code if primary IV data', () => {
            expect(getPrimaryParameterUnitCode(TEST_STATE)).toBe('mg/l');
        });
    });

    describe('getPreferredIVMethodID', () => {
        it('Return null if no hydrographData', () => {
            expect(getPreferredIVMethodID({
                hydrographData: {}
            })).toBeNull();
        });

        it('If all methods have no points return either methodID', () => {
            expect(['69937','252055'].includes(getPreferredIVMethodID(TEST_STATE))).toBe(true);
        });

        it('Return methodID for method that has points', () => {
            expect(getPreferredIVMethodID({
                hydrographData: {
                    ...TEST_STATE.hydrographData,
                    primaryIVData: {
                        ...TEST_STATE.hydrographData.primaryIVData,
                        values: {
                            ...TEST_STATE.hydrographData.primaryIVData.values,
                            '252055': {
                                ...TEST_STATE.hydrographData.primaryIVData.values['252055'],
                                points: [
                                    {value: 2, dateTime: 1583433900000},
                                    {value: 2.2, dateTime: 1583434800000}
                                ]
                            }
                        }
                    }
                }
            })).toEqual('252055');
        });

        it('Return methodID for method with the most points', () => {
            expect(getPreferredIVMethodID({
                hydrographData: {
                    ...TEST_STATE.hydrographData,
                    primaryIVData: {
                        ...TEST_STATE.hydrographData.primaryIVData,
                        values: {
                            ...TEST_STATE.hydrographData.primaryIVData.values,
                            '252055': {
                                ...TEST_STATE.hydrographData.primaryIVData.values['252055'],
                                points: [
                                    {value: 2, dateTime: 1583433900000},
                                    {value: 2.2, dateTime: 1583434800000}
                                ]
                            },
                            '69937': {
                                ...TEST_STATE.hydrographData.primaryIVData.values['69937'],
                                points: [{value: 3, dateTime: 1583433900000}]
                            }
                        }
                    }
                }
            })).toEqual('252055');
        });

        it('If the methods have the same number of points return one with later dateTime', () => {
            expect(getPreferredIVMethodID({
                hydrographData: {
                    ...TEST_STATE.hydrographData,
                    primaryIVData: {
                        ...TEST_STATE.hydrographData.primaryIVData,
                        values: {
                            ...TEST_STATE.hydrographData.primaryIVData.values,
                            '252055': {
                                ...TEST_STATE.hydrographData.primaryIVData.values['252055'],
                                points: [
                                    {value: 2, dateTime: 1583433900000},
                                    {value: 2.2, dateTime: 1583434800000}
                                ]
                            },
                            '69937': {
                                ...TEST_STATE.hydrographData.primaryIVData.values['69937'],
                                points: [
                                    {value: 3, dateTime: 1583433900000},
                                    {value: 2, dateTime: 1583434900000}
                                ]
                            }
                        }
                    }
                }
            })).toEqual('69937');
        });
    });
});
