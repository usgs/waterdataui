import {extent} from 'd3-array';
import {DateTime} from 'luxon';
import {createXScale, createYScale, getMainYScale, getBrushYScale, getSecondaryYScale} from './scales';


describe('scales', () => {
    const timeZone = 'America/Los_Angeles';
    const points = Array(23).fill(0).map((_, hour) => {
        return {
            dateTime: DateTime.fromObject({
                year: 2017,
                month: 10,
                day: 10,
                hour: hour,
                zone: timeZone
            }).valueOf(),
            value: hour
        };
    });
    const yDomain = extent(points.map(p => p.value));
    const xDomain = {
        start: points[0].dateTime,
        end: points[points.length - 1].dateTime
    };
    const xScale = createXScale(xDomain, 200);
    const yScale = createYScale('00060', yDomain, 100);
    const yScaleLinear = createYScale('ABCDE', yDomain, 100);

    it('scales created', () => {
        expect(xScale).toEqual(jasmine.any(Function));
        expect(yScale).toEqual(jasmine.any(Function));
    });

    it('xScale domain is correct', () => {
        let domain = xScale.domain();
        expect(domain[0]).toEqual(xDomain.start);
        expect(domain[1]).toEqual(xDomain.end);
    });

    it('xScale range is correctly left-oriented', () => {
        let range = xScale.range();
        expect(range[0]).toEqual(0);
        expect(range[1]).toEqual(200);
    });

    it('yScale range is correctly right-oriented', () => {
        let range = yScale.range();
        expect(range[0]).toEqual(100);
        expect(range[1]).toEqual(0);
    });

    it('WDFN-66: yScale deals with range [0,1] correctly', () => {
        expect(yScale(1)).not.toBeNaN();
        expect(yScale(.5)).not.toBeNaN();
        expect(yScale(.999)).not.toBeNaN();
        expect(yScale(0)).not.toBeNaN();
    });

    it('Expect parameter code for discharge (00060) to use a symlog scale', () => {
        const log10 = yScale(10);
        const log100 = yScale(100);
        const log1000 = yScale(1000);

        const singleLog10 = yScale(10);
        const singleLog100 = yScale(100);
        const singleLog1000 = yScale(1000);

        // The difference between successive increases in order of magnitude in a log scale
        // should be the same. Use this to test that a log scale is used.
        // Add a '-1' for the precision of the test, meaning 'match to one place before the decimal point'
        expect(log10 - log100).toBeCloseTo(log100 - log1000, -1);
        expect(singleLog10 - singleLog100).toBeCloseTo(singleLog100 - singleLog1000, -1);
    });

    it('Expect yscale\'s for parameter code that should be reversed, are reversed', () => {
        const yScale72019 = createYScale('72109', [0, 20], 100);
        const yScale61055 = createYScale('61055', [0, 20], 100);
        const yScale99268 = createYScale('99268', [0, 20], 100);
        const yScale99269 = createYScale('99269', [0, 20], 100);
        const yScale72001 = createYScale('72001', [0, 20], 100);

        expect(yScale72019(5), 75);
        expect(yScale61055(10), 50);
        expect(yScale99268(15), 25);
        expect(yScale99269(0), 100);
        expect(yScale72001(100), 0);
    });

    it('Expect parameter code for not discharge to use a linear scale', () => {
        const linear10 = yScaleLinear(10);
        const linear20 = yScaleLinear(20);
        const linear30 = yScaleLinear(30);

        const singleLinear10 = yScaleLinear(10);
        const singleLinear20 = yScaleLinear(20);
        const singleLinear30 = yScaleLinear(30);

        expect(linear10 - linear20).toBeCloseTo(linear20 - linear30);
        expect(singleLinear10 - singleLinear20).toBeCloseTo(singleLinear20 - singleLinear30);
    });

    describe('getMainYScale', () => {

        it('Creates a scale when there is no initial data', () => {
            const STATE = {
                ivTimeSeriesData: {},
                statisticsData: {},
                ivTimeSeriesState: {
                    showIVTimeSeries: {
                        current: true,
                        compare: false,
                        median: false
                    },
                    currentVariableID: null
                },
                ui: {
                    width: 200,
                    windowWidth: 600
                }
            };
            expect(getMainYScale(STATE).name).toBe('scale');
            expect(getBrushYScale(STATE).name).toBe('scale');
        });

        it('Creates a scale when there is initial data', () => {
            const STATE = {
                ivTimeSeriesData: {
                    variables: {
                       '00060ID': {
                           variableCode: {
                               value: '00060'
                           }
                       }
                    },
                    timeSeries: {
                        '00060ID': {
                            variable: '00060ID',
                            points: []
                        }
                    }
                },
                statisticsData: {},
                ivTimeSeriesState: {
                    showIVTimeSeries: {
                        current: true,
                        compare: false
                    },
                    currentIVVariableID: '00060ID'
                },
                ui: {
                    width: 200,
                    windowWidth: 600
                }
            };
            expect(getMainYScale(STATE).name).toBe('scale');
            expect(getBrushYScale(STATE).name).toBe('scale');
        });
    });

    describe('getSecondaryYScale', () => {
        it('Returns null if a non-temperature parameter is selected', () => {
            expect(getSecondaryYScale()({
                ivTimeSeriesData: {
                    variables: {
                       '00060ID': {
                           variableCode: {
                               value: '00060'
                           }
                       }
                    },
                    timeSeries: {
                        '00060ID': {
                            variable: '00060ID',
                            points: []
                        }
                    }
                },
                statisticsData: {},
                ivTimeSeriesState: {
                    showIVTimeSeries: {
                        current: true,
                        compare: false
                    },
                    currentIVVariableID: '00060ID'
                },
                ui: {
                    width: 200,
                    windowWidth: 600
                }
            })).toBeNull();
        });

        it('Returns a scale if a celsius temperature parameter is selected', () => {
            const secondaryYScale = getSecondaryYScale()({
                ivTimeSeriesData: {
                    variables: {
                       '00010ID': {
                           variableCode: {
                               value: '00010'
                           }
                       }
                    },
                    timeSeries: {
                        '00010ID': {
                            variable: '00010ID',
                            points: []
                        }
                    }
                },
                statisticsData: {},
                ivTimeSeriesState: {
                    showIVTimeSeries: {
                        current: true,
                        compare: false
                    },
                    currentIVVariableID: '00010ID'
                },
                ui: {
                    width: 200,
                    windowWidth: 600
                }
            });
            expect(secondaryYScale.name).toBe('scale');
        });

        it('Returns a scale if a fahrenheit temperature parameter is selected', () => {
            const secondaryYScale = getSecondaryYScale()({
                ivTimeSeriesData: {
                    variables: {
                       '00011ID': {
                           variableCode: {
                               value: '00011'
                           }
                       }
                    },
                    timeSeries: {
                        '00011ID': {
                            variable: '00011ID',
                            points: []
                        }
                    }
                },
                statisticsData: {},
                ivTimeSeriesState: {
                    showIVTimeSeries: {
                        current: true,
                        compare: false
                    },
                    currentIVVariableID: '00011ID'
                },
                ui: {
                    width: 200,
                    windowWidth: 600
                }
            });
            expect(secondaryYScale.name).toBe('scale');
        });
    });
});
