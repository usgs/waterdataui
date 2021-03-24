import config from 'ui/config';

import {TEST_PRIMARY_IV_DATA, TEST_MEDIAN_DATA, TEST_GW_LEVELS} from '../mock-hydrograph-state';
import {
    isVisible, hasVisibleIVData, hasVisibleGroundwaterLevels, hasVisibleMedianStatisticsData, hasAnyVisibleData,
    getTitle, getDescription, getPrimaryParameterUnitCode, getPreferredIVMethodID
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
                    points: [{value: 24.2, qualifiers: ['A'], dateTime: 1582560900000}],
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

describe('monitoring-location/components/hydrograph/selectors/time-series-data module', () => {
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

    describe('hasVisibleIVData', () => {
        it('return false if no data exists', () => {
            expect(hasVisibleIVData('primary')({
                hydrographData: {},
                hydrographState: {}
            })).toBe(false);
        });

        it('Return false if data has been selected but no data exists', () => {
            expect(hasVisibleIVData('compare')(TEST_STATE)).toBe(false);
        });

        it('return true if data is selected and visible', () => {
            expect(hasVisibleIVData('primary')(TEST_STATE)).toBe(true);
        });

        it('Return false if data is selected but no data points are available', () => {
            expect(hasVisibleIVData('primary')({
                ...TEST_STATE,
                hydrographState: {
                    ...TEST_STATE.hydrographState,
                    selectedIVMethodID: '69937'
                }
            })).toBe(false);
        });
    });

    describe('hasVisibleMedianStatisticsData', () => {
        it('Return false if no data is available', () => {
            expect(hasVisibleMedianStatisticsData({
                hydrographData: {},
                hydrographState: {}
            })).toBe(false);
        });

        it('Return false if median data is available for not selected for display', () => {
            expect(hasVisibleMedianStatisticsData({
                hydrographData: {
                    medianStatisticsData: TEST_MEDIAN_DATA
                },
                hydrographState: {
                    showMedianData: false
                }
            })).toBe(false);
        });

        it('Return false if no median data is available and but is selected for display', () => {
            expect(hasVisibleMedianStatisticsData({
                hydrographData: {
                    medianStatisticsData: {}
                },
                hydrographState: {
                    showMedianData: true
                }
            })).toBe(false);
        });

        it('return true if median data is available and it is selected for display', () => {
            expect(hasVisibleMedianStatisticsData({
                hydrographData: {
                    medianStatisticsData: TEST_MEDIAN_DATA
                },
                hydrographState: {
                    showMedianData: true
                }
            })).toBe(true);
        });
    });

    describe('hasVisibleGroundwaterLevels', () => {
        it('Return false if no data is available', () => {
            expect(hasVisibleGroundwaterLevels({
                hydrographData: {}
            })).toBe(false);
        });

        it('Return false if the data contains no points', () => {
            expect(hasVisibleGroundwaterLevels({
                hydrographData: {
                    groundwaterLevels: {
                        ...TEST_GW_LEVELS,
                        values: []
                    }
                }
            })).toBe(false);
        });

        it('Return true if the data contains points', () => {
            expect(hasVisibleGroundwaterLevels({
                hydrographData: {
                    groundwaterLevels: TEST_GW_LEVELS
                }
            })).toBe(true);
        });
    });

    describe('hasAnyVisibleData', () => {
        it('Expects to return true when data is available and visible', () => {
            expect(hasAnyVisibleData({
                hydrographData: {
                    primaryIVData: TEST_PRIMARY_IV_DATA
                },
                hydrographState: {
                    showCompareIVData: false,
                    showMedianData: true,
                    selectedIVMethodID: '90649'
                }
            })).toBe(true);
            expect(hasAnyVisibleData({
                hydrographData: {
                    groundwaterLevels: TEST_GW_LEVELS
                },
                hydrographState: {
                    showCompareIVData: false,
                    showMedianData: true
                }
            })).toBe(true);
            expect(hasAnyVisibleData({
                hydrographData: {
                    medianStatisticsData: TEST_MEDIAN_DATA
                },
                hydrographState: {
                    showCompareIVData: false,
                    showMedianData: true
                }
            })).toBe(true);
        });

        it('Expects to return false when no data is available', () => {
            expect(hasAnyVisibleData({
                hydrographData: {
                    primaryIVData: {
                        parameter: {
                            parameterCode: '72019'
                        },
                        values: {}
                    }
                },
                hydrographState: {
                    showCompareIVData: false,
                    showMedianData: true
                }
            })).toBe(false);

            expect(hasAnyVisibleData({
                hydrographData: {
                    primaryIVData: {
                        parameter: {
                            parameterCode: '72019'
                        },
                        values: {
                            '90649': {
                                points: [],
                                method: {
                                    methodID: '90649'
                                }
                            }
                        }
                    }
                },
                hydrographState: {
                    showCompareIVData: false,
                    showMedianData: true,
                    selectedIVMethodID: '90649'

                }
            })).toBe(false);
        });

        it('Expects to return false if data is available but not available', () => {
            expect(hasAnyVisibleData({
                hydrographData: {
                    primaryIVData: TEST_PRIMARY_IV_DATA
                },
                hydrographState: {
                    showCompareIVData: false,
                    showMedianData: true,
                    selectedIVMethodID: '252055'
                }
            })).toBe(false);
            expect(hasAnyVisibleData({
                hydrographData: {
                    medianStatisticsData: TEST_MEDIAN_DATA
                },
                hydrographState: {
                    showCompareIVData: false,
                    showMedianData: false
                }
            })).toBe(false);
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

        it('Return null if no values for primary hydrograph data', () => {
            expect(getPreferredIVMethodID({
                ...TEST_STATE,
                hydrographData: {
                    primaryIVData: {
                        parameter: {
                            parameterCode: '00030'
                        },
                        values: {}
                    }
                }
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
