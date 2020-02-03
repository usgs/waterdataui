
import {hasObservationsTimeSeries, getTimeSeries} from './observations-selector';

describe('observations-selector', () => {
    describe('hasObservationsTimeSeries', () => {
        it('expect false if no timeSeries defined', () => {
            expect(hasObservationsTimeSeries('12345')({
                observationsData: {}
            })).toBe(false);
        });

        it('expect false if specific timeSeries is not defined', () => {
            expect(hasObservationsTimeSeries('12345')({
                observationsData : {
                    timeSeries: {}
                }
            })).toBe(false);
            expect(hasObservationsTimeSeries('12345')({
                observationsData : {
                    timeSeries: {
                        '11111': {
                            type: 'Feature',
                            id: '11111'
                        }
                    }
                }
            })).toBe(false);
        });

        it('expect true if specific timeSeries is defined', () => {
            expect(hasObservationsTimeSeries('12345')({
                observationsData : {
                    timeSeries: {
                        '11111': {
                            type: 'Feature',
                            id: '11111'
                        },
                        '12345' : {
                            type: 'Feature',
                            id: '12345'
                        }
                    }
                }
            })).toBe(true);
        });
    });

    describe('getTimeSeries', () => {
        it('expect empty object if timeSeries is not defined', () => {
            expect(getTimeSeries('12345')({
                observationsData : {}
            })).toEqual({});
            expect(getTimeSeries('12345')({
                observationsData: {
                    timeSeries: {
                        '11111': {
                            type: 'Feature',
                            id: '11111'
                        }
                    }
                }
            })).toEqual({});
        });

        it('expect object if timeSeries is defined', () => {
            expect(getTimeSeries('12345')({
                observationsData: {
                    timeSeries: {
                        '11111': {
                            type: 'Feature',
                            id: '11111'
                        },
                        '12345': {
                            type: 'Feature',
                            id: '12345'
                        }
                    }
                }
            })).toEqual({
                type: 'Feature',
                id: '12345'
            });
        });
    });
});