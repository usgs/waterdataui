const { scaleLinear, scaleTime } = require('d3-scale');
const { select } = require('d3-selection');

const { provide } = require('../../lib/redux');

const { Actions, configureStore } = require('./store');
const { getNearestTime, tooltipFocusTimeSelector, tsDatumSelector,
    createTooltipText, createTooltipFocus } = require('./tooltip');

describe('Hydrograph tooltip module', () => {

    let data = [12, 13, 14, 15, 16].map(hour => {
        return {
            time: new Date(`2018-01-03T${hour}:00:00.000Z`),
            label: `label ${hour}`,
            value: hour
        };
    });

    describe('getNearestTime', () => {
        it('Return null if the length of the data array is less than two', function() {
            expect(getNearestTime([], data[0].time)).toBeNull();
            expect(getNearestTime([data[1]], data[0].time)).toBeNull();
        });

        it('return correct data points via getNearestTime' , () => {
            // Check each date with the given offset against the hourly-spaced
            // test data.
            function expectOffset(offset, side) {
                for (let [index, datum] of data.entries()) {
                    let expected;
                    if (side === 'left' || index === data.length - 1) {
                        expected = {datum, index};
                    } else {
                        expected = {datum: data[index + 1], index: index + 1};
                    }
                    let time = new Date(datum.time.getTime() + offset);
                    let returned = getNearestTime(data, time);

                    expect(returned.datum.time).toBe(expected.datum.time);
                    expect(returned.datum.index).toBe(expected.datum.index);
                }
            }

            let hour = 3600000;  // 1 hour in milliseconds

            // Check each date against an offset from itself.
            expectOffset(0, 'left');
            expectOffset(1, 'left');
            expectOffset(hour / 2 - 1, 'left');
            expectOffset(hour / 2, 'left');
            expectOffset(hour / 2 + 1, 'right');
            expectOffset(hour - 1, 'right');
        });
    });

    describe('tooltipFocusTimeSelector', () => {
        it('should return the requested time series focus time', () => {
            const currentTime = new Date('2018-02-12');
            const compareTime = new Date('2017-02-12');
            const state = {
                tooltipFocusTime: {
                    current: currentTime,
                    compare: compareTime
                }
            };

            expect(tooltipFocusTimeSelector('current')(state)).toEqual(currentTime);
            expect(tooltipFocusTimeSelector('compare')(state)).toEqual(compareTime);
        });
    });

    describe('tsDatumSelector', () => {
        it('Should return null if the focus time for the time series is null', function() {
            const thisTime = new Date('2018-02-12');
            let state = {
                tsData: {
                    current: {
                        '00060': {
                            values: data
                        }
                    },
                    compare: {
                        '00060': {
                            values: data
                        }
                    }
                },
                tooltipFocusTime: {
                    current: thisTime,
                    compare: null
                }
            };
            expect(tsDatumSelector('compare')(state)).toBeNull();

            state.tooltipFocusTime = {
                current: null,
                compare: thisTime
            };

            expect(tsDatumSelector('current')(state)).toBeNull();
        });

        it('Should return the nearest datum for the selected time series', function() {
            let state = {
                tsData: {
                    current: {
                        '00060': {
                            values: data
                        }
                    },
                    compare: {
                        '00060': {
                            values: data
                        }
                    }
                },
                tooltipFocusTime: {
                    current: new Date('2018-01-03T14:29:00.000Z'),
                    compare: new Date('2018-01-03T12:31:00.000Z')
                },
                currentParameterCode: '00060'
            };
            expect(tsDatumSelector('current')(state).value).toEqual(14);
            expect(tsDatumSelector('compare')(state).value).toEqual(13);
        });
    });

    describe('createTooltipText', () => {
        let svg;
        beforeEach(() => {
            svg = select('body').append('svg');
        });

        afterEach(() => {
            svg.remove();
        });

        it('Creates two text elements with empty text', () => {
            let store = configureStore({
                tsData: {
                    current: data,
                    compare: data
                },
                tooltipFocusTime: {
                    current: null,
                    compare: null
                }
            });

            svg.call(provide(store))
                .call(createTooltipText);
            const currentText = svg.selectAll('.current-tooltip-text');
            const compareText = svg.selectAll('.compare-tooltip-text');

            expect(svg.selectAll('text').size()).toBe(2);
            expect(currentText.size()).toBe(1);
            expect(compareText.size()).toBe(1);
            expect(currentText.html()).toEqual('');
            expect(compareText.html()).toEqual('');
        });

        it('Creates the text elements with the label for the focus times', () => {
            let store = configureStore({
                tsData: {
                    current: {
                        '00060': {
                            values: data
                        }
                    },
                    compare: {
                        '00060': {
                            values: data
                        }
                    }
                },
                tooltipFocusTime: {
                    current: new Date('2018-01-03T14:29:00.000Z'),
                    compare: new Date('2018-01-03T12:39:00.000Z')
                },
                currentParameterCode: '00060'
            });

            svg.call(provide(store))
                .call(createTooltipText);

            expect(svg.select('.current-tooltip-text').html()).toEqual('label 14');
            expect(svg.select('.compare-tooltip-text').html()).toEqual('label 13');
        });

        it('Text contents are updated when the store is provided with new focus times', () => {
            let store = configureStore({
                tsData: {
                    current: {
                        '00060': {
                            values: data
                        }
                    },
                    compare: {
                        '00060': {
                            values: data
                        }
                    }
                },
                tooltipFocusTime: {
                    current: new Date('2018-01-03T14:29:00.000Z'),
                    compare: new Date('2018-01-03T12:39:00.000Z')
                },
                currentParameterCode: '00060'
            });

            svg.call(provide(store))
                .call(createTooltipText);
            store.dispatch(Actions.setTooltipTime(new Date('2018-01-03T14:31:00.000Z'), null));

            expect(svg.select('.current-tooltip-text').html()).toEqual('label 15');
            expect(svg.select('.compare-tooltip-text').html()).toEqual('');
        });
    });

    describe('createTooltipFocus', () => {
        let svg, xScale, yScale, compareXScale, currentTsData, compareTsData,
            isCompareVisible;
        beforeEach(() => {
            svg = select('body').append('svg');

            xScale = scaleTime().
                range([0, 100]).
                domain([data[0].time, data[4].time]);
            yScale = scaleLinear().range([0, 100]).domain([12, 16]);
            let lastYearStart = new Date(data[0].time);
            let lastYearEnd = new Date(data[4].time);
            compareXScale = scaleTime().range([0, 100]).domain([
                    lastYearStart.setFullYear(data[0].time.getFullYear() - 1),
                    lastYearEnd.setFullYear(data[4].time.getFullYear() - 1)
                ]
            );
            currentTsData = data;
            compareTsData = [12, 13, 14, 15, 16].map(hour => {
                return {
                    time: new Date(`2017-01-03T${hour}:00:00.000Z`),
                    label: `label ${hour}`,
                    value: hour + 1
                };
            });
            isCompareVisible = false;
        });

        afterEach(() => {
            svg.remove();
        });

        it('Creates focus circles and lines that are not displayed', () => {
            let store = configureStore({
                tsData: {
                    current: currentTsData,
                    compare: compareTsData
                },
                tooltipFocusTime: {
                    current: null,
                    compare: null
                }
            });

            svg.call(provide(store)).
                call(createTooltipFocus, {
                    xScale,
                    yScale,
                    compareXScale,
                    currentTsData,
                    compareTsData,
                    isCompareVisible
                });

            expect(svg.selectAll('.focus-line').size()).toBe(1);
            expect(svg.selectAll('circle').size()).toBe(2);
            expect(svg.select('.focus:first-child').style('display')).toBe('none');
            expect(svg.select('.focus:nth-child(2)').style('display')).toBe('none');
            expect(svg.select('.focus:nth-child(3)').style('display')).toBe('none');
        });

        it('Focus circles and line are displayed if time is non null', () => {
            let store = configureStore({
                tsData: {
                    current: {
                        '00060': {
                            values: currentTsData
                        }
                    },
                    compare: {
                        '00060': {
                            values: compareTsData
                        }
                    }
                },
                tooltipFocusTime: {
                    current: new Date('2018-01-03T14:29:00.000Z'),
                    compare: new Date('2017-01-03T12:39:00.000Z')
                },
                currentParameterCode: '00060'
            });

            svg.call(provide(store)).
                call(createTooltipFocus, {
                    xScale,
                    yScale,
                    compareXScale,
                    currentTsData,
                    compareTsData,
                    isCompareVisible
                });

            expect(svg.select('.focus:first-child').style('display')).not.toBe('none');
            expect(svg.select('.focus:nth-child(2)').style('display')).not.toBe('none');
            expect(svg.select('.focus:nth-child(3)').style('display')).not.toBe('none');
        });
    });
});
