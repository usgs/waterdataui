import {getCurrentTimeSeriesDescription, getCurrentTimeSeriesYTitle, getCurrentTimeSeriesTitle} from './labels';

describe('components/dailyValueHydrograph/selectors/label module', () => {
    describe('getCurrentTimeSeriesDescription', () => {
        it('should return empty string if no current time series is defined', () => {
            expect(getCurrentTimeSeriesDescription({
                observationsData: {},
                observationsState: {}
            })).toBe('');
            expect(getCurrentTimeSeriesDescription({
                observationsData: {
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
                observationsState: {}
            })).toBe('');
        });

        it('should return the description string containing the observedPropertyName and samplingFeatureName', () => {
            const result = getCurrentTimeSeriesDescription({
                observationsData: {
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
                observationsState: {
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
                observationsData: {},
                observationsState: {}
            })).toBe('');
            expect(getCurrentTimeSeriesYTitle({
                observationsData: {
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
                observationsState: {}
            })).toBe('');
        });

        it('should return the description string containing the observedPropertyName and unitOfMeasureName', () => {
            const result = getCurrentTimeSeriesYTitle({
                observationsData: {
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
                observationsState: {
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
                observationsData: {},
                observationsState: {}
            })).toBe('');
            expect(getCurrentTimeSeriesTitle({
                observationsData: {
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
                observationsState: {}
            })).toBe('');
        });

        it('should return the description string containing the observedPropertyName', () => {
            const result = getCurrentTimeSeriesYTitle({
                observationsData: {
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
                observationsState: {
                    currentDVTimeSeriesId: '12345'
                }
            });

            expect(result).toContain('Water level, depth LSD');
        });
    });
});