import {getCurrentTimeSeriesDescription, getCurrentTimeSeriesYTitle, getCurrentTimeSeriesTitle} from './labels';

describe('components/daily-value-hydrograph/selectors/label module', () => {
    describe('getCurrentTimeSeriesDescription', () => {
        it('should return empty string if no current time series is defined', () => {
            expect(getCurrentTimeSeriesDescription({
                dailyValueTimeSeriesData: {},
                dailyValueTimeSeriesState: {}
            })).toBe('');
            expect(getCurrentTimeSeriesDescription({
                dailyValueTimeSeriesData: {
                    dvTimeSeries: {
                        '12345': {
                            type: 'Feature',
                            id: '12345',
                            properties: {
                                observedPropertyName: 'Water level, depth LSD',
                                samplingFeatureName: 'CT-SC 22 SCOTLAND'
                            }
                        }
                    }
                },
                dailyValueTimeSeriesState: {}
            })).toBe('');
        });

        it('should return the description string containing the observedPropertyName and samplingFeatureName', () => {
            const result = getCurrentTimeSeriesDescription({
                dailyValueTimeSeriesData: {
                    dvTimeSeries: {
                        '12345': {
                            type: 'Feature',
                            id: '12345',
                            properties: {
                                observedPropertyName: 'Water level, depth LSD',
                                samplingFeatureName: 'CT-SC 22 SCOTLAND'
                            }
                        }
                    }
                },
                dailyValueTimeSeriesState: {
                    currentDVTimeSeriesId: '12345'
                }
            });

            expect(result).toContain('Water level, depth LSD');
            expect(result).toContain('CT-SC 22 SCOTLAND');
        });
    });

    describe('getCurrentTimeSeriesYTitle', () => {
        it('should return empty string if no current time series is defined', () => {
            expect(getCurrentTimeSeriesYTitle({
                dailyValueTimeSeriesData: {},
                dailyValueTimeSeriesState: {}
            })).toBe('');
            expect(getCurrentTimeSeriesYTitle({
                dailyValueTimeSeriesData: {
                    dvTimeSeries: {
                        '12345': {
                            type: 'Feature',
                            id: '12345',
                            properties: {
                                observedPropertyName: 'Water level, depth LSD',
                                samplingFeatureName: 'CT-SC 22 SCOTLAND'
                            }
                        }
                    }
                },
                dailyValueTimeSeriesState: {}
            })).toBe('');
        });

        it('should return the description string containing the observedPropertyName and unitOfMeasureName', () => {
            const result = getCurrentTimeSeriesYTitle({
                dailyValueTimeSeriesData: {
                    dvTimeSeries: {
                        '12345': {
                            type: 'Feature',
                            id: '12345',
                            properties: {
                                observedPropertyName: 'Water level, depth LSD',
                                unitOfMeasureName: 'ft'
                            }
                        }
                    }
                },
                dailyValueTimeSeriesState: {
                    currentDVTimeSeriesId: '12345'
                }
            });

            expect(result).toContain('Water level, depth LSD');
            expect(result).toContain('ft');
        });
    });

    describe('getCurrentTimeSeriesTitle', () => {
        it('should return empty string if no current time series is defined', () => {
            expect(getCurrentTimeSeriesTitle({
                dailyValueTimeSeriesData: {},
                dailyValueTimeSeriesState: {}
            })).toBe('');
            expect(getCurrentTimeSeriesTitle({
                dailyValueTimeSeriesData: {
                    dvTimeSeries: {
                        '12345': {
                            type: 'Feature',
                            id: '12345',
                            properties: {
                                observedPropertyName: 'Water level, depth LSD',
                                samplingFeatureName: 'CT-SC 22 SCOTLAND'
                            }
                        }
                    }
                },
                dailyValueTimeSeriesState: {}
            })).toBe('');
        });

        it('should return the description string containing the observedPropertyName', () => {
            const result = getCurrentTimeSeriesYTitle({
                dailyValueTimeSeriesData: {
                    dvTimeSeries: {
                        '12345': {
                            type: 'Feature',
                            id: '12345',
                            properties: {
                                observedPropertyName: 'Water level, depth LSD'
                            }
                        }
                    }
                },
                dailyValueTimeSeriesState: {
                    currentDVTimeSeriesId: '12345'
                }
            });

            expect(result).toContain('Water level, depth LSD');
        });
    });
});