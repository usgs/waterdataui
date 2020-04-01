import {getMainXScale, getBrushXScale, getMainYScale} from './scales';

describe('components/dailyValueHydrograph/selectors/scales', () => {
    const TEST_STATE = {
        observationsData: {
            timeSeries: {
                '12345' : {
                    type: 'Feature',
                    id: '12345',
                    properties: {
                        phenomenonTimeStart: '2010-01-01',
                        phenomenonTimeEnd: '2010-01-04',
                        timeStep: ['2010-01-01', '2010-01-02', '2010-01-03', '2010-01-04'],
                        result: ['4.5', '3.2', '4.6', '2.9']
                    }
                }
            }
        },
        observationsState: {
            currentTimeSeriesId: '12345'
        },
        ui: {
            windowWidth: 1024,
            width: 800
        }
    };
   fdescribe('getMainXScale', () => {
        it('Should have a default domain if no current time series is set', () => {
            expect(getMainXScale({
                ...TEST_STATE,
                observationsData: {},
                observationsState: {}
            }).domain()).toEqual([0, 1]);
            expect(getMainXScale({
                ...TEST_STATE,
                observationsState: {}
            }).domain()).toEqual([0, 1]);
        });

        it('Should have the expected domain if a current time series is set and no dvGraphBrushOffset', () => {
            expect(getMainXScale(TEST_STATE).domain()).toEqual([1262304000000, 1262563200000]);
        });

        it('Should have the expected domain if a current time series is set and dvGraphBrushOffset is set', () => {
            expect(getMainXScale({
                ...TEST_STATE,
                observationsState: {
                    ...TEST_STATE.observationsState,
                    dvGraphBrushOffset: {
                        start: 10000,
                        end: 50000
                    }
                }
            }).domain()).toEqual([1262304010000, 1262563150000]);
        });
   });

   fdescribe('getBrushXScale', () => {
       it('Should have a default domain if no current time series is set', () => {
            expect(getBrushXScale({
                ...TEST_STATE,
                observationsData: {},
                observationsState: {}
            }).domain()).toEqual([0, 1]);
            expect(getBrushXScale({
                ...TEST_STATE,
                observationsState: {}
            }).domain()).toEqual([0, 1]);
        });

        it('Should have the expected domain if a current time series is set and no dvGraphBrushOffset', () => {
            expect(getBrushXScale(TEST_STATE).domain()).toEqual([1262304000000, 1262563200000]);
        });

        it('Should have the expected domain if a current time series is set and dvGraphBrushOffset is set', () => {
            expect(getBrushXScale({
                ...TEST_STATE,
                observationsState: {
                    ...TEST_STATE.observationsState,
                    dvGraphBrushOffset: {
                        start: 10000,
                        end: 50000
                    }
                }
            }).domain()).toEqual([1262304000000, 1262563200000]);
        });
   });

   describe('getYScale', () => {
       it('Should have the default domain if no current time series is set', () => {
           expect(getMainYScale({
                ...TEST_STATE,
                observationsData: {},
                observationsState: {}
            }).domain()).toEqual([0, 1]);
       });

       it('Should have a domain where the first number is greater than the second (inverted)', () => {
           const result = getMainYScale(TEST_STATE).domain();

           expect(result[1]).toBeLessThan(result[0]);
       });

       it('Should have an extended domain', () => {
           const result = getMainYScale(TEST_STATE).domain();

           expect(result[1]).toBeLessThan(2.9);
           expect(result[0]).toBeGreaterThan(4.6);
       });

       it('Should not extend domain beyond zero', () =>  {
           const result = getMainYScale({
               ...TEST_STATE,
               observationsData: {
                   timeSeries: {
                       '12345': {
                           type: 'Feature',
                           id: '12345',
                           properties: {
                               phenomenonTimeStart: '2010-01-01',
                               phenomenonTimeEnd: '2010-01-04',
                               timeStep: ['2010-01-01', '2010-01-02', '2010-01-03', '2010-01-04'],
                               result: ['4.5', '3.2', '4.6', '0.1']
                           }
                       }
                   }
               }
           }).domain();

           expect(result[1]).toEqual(0);
       });
   });
});