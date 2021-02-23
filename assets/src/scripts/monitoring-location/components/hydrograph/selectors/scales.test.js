import {extent} from 'd3-array';
import {DateTime} from 'luxon';

import * as utils from 'ui/utils';

import {createXScale, createYScale, getGraphTimeRange, getMainYScale, getBrushYScale} from './scales';


describe('monitoring-location/components/hydrograph/selector/scales', () => {
    utils.mediaQuery = jest.fn().mockReturnValue(true);

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
        expect(xScale).toEqual(expect.any(Function));
        expect(yScale).toEqual(expect.any(Function));
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

    it('yScale deals with range [0,1] correctly', () => {
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
        const yScale72019 = createYScale('72019', [0, 20], 100);
        const yScale61055 = createYScale('61055', [0, 20], 100);
        const yScale99268 = createYScale('99268', [0, 20], 100);
        const yScale99269 = createYScale('99269', [0, 20], 100);
        const yScale72001 = createYScale('72001', [0, 20], 100);

        expect(yScale72019(5)).toEqual(25);
        expect(yScale61055(10)).toEqual(50);
        expect(yScale99268(15)).toEqual(75);
        expect(yScale99269(5)).toEqual(25);
        expect(yScale72001(15)).toEqual(75);
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

    describe('getGraphTimeRange', () => {
        const TEST_STATE = {
            hydrographData: {
                currentTimeRange: {
                    start: 1613511058824,
                    end: 1614115858824
                }
            },
            hydrographState: {
                graphBrushOffset: {
                    start: 10000000000,
                    end: 500000
                }
            }
        };

        it('If graph is BRUSH, the time range is always used the time range', () => {
            expect(getGraphTimeRange('BRUSH', 'current')(TEST_STATE)).toEqual(TEST_STATE.hydrographData.currentTimeRange);
        });

        it('If graph is MAIN and the brush offset is null the time range is the full range', () => {
            expect(getGraphTimeRange('MAIN', 'current')({
                ...TEST_STATE,
                hydrographState: {
                    ...TEST_STATE.hydrographState,
                    graphBrushOffset: null
                }
            })).toEqual(TEST_STATE.hydrographData.currentTimeRange);
        });

        it('If graph is main the time range will be the time range with the brush offset applied', () => {
            const state = TEST_STATE.hydrographState;
            expect(getGraphTimeRange('MAIN', 'current')(TEST_STATE)).toEqual({
                start: TEST_STATE.hydrographData.currentTimeRange.start + state.graphBrushOffset.start,
                end: TEST_STATE.hydrographData.currentTimeRange.end - state.graphBrushOffset.end
            });
        });
    });
});
