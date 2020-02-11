import {getXScale, getYScale} from './scales';

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
   describe('getXScale', () => {
        it('should have a  default domain if no current time series is set', () => {
            expect(getXScale({
                ...TEST_STATE,
                observationsData: {},
                observationsState: {}
            }).domain()).toEqual([0, 1]);
            expect(getXScale({
                ...TEST_STATE,
                observationsState: {}
            }).domain()).toEqual([0, 1]);
        });

        it('should have the expected domain if a current time series is set', () => {
            expect(getXScale(TEST_STATE).domain()).toEqual([1262304000000, 1262563200000]);
        });
   });

   describe('getYScale', () => {
       it('should have the default domain if no current time series is set', () => {
           expect(getYScale({
                ...TEST_STATE,
                observationsData: {},
                observationsState: {}
            }).domain()).toEqual([0, 1]);
       });

       it('should have a domain where the first number is greater than the second (inverted)', () => {
           const result = getYScale(TEST_STATE).domain();

           expect(result[1]).toBeLessThan(result[0]);
       });

       it('should have an extended domain', () => {
           const result = getYScale(TEST_STATE).domain();

           expect(result[1]).toBeLessThan(2.9);
           expect(result[0]).toBeGreaterThan(4.6);
       });

       it('Should not extend domain beyond zero', () =>  {
           const result = getYScale({
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